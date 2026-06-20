# Ethara | Inventory & Order Management System

[![FastAPI Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React Frontend](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker Orchestration](https://img.shields.io/badge/Container-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

Ethara is a full-stack **Inventory & Order Management System** designed to help users track products, manage customer accounts, and process sales orders. It includes an asynchronous Python backend API (FastAPI), a relational database (PostgreSQL) for reliable storage, and a responsive web dashboard (React) for administration tasks.

---

## 1. Project Overview

The primary goal of Ethara is to provide a clean and reliable tool for managing stock levels and sales records. The application connects a web-based dashboard with a database backend to let users view real-time inventory metrics, register customer profiles, and process orders. It is designed to validate stock availability so that products cannot be oversold, keeping inventory levels and sales data accurate.

---

## 2. Features

*   📦 **Product Catalog**: Add, edit, view, and delete products. Each product track has a unique SKU, description, price, and current stock level.
*   👥 **Customer Directory**: Register and manage customer profiles including names, unique email addresses, phone numbers, and shipping addresses.
*   🛒 **Order Placement**: A checkout panel to place orders with multiple products, dynamically calculate totals, verify stock availability, and update inventory.
*   🔄 **Automatic Stock Adjustments**: Automatically deducts items from inventory upon order placement, and returns items back to stock if an order is cancelled.
*   📈 **Dashboard Metrics**: Quick-view cards summarizing total revenue, customer registry size, product catalog count, and a list of low-stock items (5 or fewer units remaining).

---

## 3. Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Backend** | **FastAPI (Python)** | High-performance, asynchronous web framework for building APIs. |
| **Database ORM** | **SQLAlchemy 2.0** | Asynchronous ORM mapping Python models to database tables. |
| **Validation** | **Pydantic v2** | Validates the schema and type of incoming API requests and responses. |
| **Migrations** | **Alembic** | Manages database table creation and updates. |
| **Frontend** | **React + Vite** | Creates a fast and responsive single-page web interface. |
| **Routing** | **React Router DOM** | Handles path navigation and active page layouts in the frontend. |
| **HTTP Client** | **Axios** | Integrates frontend pages with the backend API endpoints. |
| **Web Server** | **Nginx** | Serves the frontend static files and handles route redirects in production. |
| **Database** | **PostgreSQL 15** | Relational database to store structured data safely. |

---

## 4. Database Design

The database schema is relational and consists of four main tables with strict validation rules (constraints) to ensure data accuracy.

```
  [Customer] (1) -------> (N) [Order] (1) -------> (N) [OrderItem] (N) <------- (1) [Product]
```

### Tables Schema

1.  **Customers (`customers`)**:
    *   `id` (UUID, Primary Key): Unique identifier.
    *   `name` (String, Required): Customer's name.
    *   `email` (String, Unique, Indexed): Customer's unique email address.
    *   `phone` (String, Optional): Customer's phone number.
    *   `address` (Text, Optional): Customer's physical address.
    *   `created_at` (Timestamp): Record creation date.

2.  **Products (`products`)**:
    *   `id` (UUID, Primary Key): Unique identifier.
    *   `sku` (String, Unique, Indexed): Unique Stock Keeping Unit identifier.
    *   `name` (String, Required): Name of the product.
    *   `description` (Text, Optional): Details about the product.
    *   `price` (Decimal, Required): Product unit price (constrained to be $\ge 0.0$).
    *   `stock_quantity` (Integer, Required): Number of items in stock (constrained to be $\ge 0$).

3.  **Orders (`orders`)**:
    *   `id` (UUID, Primary Key): Unique identifier.
    *   `customer_id` (UUID, Foreign Key): Links the order to a customer.
    *   `total_amount` (Decimal): Total cost of the order.
    *   `status` (String): Order progress (`PENDING`, `COMPLETED`, or `CANCELLED`).
    *   `created_at` (Timestamp): Order placement time.

4.  **Order Items (`order_items`)**:
    *   `id` (UUID, Primary Key): Unique identifier.
    *   `order_id` (UUID, Foreign Key): Links the item to an order (cascades on delete).
    *   `product_id` (UUID, Foreign Key): Links the item to a product.
    *   `quantity` (Integer): Amount of product purchased (constrained to be $\ge 1$).
    *   `price` (Decimal): Purchase price of the product at checkout.

---

## 5. Inventory Management

The application maintains accurate stock levels during order processing:

*   **Validation**: The system validates stock availability before creating an order. If a customer requests more items than are currently in stock, the checkout process is stopped and an error is returned.
*   **Automatic Stock Updates**: Inventory is automatically updated when orders are placed. The requested quantities are subtracted from the product inventory.
*   **Transaction Safety**: Database operations (verifying stock, creating the order record, and saving items) are wrapped in a single database transaction. If any database write fails, the entire transaction is rolled back, preventing incorrect stock reductions.
*   **Order Cancellations**: If an order status changes to `CANCELLED`, the system automatically restores the product quantities back to the product's stock levels.
*   **Order Reactivations**: If a previously cancelled order is set back to `PENDING` or `COMPLETED`, the system validates stock availability again and deducts the inventory.

---

## 6. API Endpoints

All API endpoints are prefixed with `/api/v1`.

### Products (`/products`)
*   `GET /` - List all products.
*   `POST /` - Add a new product (validates unique SKU).
*   `GET /low-stock` - Fetch products with 5 or fewer items remaining.
*   `GET /{id}` - Get details of a single product.
*   `PUT /{id}` - Update product description, price, or stock levels.
*   `DELETE /{id}` - Remove a product (fails if the product is part of existing orders).

### Customers (`/customers`)
*   `GET /` - List all customers.
*   `POST /` - Register a new customer (validates unique email).
*   `GET /{id}` - Retrieve a customer's profile.
*   `PUT /{id}` - Update customer details.
*   `DELETE /{id}` - Remove a customer profile.

### Orders (`/orders`)
*   `POST /` - Place a new order with multiple items (triggers stock verification and deduction).
*   `GET /` - List all orders (pre-loads customer and product info).
*   `GET /{id}` - Retrieve details of a specific order.
*   `PUT /{id}/status` - Update an order's status, adjusting stock levels accordingly.

---

## 7. API Documentation

FastAPI automatically generates interactive API documentation. Once the backend is running, you can open:
*   **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs) (Allows you to send test requests directly to the API endpoints)
*   **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc) (A clean, reader-friendly documentation layout)

---

## 8. Docker Setup

### Local Development Setup (Hot Reload)
To run local development servers where changes in your files are reflected instantly inside the containers:
```bash
docker compose -f docker-compose.dev.yml up --build
```
*   **React Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
*   **FastAPI Backend (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
*   **PostgreSQL Database**: Port `5432` on localhost

### Production Setup
To build optimized bundles and run Nginx serving the static frontend:
```bash
docker compose up --build
```
*   **React Admin Panel**: [http://localhost](http://localhost) (Port 80)
*   **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)

---

## 9. Local Installation

### Prerequisites
*   **Python**: Version 3.11 or later
*   **Node.js**: Version 18 or later
*   **PostgreSQL**: Version 15 or later (running and configured)

### Step 1: Clone and Configure Environment Variables
Create a `.env` file in the root folder based on `.env.example`:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=inventory_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
VITE_API_URL=http://localhost:8000/api/v1
```

### Step 2: Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3.  Install backend dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run database migrations to set up tables:
    ```bash
    alembic upgrade head
    ```
5.  Start the FastAPI local server:
    ```bash
    uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
    ```

### Step 3: Frontend Setup
1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the React frontend development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 10. Deployment

This project is configured to make cloud deployments quick and straightforward:

### Database (Neon PostgreSQL)
1.  Register a project on [Neon.tech](https://neon.tech) and create a PostgreSQL database.
2.  Copy the connection URL.
3.  The backend is configured to automatically convert standard database URLs to the asynchronous format needed by our database driver.

### Backend (Render)
1.  Log in to [Render.com](https://render.com) and create a **Web Service**.
2.  Connect your Git repository.
3.  Configure settings:
    *   **Environment**: `Docker`
    *   **Docker Context**: `backend`
    *   **Dockerfile Path**: `Dockerfile`
4.  Add `DATABASE_URL` (your Neon database URL) as an environment variable.
5.  Migrations run automatically on startup when the container starts up.

### Frontend (Vercel)
1.  Create a project on [Vercel.com](https://vercel.com) and connect your Git repository.
2.  Select the `frontend` folder as the root directory.
3.  Choose **Vite** as the framework preset, set the build command to `npm run build`, and set the output directory to `dist`.
4.  Add `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://your-backend.onrender.com/api/v1`).
5.  Vercel uses the local `vercel.json` file inside the `frontend` folder to handle React Router client-side path refreshes.

---

## 11. Future Improvements

*   🔑 **User Authentication**: Add user accounts (admins/managers) with secure logins using JWT tokens.
*   🔍 **Search & Pagination**: Add search and paging filters to make lists easier to navigate when database records grow.
*   📧 **Stock Alerts**: Send email notifications or dashboard alerts to managers when inventory drops below warning thresholds.
*   📄 **Invoice PDF**: Add a button on the orders screen to generate and download PDF invoices for customers.
