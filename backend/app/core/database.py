from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Configure connect_args based on SSL requirements (for managed DBs like Neon)
connect_args = {}
if settings.is_db_ssl_required:
    connect_args["ssl"] = True

# Create async database engine
engine = create_async_engine(
    settings.async_database_url,
    echo=False,  # Set to True for debugging SQL queries
    future=True,
    connect_args=connect_args,
)

# Async session maker
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()

# DB Dependency injector
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
