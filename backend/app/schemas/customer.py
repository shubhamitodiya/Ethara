from pydantic import BaseModel, Field, EmailStr
from uuid import UUID
from datetime import datetime

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, examples=["John Doe"])
    email: EmailStr = Field(..., examples=["john.doe@example.com"])
    phone: str | None = Field(None, max_length=20, examples=["+1234567890"])
    address: str | None = Field(None, examples=["123 Main St, Anytown, USA"])

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    email: EmailStr | None = None
    phone: str | None = Field(None, max_length=20)
    address: str | None = None

class CustomerResponse(CustomerBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
