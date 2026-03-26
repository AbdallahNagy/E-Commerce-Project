# E-Commerce REST API

A production-ready RESTful API for a full-featured e-commerce platform, built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. It covers the complete shopping lifecycle — from user authentication and product browsing through cart management, order fulfillment, and post-purchase reviews.

## Features

- **Authentication & Authorization** — JWT-based auth with role-based access control (`user` / `admin`)
- **Product Catalog** — Full CRUD with category filtering, price range filtering, full-text search, sorting, and pagination
- **Shopping Cart** — Per-user persistent cart with real-time stock validation
- **Orders** — Checkout directly from cart, automatic stock adjustment, order status lifecycle, and cancellation support
- **Reviews** — Verified-purchase-only reviews with automatic product rating recalculation
- **Input Validation** — Request validation via `express-validator` on all mutating endpoints
- **Error Handling** — Centralized error middleware with structured JSON error responses

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | MongoDB + Mongoose 9 |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Password hashing | bcryptjs |
| Validation | express-validator |
| Logging | morgan |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/AbdallahNagy/E-Commerce-Project.git
cd E-Commerce-Project

# Install dependencies
npm install
```

### Configuration

Create a `config.env` file in the root directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

The server will start on `http://localhost:5000`.

## API Documentation

Full endpoint reference with request/response examples:

👉 **[API Documentation](docs/API.md)**

## Project Structure

```
src/
├── config/         # Database connection
├── controllers/    # Route handler logic
├── middleware/     # Auth, validation, error handling
├── models/         # Mongoose schemas & models
├── routes/         # Express routers
├── types/          # TypeScript type extensions
└── utils/          # Shared utilities (ApiError)
```

## License

ISC
