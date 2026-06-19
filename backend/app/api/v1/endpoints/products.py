from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from typing import List
from uuid import UUID

from app.api.deps import get_db
from app.models import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.core.exceptions import DuplicateSKUException, ProductNotFoundException

router = APIRouter()

@router.get("/low-stock", response_model=List[ProductResponse])
async def get_low_stock_products(
    threshold: int = 5,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).where(Product.stock_quantity <= threshold).order_by(Product.stock_quantity.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    db_product = Product(
        sku=product_in.sku,
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        stock_quantity=product_in.stock_quantity
    )
    try:
        db.add(db_product)
        await db.commit()
        await db.refresh(db_product)
        return db_product
    except IntegrityError:
        await db.rollback()
        raise DuplicateSKUException(product_in.sku)

@router.get("/", response_model=List[ProductResponse])
async def list_products(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).offset(skip).limit(limit).order_by(Product.sku.asc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/{id}", response_model=ProductResponse)
async def get_product(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).where(Product.id == id)
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise ProductNotFoundException(str(id))
    return product

@router.put("/{id}", response_model=ProductResponse)
async def update_product(
    id: UUID,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).where(Product.id == id)
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise ProductNotFoundException(str(id))
        
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
        
    try:
        await db.commit()
        await db.refresh(product)
        return product
    except IntegrityError:
        await db.rollback()
        raise DuplicateSKUException(product_in.sku)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).where(Product.id == id)
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    if not product:
        raise ProductNotFoundException(str(id))
    try:
        await db.delete(product)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product '{product.sku}' cannot be deleted because it is associated with existing order items."
        )
    return None
