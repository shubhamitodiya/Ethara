import uuid
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models import Customer, Product, Order, OrderItem
from app.schemas.order import OrderCreate
from app.core.exceptions import InsufficientStockException, CustomerNotFoundException, ProductNotFoundException, OrderNotFoundException
from fastapi import HTTPException
from starlette.status import HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST

async def create_order(db: AsyncSession, order_in: OrderCreate) -> Order:
    # 1. Verify Customer exists
    customer_stmt = select(Customer).where(Customer.id == order_in.customer_id)
    customer_res = await db.execute(customer_stmt)
    customer = customer_res.scalar_one_or_none()
    if not customer:
        raise CustomerNotFoundException(str(order_in.customer_id))

    # 2. Check for duplicate products in the request
    product_ids = [item.product_id for item in order_in.items]
    if len(product_ids) != len(set(product_ids)):
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Duplicate product IDs in order items are not allowed"
        )

    # 3. Process database updates with SELECT FOR UPDATE locks
    product_stmt = (
        select(Product)
        .where(Product.id.in_(product_ids))
        .with_for_update()
    )
    product_res = await db.execute(product_stmt)
    products = {p.id: p for p in product_res.scalars().all()}

    # Verify all products requested actually exist in the DB
    for pid in product_ids:
        if pid not in products:
            raise ProductNotFoundException(str(pid))

    # Validate stock levels and deduct inventory
    order_items_to_create = []
    total_amount = Decimal("0.00")

    for item in order_in.items:
        product = products[item.product_id]
        if product.stock_quantity < item.quantity:
            raise InsufficientStockException(
                sku=product.sku,
                requested=item.quantity,
                available=product.stock_quantity
            )

        # Decrement stock count
        product.stock_quantity -= item.quantity

        # Compute costs
        item_total = product.price * item.quantity
        total_amount += item_total

        # Setup order item model
        order_item = OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        )
        order_items_to_create.append(order_item)

    # Create final Order model
    db_order = Order(
        customer_id=order_in.customer_id,
        status="PENDING",
        total_amount=total_amount,
        items=order_items_to_create
    )
    db.add(db_order)
    
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    # Refresh first
    await db.refresh(db_order)
    
    # Explicitly load all nested relations asynchronously to prevent MissingGreenlet errors
    stmt = (
        select(Order)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .where(Order.id == db_order.id)
    )
    result = await db.execute(stmt)
    return result.scalar_one()

async def update_order_status(db: AsyncSession, order_id: uuid.UUID, status: str) -> Order:
    # 1. Find Order
    stmt = select(Order).where(Order.id == order_id)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()
    if not order:
        raise OrderNotFoundException(str(order_id))

    if order.status == status:
        return order

    # 2. Lock and perform status change & stock adjustments
    product_ids = [item.product_id for item in order.items]

    if status == "CANCELLED" and order.status != "CANCELLED":
        # If cancelling a non-cancelled order, restore the stock
        prod_stmt = select(Product).where(Product.id.in_(product_ids)).with_for_update()
        prod_res = await db.execute(prod_stmt)
        products = {p.id: p for p in prod_res.scalars().all()}

        for item in order.items:
            product = products.get(item.product_id)
            if product:
                product.stock_quantity += item.quantity

    elif order.status == "CANCELLED" and status != "CANCELLED":
        # If restoring/re-activating a cancelled order, re-verify and re-deduct stock
        prod_stmt = select(Product).where(Product.id.in_(product_ids)).with_for_update()
        prod_res = await db.execute(prod_stmt)
        products = {p.id: p for p in prod_res.scalars().all()}

        for item in order.items:
            product = products.get(item.product_id)
            if not product or product.stock_quantity < item.quantity:
                raise InsufficientStockException(
                    sku=product.sku if product else "Unknown SKU",
                    requested=item.quantity,
                    available=product.stock_quantity if product else 0
                )
            product.stock_quantity -= item.quantity

    order.status = status

    try:
        await db.commit()
    except Exception:
        await db.rollback()
        raise

    await db.refresh(order)
    
    # Explicitly load all nested relations asynchronously to prevent MissingGreenlet errors
    stmt = (
        select(Order)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .where(Order.id == order.id)
    )
    result = await db.execute(stmt)
    return result.scalar_one()
