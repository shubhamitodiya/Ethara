FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for libraries compiling
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source files
COPY . .
COPY entrypoint.sh /entrypoint.sh

# Make entrypoint script executable
RUN chmod +x /entrypoint.sh

# Create a non-privileged system user for production security compliance
RUN groupadd -r -g 1000 appgroup && \
    useradd -r -u 1000 -g appgroup appuser && \
    chown -R appuser:appgroup /app

USER appuser

# Expose server port
EXPOSE 8000

# Execute migrations and boot application server
ENTRYPOINT ["/entrypoint.sh"]
