from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.api.deps import get_db
from app.models import Order, OrderItem
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.services import order_service
from app.core.exceptions import OrderNotFoundException

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db)
):
    return await order_service.create_order(db, order_in)

@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Order)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .offset(skip)
        .limit(limit)
        .order_by(Order.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/{id}", response_model=OrderResponse)
async def get_order(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Order)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .where(Order.id == id)
    )
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()
    if not order:
        raise OrderNotFoundException(str(id))
    return order

@router.put("/{id}/status", response_model=OrderResponse)
async def update_order_status(
    id: UUID,
    status_update: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await order_service.update_order_status(db, id, status_update.status)
