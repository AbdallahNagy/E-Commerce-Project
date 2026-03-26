# API Reference

Base URL: `http://localhost:5000/api`

All responses follow a consistent shape:

```json
{ "success": true, "data": { ... } }
```

Error responses:

```json
{ "success": false, "message": "Description of the error" }
```

Validation error responses (400):

```json
{ "success": false, "errors": [{ "msg": "...", "path": "fieldName" }] }
```

---

## Authentication

Protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Tokens are returned by the **Register** and **Login** endpoints.

---

## Table of Contents

1. [Auth](#1-auth)
2. [Users](#2-users) *(admin only)*
3. [Categories](#3-categories)
4. [Products](#4-products)
5. [Cart](#5-cart)
6. [Orders](#6-orders)
7. [Reviews](#7-reviews)

---

## 1. Auth

### Register

`POST /auth/register`

Creates a new user account and returns a JWT.

**Request Body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✅ | Non-empty |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Min 6 characters |

**Example Request**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Example Response** `201 Created`

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "664a1b2c3d4e5f6a7b8c9d0e",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

---

### Login

`POST /auth/login`

Authenticates an existing user and returns a JWT.

**Request Body**

| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Example Request**

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Example Response** `200 OK`

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "664a1b2c3d4e5f6a7b8c9d0e",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

---

### Get Current User

`GET /auth/me` 🔒 *Requires auth*

Returns the profile of the currently authenticated user.

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "664a1b2c3d4e5f6a7b8c9d0e",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "address": {}
  }
}
```

---

## 2. Users

> All users endpoints require admin privileges (`role: "admin"`).

### Get All Users

`GET /users` 🔒 *Admin only*

**Example Response** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "data": [
    { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "user" },
    { "_id": "...", "name": "Admin", "email": "admin@example.com", "role": "admin" }
  ]
}
```

---

### Get Single User

`GET /users/:id` 🔒 *Admin only*

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "user", "address": {} }
}
```

---

### Update User

`PUT /users/:id` 🔒 *Admin only*

Updates user fields. Password changes are ignored through this endpoint.

**Request Body** *(all fields optional)*

```json
{
  "name": "Jane Smith",
  "role": "admin",
  "address": {
    "street": "123 Main St",
    "city": "Cairo",
    "state": "Cairo Governorate",
    "zip": "11511",
    "country": "Egypt"
  }
}
```

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "name": "Jane Smith", "role": "admin" }
}
```

---

### Delete User

`DELETE /users/:id` 🔒 *Admin only*

**Example Response** `200 OK`

```json
{ "success": true, "data": null }
```

---

## 3. Categories

### Get All Categories

`GET /categories`

Public. Returns all categories.

**Example Response** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "data": [
    { "_id": "...", "name": "Electronics", "description": "Electronic gadgets" },
    { "_id": "...", "name": "Clothing", "description": "" }
  ]
}
```

---

### Get Single Category

`GET /categories/:id`

Public.

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "name": "Electronics", "description": "Electronic gadgets" }
}
```

---

### Create Category

`POST /categories` 🔒 *Admin only*

**Request Body**

| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `description` | string | ❌ |

**Example Request**

```json
{
  "name": "Electronics",
  "description": "Electronic gadgets and accessories"
}
```

**Example Response** `201 Created`

```json
{
  "success": true,
  "data": { "_id": "...", "name": "Electronics", "description": "Electronic gadgets and accessories" }
}
```

---

### Update Category

`PUT /categories/:id` 🔒 *Admin only*

**Example Request**

```json
{ "description": "Updated description" }
```

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "name": "Electronics", "description": "Updated description" }
}
```

---

### Delete Category

`DELETE /categories/:id` 🔒 *Admin only*

**Example Response** `200 OK`

```json
{ "success": true, "data": null }
```

---

## 4. Products

### Get All Products

`GET /products`

Public. Supports filtering, searching, sorting, and pagination via query parameters.

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| `category` | string | Filter by category ID |
| `minPrice` | number | Minimum price (inclusive) |
| `maxPrice` | number | Maximum price (inclusive) |
| `search` | string | Full-text search on name and description |
| `sort` | string | `price_asc`, `price_desc`, `rating` (default: newest first) |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Results per page (default: `10`, max: `100`) |

**Example Request**

```
GET /products?category=664a1b2c3d4e5f6a7b8c9d0e&minPrice=50&maxPrice=500&sort=price_asc&page=1&limit=5
```

**Example Response** `200 OK`

```json
{
  "success": true,
  "total": 42,
  "page": 1,
  "pages": 9,
  "data": [
    {
      "_id": "...",
      "name": "Wireless Headphones",
      "description": "High-quality audio experience",
      "price": 89.99,
      "category": { "_id": "...", "name": "Electronics" },
      "stock": 150,
      "images": [],
      "averageRating": 4.5,
      "numReviews": 12
    }
  ]
}
```

---

### Get Single Product

`GET /products/:id`

Public.

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Wireless Headphones",
    "price": 89.99,
    "category": { "_id": "...", "name": "Electronics" },
    "stock": 150,
    "averageRating": 4.5,
    "numReviews": 12
  }
}
```

---

### Create Product

`POST /products` 🔒 *Admin only*

**Request Body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `name` | string | ✅ | Non-empty |
| `description` | string | ✅ | Non-empty |
| `price` | number | ✅ | >= 0 |
| `category` | string | ✅ | Valid MongoDB ObjectId |
| `stock` | number | ✅ | Integer >= 0 |
| `images` | string[] | ❌ | Array of image URLs |

**Example Request**

```json
{
  "name": "Wireless Headphones",
  "description": "High-quality audio experience with 30h battery",
  "price": 89.99,
  "category": "664a1b2c3d4e5f6a7b8c9d0e",
  "stock": 150,
  "images": ["https://example.com/headphones.jpg"]
}
```

**Example Response** `201 Created`

```json
{
  "success": true,
  "data": { "_id": "...", "name": "Wireless Headphones", "price": 89.99, "stock": 150 }
}
```

---

### Update Product

`PUT /products/:id` 🔒 *Admin only*

Provide only the fields to update.

**Example Request**

```json
{ "price": 79.99, "stock": 200 }
```

---

### Delete Product

`DELETE /products/:id` 🔒 *Admin only*

**Example Response** `200 OK`

```json
{ "success": true, "data": null }
```

---

## 5. Cart

> All cart endpoints require authentication.

### Get Cart

`GET /cart` 🔒

Returns the current user's cart with populated product details.

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": "...",
    "items": [
      {
        "_id": "item_id_here",
        "product": { "_id": "...", "name": "Wireless Headphones", "price": 89.99, "stock": 150 },
        "quantity": 2,
        "price": 89.99
      }
    ],
    "totalPrice": 179.98
  }
}
```

Returns `{ items: [], totalPrice: 0 }` if the cart is empty.

---

### Add Item to Cart

`POST /cart` 🔒

Adds a product to the cart. If the product already exists in the cart, its quantity is incremented.

**Request Body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `productId` | string | ✅ | Valid MongoDB ObjectId |
| `quantity` | number | ❌ | Integer >= 1 (default: `1`) |

**Example Request**

```json
{
  "productId": "664a1b2c3d4e5f6a7b8c9d0e",
  "quantity": 2
}
```

**Example Response** `201 Created`

```json
{
  "success": true,
  "data": { "_id": "...", "items": [...], "totalPrice": 179.98 }
}
```

---

### Update Cart Item Quantity

`PUT /cart/:itemId` 🔒

Updates the quantity of a specific cart item. Setting quantity to `0` removes the item.

**URL Parameter:** `itemId` — the `_id` of the cart item (not the product ID).

**Request Body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `quantity` | number | ✅ | Integer >= 0 |

**Example Request**

```json
{ "quantity": 3 }
```

---

### Remove Cart Item

`DELETE /cart/:itemId` 🔒

Removes a specific item from the cart.

**URL Parameter:** `itemId` — the `_id` of the cart item.

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "items": [], "totalPrice": 0 }
}
```

---

### Clear Cart

`DELETE /cart` 🔒

Removes the entire cart for the authenticated user.

**Example Response** `200 OK`

```json
{ "success": true, "data": null }
```

---

## 6. Orders

> All order endpoints require authentication.

### Create Order

`POST /orders` 🔒

Converts the current user's cart into an order. Automatically:
- Validates stock availability for all items
- Decrements product stock
- Clears the cart

**Request Body**

| Field | Type | Required |
|---|---|---|
| `shippingAddress.street` | string | ✅ |
| `shippingAddress.city` | string | ✅ |
| `shippingAddress.state` | string | ✅ |
| `shippingAddress.zip` | string | ✅ |
| `shippingAddress.country` | string | ✅ |

**Example Request**

```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Cairo",
    "state": "Cairo Governorate",
    "zip": "11511",
    "country": "Egypt"
  }
}
```

**Example Response** `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": "...",
    "items": [
      { "product": "...", "name": "Wireless Headphones", "quantity": 2, "price": 89.99 }
    ],
    "shippingAddress": { "street": "123 Main St", "city": "Cairo", "state": "Cairo Governorate", "zip": "11511", "country": "Egypt" },
    "totalPrice": 179.98,
    "orderStatus": "processing",
    "paymentStatus": "pending"
  }
}
```

---

### Get Orders

`GET /orders` 🔒

- **Users** — returns only their own orders
- **Admins** — returns all orders

**Example Response** `200 OK`

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com" },
      "totalPrice": 179.98,
      "orderStatus": "processing",
      "paymentStatus": "pending"
    }
  ]
}
```

---

### Get Single Order

`GET /orders/:id` 🔒

Returns order details. Users can only fetch their own orders; admins can fetch any.

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "items": [...],
    "shippingAddress": { ... },
    "totalPrice": 179.98,
    "orderStatus": "processing",
    "paymentStatus": "pending"
  }
}
```

---

### Update Order Status

`PUT /orders/:id/status` 🔒 *Admin only*

Updates the order or payment status.

**Request Body** *(at least one field required)*

| Field | Type | Values |
|---|---|---|
| `orderStatus` | string | `processing`, `shipped`, `delivered`, `cancelled` |
| `paymentStatus` | string | `pending`, `paid`, `failed` |

**Example Request**

```json
{ "orderStatus": "shipped", "paymentStatus": "paid" }
```

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "orderStatus": "shipped", "paymentStatus": "paid" }
}
```

---

### Cancel Order

`PUT /orders/:id/cancel` 🔒

Cancels an order. Only the order owner can cancel, and only orders in `processing` status can be cancelled. Automatically restores product stock.

**Example Response** `200 OK`

```json
{
  "success": true,
  "data": { "_id": "...", "orderStatus": "cancelled" }
}
```

**Error cases:**
- `403` — Not the order owner
- `400` — Order is not in `processing` status

---

## 7. Reviews

### Get Product Reviews

`GET /products/:productId/reviews`

Public. Returns all reviews for a product, newest first.

**Example Response** `200 OK`

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "...",
      "user": { "_id": "...", "name": "Jane Doe" },
      "rating": 5,
      "comment": "Excellent product, highly recommend!",
      "createdAt": "2026-03-20T10:00:00.000Z"
    }
  ]
}
```

---

### Create Review

`POST /products/:productId/reviews` 🔒

Creates a review for a product. Restrictions:
- User must be authenticated
- User must have a completed order (`shipped` or `delivered`) containing this product
- One review per user per product (enforced by unique index)

After creation, the product's `averageRating` and `numReviews` are automatically recalculated.

**Request Body**

| Field | Type | Required | Rules |
|---|---|---|---|
| `rating` | number | ✅ | Integer 1–5 |
| `comment` | string | ✅ | Non-empty |

**Example Request**

```json
{
  "rating": 5,
  "comment": "Excellent product, highly recommend!"
}
```

**Example Response** `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "user": "...",
    "product": "...",
    "rating": 5,
    "comment": "Excellent product, highly recommend!"
  }
}
```

---

### Update Review

`PUT /reviews/:id` 🔒

Updates a review. Only the review author can update it.

**Request Body** *(all fields optional)*

| Field | Type | Rules |
|---|---|---|
| `rating` | number | Integer 1–5 |
| `comment` | string | Non-empty |

**Example Request**

```json
{ "rating": 4, "comment": "Great product, slight delay in shipping." }
```

---

### Delete Review

`DELETE /reviews/:id` 🔒

Deletes a review. The review author or an admin can delete it. Product rating is automatically recalculated after deletion.

**Example Response** `200 OK`

```json
{ "success": true, "data": null }
```

---

## Error Reference

| Status Code | Meaning |
|---|---|
| `400` | Bad request — validation failed or business rule violation (e.g., empty cart, insufficient stock) |
| `401` | Unauthorized — missing or invalid/expired JWT |
| `403` | Forbidden — authenticated but not permitted (wrong role or not resource owner) |
| `404` | Resource not found |
| `500` | Internal server error |
