from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from typing import List
from uuid import UUID

from app.api.deps import get_db
from app.models import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.core.exceptions import DuplicateEmailException, CustomerNotFoundException

router = APIRouter()

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_in: CustomerCreate,
    db: AsyncSession = Depends(get_db)
):
    db_customer = Customer(
        name=customer_in.name,
        email=customer_in.email,
        phone=customer_in.phone,
        address=customer_in.address
    )
    try:
        db.add(db_customer)
        await db.commit()
        await db.refresh(db_customer)
        return db_customer
    except IntegrityError:
        await db.rollback()
        raise DuplicateEmailException(customer_in.email)

@router.get("/", response_model=List[CustomerResponse])
async def list_customers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Customer).offset(skip).limit(limit).order_by(Customer.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/{id}", response_model=CustomerResponse)
async def get_customer(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Customer).where(Customer.id == id)
    res = await db.execute(stmt)
    customer = res.scalar_one_or_none()
    if not customer:
        raise CustomerNotFoundException(str(id))
    return customer

@router.put("/{id}", response_model=CustomerResponse)
async def update_customer(
    id: UUID,
    customer_in: CustomerUpdate,
    db: AsyncSession = Depends(get_db)
):
    # Fetch first
    stmt = select(Customer).where(Customer.id == id)
    res = await db.execute(stmt)
    customer = res.scalar_one_or_none()
    if not customer:
        raise CustomerNotFoundException(str(id))
        
    update_data = customer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
        
    try:
        await db.commit()
        await db.refresh(customer)
        return customer
    except IntegrityError:
        await db.rollback()
        raise DuplicateEmailException(customer_in.email)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(
    id: UUID,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Customer).where(Customer.id == id)
    res = await db.execute(stmt)
    customer = res.scalar_one_or_none()
    if not customer:
        raise CustomerNotFoundException(str(id))
    await db.delete(customer)
    await db.commit()
    return None
