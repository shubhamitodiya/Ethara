import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("app.exceptions")

# --- Custom Exception Definitions ---

class InsufficientStockException(Exception):
    def __init__(self, sku: str, requested: int, available: int):
        self.sku = sku
        self.requested = requested
        self.available = available
        self.message = f"Insufficient stock for SKU '{sku}'. Requested {requested}, but only {available} available."
        super().__init__(self.message)

class ProductNotFoundException(Exception):
    def __init__(self, product_id_or_sku: str):
        self.product_id_or_sku = product_id_or_sku
        self.message = f"Product '{product_id_or_sku}' was not found."
        super().__init__(self.message)

class CustomerNotFoundException(Exception):
    def __init__(self, customer_id: str):
        self.customer_id = customer_id
        self.message = f"Customer with ID '{customer_id}' was not found."
        super().__init__(self.message)

class OrderNotFoundException(Exception):
    def __init__(self, order_id: str):
        self.order_id = order_id
        self.message = f"Order with ID '{order_id}' was not found."
        super().__init__(self.message)

class DuplicateSKUException(Exception):
    def __init__(self, sku: str):
        self.sku = sku
        self.message = f"Product with SKU '{sku}' already exists."
        super().__init__(self.message)

class DuplicateEmailException(Exception):
    def __init__(self, email: str):
        self.email = email
        self.message = f"Customer with email '{email}' already exists."
        super().__init__(self.message)

# --- Standard JSON Error Helper ---

def make_error_response(code: str, message: str, details: dict = None, status_code: int = 400) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "details": details or {}
            }
        }
    )

# --- Registration Hook ---

def setup_exception_handlers(app: FastAPI) -> None:
    
    @app.exception_handler(InsufficientStockException)
    async def insufficient_stock_handler(request: Request, exc: InsufficientStockException):
        return make_error_response(
            code="INSUFFICIENT_STOCK",
            message=exc.message,
            details={
                "sku": exc.sku,
                "requested": exc.requested,
                "available": exc.available
            },
            status_code=status.HTTP_400_BAD_REQUEST
        )

    @app.exception_handler(ProductNotFoundException)
    async def product_not_found_handler(request: Request, exc: ProductNotFoundException):
        return make_error_response(
            code="PRODUCT_NOT_FOUND",
            message=exc.message,
            status_code=status.HTTP_404_NOT_FOUND
        )

    @app.exception_handler(CustomerNotFoundException)
    async def customer_not_found_handler(request: Request, exc: CustomerNotFoundException):
        return make_error_response(
            code="CUSTOMER_NOT_FOUND",
            message=exc.message,
            status_code=status.HTTP_404_NOT_FOUND
        )

    @app.exception_handler(OrderNotFoundException)
    async def order_not_found_handler(request: Request, exc: OrderNotFoundException):
        return make_error_response(
            code="ORDER_NOT_FOUND",
            message=exc.message,
            status_code=status.HTTP_404_NOT_FOUND
        )

    @app.exception_handler(DuplicateSKUException)
    async def duplicate_sku_handler(request: Request, exc: DuplicateSKUException):
        return make_error_response(
            code="DUPLICATE_SKU",
            message=exc.message,
            details={"sku": exc.sku},
            status_code=status.HTTP_409_CONFLICT
        )

    @app.exception_handler(DuplicateEmailException)
    async def duplicate_email_handler(request: Request, exc: DuplicateEmailException):
        return make_error_response(
            code="DUPLICATE_EMAIL",
            message=exc.message,
            details={"email": exc.email},
            status_code=status.HTTP_409_CONFLICT
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        formatted_errors = []
        for error in exc.errors():
            formatted_errors.append({
                "location": error.get("loc", []),
                "message": error.get("msg", ""),
                "type": error.get("type", "")
            })
        return make_error_response(
            code="VALIDATION_ERROR",
            message="One or more request parameters failed validation constraints.",
            details={"errors": formatted_errors},
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandle exception caught by middleware: %s", exc)
        return make_error_response(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred on the server.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
