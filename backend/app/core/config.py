from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Inventory & Order Management System"
    API_V1_STR: str = "/api/v1"
    
    # DB Configuration
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "inventory_db"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    
    # Allow overriding database url directly
    DATABASE_URL: str | None = None

    @property
    def async_database_url(self) -> str:
        if self.DATABASE_URL:
            # Enforce asyncpg scheme if postgresql:// or postgres:// was provided
            url = self.DATABASE_URL
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            
            # Clean off sslmode query parameter if present since asyncpg does not support it.
            if "sslmode" in url:
                from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
                parsed = urlparse(url)
                query_params = dict(parse_qsl(parsed.query))
                if "sslmode" in query_params:
                    del query_params["sslmode"]
                new_query = urlencode(query_params)
                url = urlunparse((
                    parsed.scheme,
                    parsed.netloc,
                    parsed.path,
                    parsed.params,
                    new_query,
                    parsed.fragment
                ))
            return url
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def is_db_ssl_required(self) -> bool:
        if self.DATABASE_URL:
            if "sslmode" in self.DATABASE_URL:
                return True
            if "neon.tech" in self.DATABASE_URL:
                return True
        return False

    class Config:
        import os
        case_sensitive = True
        env_file = ".env" if os.path.exists(".env") else "../.env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
