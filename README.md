# Ethara | Inventory & Order Management System

[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker Orchestration](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

A robust, enterprise-grade **Inventory & Order Management System** built to solve transaction concurrency and stock allocation safety at scale. Featuring an asynchronous FastAPI Python backend, a clean PostgreSQL relational database, and a routed React (Vite) single-page administration panel.

---

## 🏗️ Architectural Design & Safety Controls

In multi-user order management databases, concurrency anomalies (such as **double-allocation** or **overselling**) occur when two customers attempt to purchase the final unit of a product simultaneously. 

This project solves inventory race conditions using **Pessimistic Concurrency Locking**:
1. **Transactional Block**: When an order request is received, the service opens an isolated transactional block.
2. **Row Locking (`SELECT FOR UPDATE`)**: It queries target products using database locks. This blocks concurrent operations from reading/writing the target rows until the current transaction commits or rolls back.
3. **Integrity Checks**: Validates SKU quantity parameters. If checks pass, it decrements stock, records the order and snapshot line prices, and commits the transaction (releasing row locks).
4. **Status Cancellations**: If an order status changes to `CANCELLED`, product locks are acquired and quantities are atomically restored back to inventory.

---

## 🚀 Key Features

*   📦 **Product Catalog**: Manage unique SKUs, descriptions, pricing, and live inventory levels. Includes non-negative constraints on pricing/stock counts.
*   👥 **Customer Directory**: Profile registration capturing unique emails, phone numbers, and physical addresses.
*   🛒 **Transactional Order Checkout**: Custom purchase screen to register multiple items under a customer, calculate invoicing totals dynamically, check stock levels, and deduct inventory atomically.
*   📈 **Real-Time KPI Dashboard**: Summarizes total revenue, SKU catalogs, active customer registry, and low-stock warning panels (stock level $\le$ 5).
*   🌐 **SPA Client Routing**: Configured with React Router and served via production Nginx with fallback overrides (`try_files`) to handle page refreshes.

---

## 💻 Tech Stack

| Layer | Technology | Key Highlights |
|---|---|---|
| **Backend** | **FastAPI (Python)** | Async execution, automatic OpenAPI Swagger documentation. |
| **ORM** | **SQLAlchemy 2.0** | Asynchronous driver mapping (`asyncpg`) and selectin loading. |
| **Schemas** | **Pydantic v2** | Strict types validation and request serialization. |
| **Migrations** | **Alembic** | Managed database schema upgrade scripts. |
| **Frontend** | **React + Vite** | Lightweight SPA, fast compilation via Vite, clean styled CSS variables. |
| **Routing** | **React Router DOM** | Page-level navigation routes and active link states. |
| **HTTP client** | **Axios** | Standard API integration with loading flags and alert catchers. |
| **Web Server** | **Nginx** | Serving static assets in production with SPA fallback route configurations. |
| **Database** | **PostgreSQL 15** | Relational data persistence with transactional integrity constraints. |

---

## 🔧 Environment Variables Configuration

The application loads configuration parameters from a `.env` file at runtime (or from system environment variables). Create a `.env` file in the project root based on `.env.example`:

| Environment Variable | Target Component | Default Value | Description |
|---|---|---|---|
| `POSTGRES_USER` | Database / Backend | `postgres` | Username for the PostgreSQL database connection. |
| `POSTGRES_PASSWORD` | Database / Backend | `postgres` | Password for the PostgreSQL database connection. |
| `POSTGRES_DB` | Database / Backend | `inventory_db` | Name of the default database instance. |
| `POSTGRES_HOST` | Backend | `db` | Host address of the database (use `db` in Docker, `localhost` for local run). |
| `POSTGRES_PORT` | Backend | `5432` | Port on which PostgreSQL is running. |
| `DATABASE_URL` | Backend | *(Derived)* | Complete connection string. Overrides host/credentials if defined. |
| `PROJECT_NAME` | Backend | `Inventory & Order Management System` | Title metadata used in FastAPI OpenAPI docs. |
| `API_V1_STR` | Backend | `/api/v1` | Root API route prefix for all routers. |
| `VITE_API_URL` | Frontend | `http://localhost:8000/api/v1` | Endpoint URL the frontend uses to contact the backend service. |

---

## 📡 API Endpoints Specification

All backend endpoints are prefixed with `/api/v1`. Error responses follow a unified structured payload layout: `{"success": false, "error": {"code": "ERROR_CODE", "message": "Reason"}}`.

### Interactive API Documentation
When running the backend, interactive Swagger API specs can be viewed at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Endpoint Summary
*   **Products (`/products`)**:
    *   `GET /` - List all products.
    *   `POST /` - Register new product (validates unique SKU; returns `409 Conflict` on duplicates).
    *   `GET /low-stock` - Fetch products with stock count $\le$ threshold.
    *   `GET /{id}` - Fetch single product metadata.
    *   `PUT /{id}` - Update product description, pricing, or stock.
    *   `DELETE /{id}` - Remove product (raises `409 Conflict` if product is referenced in orders).
*   **Customers (`/customers`)**:
    *   `GET /` - List customer directory.
    *   `POST /` - Register new customer (validates unique email; returns `409 Conflict` on duplicates).
    *   `GET /{id}` - Retrieve customer profile details.
    *   `PUT /{id}` - Modify customer profile details.
    *   `DELETE /{id}` - Remove customer profile.
*   **Orders (`/orders`)**:
    *   `POST /` - Place purchase order (triggers database transactional stock check; returns `400 Bad Request` if stock is insufficient).
    *   `GET /` - List order logs (pre-loads customer and item relations).
    *   `GET /{id}` - Fetch order summary details by ID.
    *   `PUT /{id}/status` - Modify status (handles stock deduction or cancellation restorations).

---

## 🐳 Docker Container Orchestration

### Local Development Setup (Hot Reload)
To run hot-reload servers locally (which maps your local folders into the containers so code edits reflect immediately):
```bash
docker compose -f docker-compose.dev.yml up --build
```
- **React Frontend**: [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: Port `5432` on localhost

### Production Setup
To build optimized bundles and run Nginx serving the static frontend on port 80:
```bash
docker compose up --build
```
- **React Admin Panel**: [http://localhost](http://localhost) (Port 80)
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)

---

## 💻 Local Installation (Without Docker)

### 1. Prerequisites
- **Python**: v3.11 or later
- **Node.js**: v18 or later
- **PostgreSQL**: v15 or later (running and configured)

### 2. Backend Services
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and source a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the backend root containing database connection credentials (see `.env.example`).
5. Run the migrations to bootstrap tables:
   ```bash
   alembic upgrade head
   ```
6. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

### 3. Frontend Services
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Run the Vite local development server:
   ```bash
   npm run dev
   ```
4. Access the client panel at [http://localhost:5173](http://localhost:5173).

---

## 🚀 Cloud Production Deployment Guidelines

The project is structured to make cloud deployments to standard platforms seamless:

### 1. Database Setup (Neon PostgreSQL)
1. Register a project on [Neon.tech](https://neon.tech) and create a PostgreSQL database.
2. Obtain the connection string (with the pooled or standard endpoint).
3. The connection string provided by Neon usually starts with `postgres://`. The backend has been engineered to automatically process and rewrite this to the asynchronous `postgresql+asyncpg://` schema required by our SQLAlchemy driver.

### 2. Backend Setup (Render)
1. Log in to [Render](https://render.com) and create a new **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Environment**: Select `Docker`.
   - **Docker Context**: `backend`
   - **Dockerfile Path**: `Dockerfile`
4. Set the necessary environment variables in Render's dashboard:
   - `DATABASE_URL`: *(Your Neon PostgreSQL connection string)*
   - `PROJECT_NAME`: `Ethara Inventory System`
   - `API_V1_STR`: `/api/v1`
5. Alembic migrations run automatically on container startup during deployment via `entrypoint.sh`.

### 3. Frontend Setup (Vercel)
1. Log in to [Vercel](https://vercel.com) and create a **New Project**.
2. Connect your Git repository and select the `frontend` folder as the root directory.
3. In **Build & Development Settings**, configure:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: *(Your production Render backend URL, e.g., `https://ethara-backend.onrender.com/api/v1`)*
5. Vercel automatically reads the local `vercel.json` file inside the `frontend` folder to handle React Router client-side path overrides on route reloads.
