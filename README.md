# Product Management System

 Node.js + Express + MySQL product manager with HTML/CSS frontend, JWT-secured login, CRUD APIs, and a summary report.

## Prerequisites
- Node.js 18+
- MySQL 8+

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment template and set values:
   ```bash
   cp .env.example .env
   ```
   Fill `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET`.
3. (Option A) Use Docker for MySQL:
   ```bash
   docker compose up -d db
   ```
   The container exposes MySQL on port 3306 and seeds from `db/schema.sql`.

4. (Option B) Use a local MySQL instance:
   ```bash
   mysql -u <user> -p < db/schema.sql
   ```

5. Start the server:
   ```bash
   npm run dev
   ```
   The app serves the frontend at http://localhost:3000.

## Default login
- Email: `admin@example.com`
- Password: `admin123`

## API overview
- `POST /api/login` – Returns JWT for valid credentials.
- `GET /api/products` – List products (auth required).
- `POST /api/products` – Create product (auth required).
- `PUT /api/products/:id` – Update product (auth required).
- `DELETE /api/products/:id` – Delete product (auth required).
- `GET /api/reports/summary` – Returns counts and totals (auth required).

## Notes
- The schema file at `db/schema.sql` also inserts a default admin user and sample products.
- Update the default password hash if you change the admin password.
- The sample file [.env.example](.env.example) matches the docker-compose defaults: `DB_HOST=127.0.0.1`, `DB_USER=appuser`, `DB_PASSWORD=apppass`, `DB_NAME=product_management`.
