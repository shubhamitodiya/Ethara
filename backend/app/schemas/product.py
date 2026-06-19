from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=50, examples=["PROD-001"])
    name: str = Field(..., min_length=1, max_length=255, examples=["Premium Widget"])
    description: str | None = Field(None, examples=["A high quality widget"])
    price: Decimal = Field(..., gt=Decimal("0.0"), decimal_places=2, examples=["19.99"])
    stock_quantity: int = Field(..., ge=0, examples=[100])

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: str | None = Field(None, min_length=1, max_length=50)
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(None, gt=Decimal("0.0"), decimal_places=2)
    stock_quantity: int | None = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
