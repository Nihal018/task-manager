# Task Management API

> A production-grade REST API for managing tasks, built with Node.js, Express, PostgreSQL, and Redis. Features JWT authentication with refresh tokens, Redis caching, rate limiting, pagination, and indexed database queries.

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

## 🔗 Live Demo

- **API Base URL:** `https://your-deployment-url.com`
- **Postman Collection:** [Download here](./postman_collection.json)

---

## ✨ Features

- 🔐 **JWT Authentication** — access + refresh token flow with bcrypt password hashing
- 📝 **Full Task CRUD** — create, read, update, delete with strict ownership enforcement
- 📄 **Pagination & Filtering** — filter by status/priority, sort by any allowed column
- ⚡ **Redis Caching** — cache-aside pattern with write-through invalidation (60s TTL)
- 🛡️ **Rate Limiting** — Redis-backed (100 req/15min globally, 5 req/15min on auth)
- 🔒 **SQL Injection Safe** — parameterized queries + whitelisted sort fields
- 🚀 **Performance** — connection pooling + composite indexes on hot columns

---

## 🛠️ Tech Stack

| Layer                 | Technology                |
| --------------------- | ------------------------- |
| Runtime               | Node.js (ES Modules)      |
| Framework             | Express                   |
| Database              | PostgreSQL (via `pg`)     |
| Cache & Rate Limiting | Redis (via `ioredis`)     |
| Auth                  | `jsonwebtoken` + `bcrypt` |

---

## 📁 Project Structure

```
task-manager-api/
├── config/
│ ├── db.js # PostgreSQL connection pool
│ └── redis.js # Redis client
├── controllers/
│ ├── authController.js # Register, login, refresh logic
│ └── taskController.js # Task CRUD logic
├── middleware/
│ ├── auth.js # JWT verification
│ ├── cache.js # Redis caching middleware
│ └── rateLimiter.js # Rate limiting middleware
├── models/
│ ├── userModel.js # User SQL queries
│ └── taskModel.js # Task SQL queries
├── routes/
│ ├── authRoutes.js
│ └── taskRoutes.js
├── .env.example
├── app.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

**1. Clone the repo**

```bash
git clone https://github.com/YOUR_USERNAME/task-manager-api.git
cd task-manager-api
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
# Fill in your database credentials and JWT secrets
```

**4. Create the database schema**

Run this in `psql` or pgAdmin:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority VARCHAR(10) DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for query performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);
```

**5. Start Redis**

```bash
brew services start redis    # macOS
# or: sudo service redis-server start   (Linux)
```

**6. Run the server**

```bash
node app.js
```

The API will be running at `http://localhost:3000` 🎉

---

## 📡 API Reference

### 🔐 Authentication

| Method | Endpoint             | Description              | Auth |
| ------ | -------------------- | ------------------------ | ---- |
| POST   | `/api/auth/register` | Register a new user      | ❌   |
| POST   | `/api/auth/login`    | Login and receive tokens | ❌   |
| POST   | `/api/auth/refresh`  | Get a new access token   | ❌   |

### 📝 Tasks

All task endpoints require `Authorization: Bearer <access_token>` header.

| Method | Endpoint         | Description                                  |
| ------ | ---------------- | -------------------------------------------- |
| POST   | `/api/tasks`     | Create a task                                |
| GET    | `/api/tasks`     | List tasks (paginated, filterable, sortable) |
| GET    | `/api/tasks/:id` | Get a single task by ID                      |
| PUT    | `/api/tasks/:id` | Update a task (partial updates supported)    |
| DELETE | `/api/tasks/:id` | Delete a task                                |

### 🔍 Query Parameters for `GET /api/tasks`

| Param      | Type   | Default      | Description                                                                    |
| ---------- | ------ | ------------ | ------------------------------------------------------------------------------ |
| `page`     | number | `1`          | Page number                                                                    |
| `limit`    | number | `10`         | Items per page (max 100)                                                       |
| `status`   | string | —            | Filter: `pending`, `in_progress`, `completed`                                  |
| `priority` | string | —            | Filter: `low`, `medium`, `high`                                                |
| `sort`     | string | `created_at` | Sort by: `created_at`, `updated_at`, `due_date`, `priority`, `status`, `title` |
| `order`    | string | `desc`       | `asc` or `desc`                                                                |

---

## 📦 Example Requests

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepass123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securepass123"
  }'
```

**Response:**

```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com" }
}
```

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn PostgreSQL indexing",
    "description": "Deep dive into B-tree indexes",
    "priority": "high",
    "due_date": "2026-04-30"
  }'
```

### List Tasks (with filters)

```bash
curl "http://localhost:3000/api/tasks?page=1&limit=10&status=pending&priority=high&sort=due_date&order=asc" \
  -H "Authorization: Bearer <access_token>"
```

**Response:**

```json
{
  "tasks": [ ... ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🏗️ Architecture Decisions

- **Layered architecture** — clean separation: `routes → controllers → models → database`. Each layer has a single responsibility, making the codebase testable and maintainable.

- **Connection pooling** — reuses a pool of PostgreSQL connections instead of opening a new one per request. Essential for handling concurrent traffic.

- **Cache-aside pattern** — reads check Redis first, fall back to DB on miss. Writes invalidate the user's cache keys. 60-second TTL as a safety net.

- **Parameterized queries** — all user input passes through `$1, $2, ...` placeholders. SQL injection is impossible by design.

- **Whitelisted sort fields** — since column names can't be parameterized in SQL, dynamic sort values are validated against an allowlist before reaching the query.

- **Short-lived access tokens (15 min)** — limits the damage window if a token is leaked. Refresh tokens (7 days) trade convenience for security.

- **Ownership enforcement in SQL** — every task query filters by `WHERE user_id = $1`, so users physically cannot access other users' data even if they guess IDs.

- **Composite database indexes** — `(user_id, status)` and `(user_id, priority)` for common filter combinations.

---

## 💡 What I Learned

Building this project taught me:

- **How Node.js talks to PostgreSQL** under the hood using connection pools and why pools beat single clients at scale
- **JWT authentication flow** — why we use two tokens, what belongs in the payload, and why JWTs are stateless
- **The cache invalidation problem** — the hardest part of caching isn't adding it, it's knowing when to expire it
- **SQL injection defense** — parameterized queries for values, whitelists for identifiers (column/table names)
- **Why indexes matter** — the difference between scanning 1M rows and looking up 1M rows
- **REST API design** — proper status codes, consistent response shapes, returning 404 instead of 403 to avoid leaking resource existence
- **Rate limiting at the infrastructure level** — why Redis-backed limiters are required once you run more than one server

---

## 🔮 Future Improvements

- [ ] Unit and integration tests with Jest + Supertest
- [ ] OpenAPI/Swagger documentation
- [ ] Docker + docker-compose setup
- [ ] CI/CD via GitHub Actions
- [ ] Structured logging with Pino
- [ ] Email verification on registration
- [ ] Soft deletes for tasks

---

## 📄 License

MIT

---

## 👤 Author

**Your Name**

- GitHub: [@Nihal018](https://github.com/Nihal018)
- LinkedIn: https://www.linkedin.com/in/nihal-choutapelly-9515b6229/
