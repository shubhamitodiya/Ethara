from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from typing import List
from app.schemas.order_item import OrderItemCreate, OrderItemResponse
from app.schemas.customer import CustomerResponse

class OrderCreate(BaseModel):
    customer_id: UUID
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(PENDING|COMPLETED|CANCELLED)$")

class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    status: str
    total_amount: Decimal
    items: List[OrderItemResponse]
    customer: CustomerResponse | None = None
    created_at: datetime

    class Config:
        from_attributes = True
