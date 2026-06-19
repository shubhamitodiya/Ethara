from pydantic import BaseModel, Field
from uuid import UUID
from decimal import Decimal
from app.schemas.product import ProductResponse

class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int = Field(..., ge=1, examples=[2])

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: UUID
    price: Decimal
    product: ProductResponse | None = None

    class Config:
        from_attributes = True
