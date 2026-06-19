#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run database migrations before starting application server
echo "Running database migrations via Alembic..."
alembic upgrade head || echo "Database migrations failed or already up to date, continuing startup..."

# Start application server with multiple Uvicorn workers
echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
