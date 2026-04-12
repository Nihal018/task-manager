# Task Management API

A production-grade REST API for managing tasks, built with Node.js, Express, PostgreSQL, and Redis. Features JWT authentication, caching, rate limiting, and pagination.

## Features

- **Authentication** — JWT access tokens + refresh tokens, bcrypt password hashing
- **Task CRUD** — full create, read, update, delete with ownership enforcement
- **Pagination & Filtering** — filter by status/priority, sort by any column
- **Redis Caching** — cache-aside pattern with write-through invalidation
- **Rate Limiting** — Redis-backed limiter (100 req/15min, stricter on auth routes)
- **Security** — parameterized queries, input validation, whitelisted sort fields
- **Database Indexing** — optimized queries on frequently filtered columns

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express
- **Database:** PostgreSQL (with `pg` driver)
- **Cache:** Redis (via ioredis)
- **Auth:** jsonwebtoken + bcrypt

## Project Structure

\`\`\`
task-manager-api/
├── config/
│ ├── db.js # PostgreSQL connection pool
│ └── redis.js # Redis client
├── controllers/
│ ├── authController.js # Register, login, refresh
│ └── taskController.js # Task CRUD logic
├── middleware/
│ ├── auth.js # JWT verification
│ ├── cache.js # Redis caching
│ └── rateLimiter.js # Rate limiting
├── models/
│ ├── userModel.js # User queries
│ └── taskModel.js # Task queries
├── routes/
│ ├── authRoutes.js
│ └── taskRoutes.js
├── .env.example
├── app.js
└── package.json
\`\`\`

## Setup

1. Clone the repo
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/task-manager-api.git
   cd task-manager-api
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables
   \`\`\`bash
   cp .env.example .env

# Fill in your values

\`\`\`

4. Create the database tables (run in psql or pgAdmin):
   \`\`\`sql
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
status VARCHAR(20) DEFAULT 'pending',
priority VARCHAR(10) DEFAULT 'medium',
due_date DATE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
\`\`\`

5. Start Redis
   \`\`\`bash
   brew services start redis
   \`\`\`

6. Run the server
   \`\`\`bash
   node app.js
   \`\`\`

## API Endpoints

### Auth

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| POST   | /api/auth/register | Register a new user   |
| POST   | /api/auth/login    | Login, receive tokens |
| POST   | /api/auth/refresh  | Get new access token  |

### Tasks (all require `Authorization: Bearer <token>`)

| Method | Endpoint       | Description                        |
| ------ | -------------- | ---------------------------------- |
| POST   | /api/tasks     | Create a task                      |
| GET    | /api/tasks     | List tasks (paginated, filterable) |
| GET    | /api/tasks/:id | Get a single task                  |
| PUT    | /api/tasks/:id | Update a task                      |
| DELETE | /api/tasks/:id | Delete a task                      |

### Query Params for GET /api/tasks

- `page` — page number (default 1)
- `limit` — items per page (default 10, max 100)
- `status` — filter by pending/in_progress/completed
- `priority` — filter by low/medium/high
- `sort` — created_at/updated_at/due_date/priority/status/title
- `order` — asc/desc

## Architecture Decisions

- **Connection pooling** — reuses DB connections across requests for performance
- **Layered architecture** — routes → controllers → models → database
- **Cache-aside pattern** — reads hit cache first, writes invalidate
- **Parameterized queries** — prevents SQL injection
- **Whitelisted sort fields** — prevents injection via ORDER BY
- **Short-lived access tokens** — limits damage window if token leaks

## License

MIT
