# Fastify + Prisma + TypeScript Backend
### A high-performance blogging platform API built on top of Fastify, Prisma, and PostgreSQL

## Project Highlights
1. **Node.js & TypeScript**: Type-safety, maintainability, and DX.
2. **Fastify**: Ultra-fast web framework with schema-driven validation and plugin encapsulation.
3. **Prisma ORM**: Modern, type-safe database client and migrations for PostgreSQL.
4. **PostgreSQL**: Robust relational database storage.
5. **Redis**: Cache layer for high-throughput endpoints (blogs, recommendations).
6. **Zod**: Robust request parameter and body schema validation.
7. **JWT & Keystore**: Dual-token (access + refresh) rotation using RS256 asymmetric keys.
8. **Role-Based Access Control (RBAC)**: Support for `LEARNER`, `WRITER`, `EDITOR`, and `ADMIN`.
9. **Docker & Docker Compose**: Instant reproducible development and production setup.

---

## Architecture Overview

```
                                      +------------------------+
                                      |     Fastify Server     |
                                      +-----------+------------+
                                                  |
                                                  v
                                      +------------------------+
                                      |   Api Key & Permission  |
                                      +-----------+------------+
                                                  |
                     +----------------------------+----------------------------+
                     |                            |                            |
                     v                            v                            v
          +----------------------+     +----------------------+     +----------------------+
          |     Public APIs      |     |     Writer APIs      |     |     Editor APIs      |
          |  (Signup, Login, etc)|     | (Draft, Submit, etc) |     |  (Publish, Unpublish)|
          +----------+-----------+     +----------+-----------+     +----------+-----------+
                     |                            |                            |
                     +----------------------------+----------------------------+
                                                  |
                                                  v
                                      +------------------------+
                                      |    Prisma Client DB    |
                                      |     (PostgreSQL)       |
                                      +-----------+------------+
                                                  |
                                      +-----------+------------+
                                      |      Redis Cache       |
                                      +------------------------+
```

---

## Directory Structure

```
├── addons/                  # Project assets, postman collections, setup scripts
├── keys/                    # RSA public and private key pairs (RS256 JWT)
├── prisma/                  # Prisma schema and seed script
│   ├── schema.prisma        # Database schema definitions
│   └── seed.ts              # Database seeder (roles, api keys, admin user)
├── src/
│   ├── auth/                # Authentication, authorization, API key validation
│   ├── cache/               # Redis connection, queries, and repositories
│   ├── config.ts            # Environment configuration
│   ├── core/                # Logger, JWT, ApiError, ApiResponse abstractions
│   ├── database/            # Prisma connection and database repositories
│   │   ├── model/           # Models and TypeScript interfaces
│   │   └── repository/      # Repository implementations (Prisma)
│   ├── helpers/             # Role, permission, security, validator utilities
│   ├── routes/              # Fastify route plugins (health, access, blog, profile)
│   ├── types/               # Request and token typings
│   ├── app.ts               # Fastify application configuration
│   └── server.ts            # Server entrypoint
├── Dockerfile               # Docker container definition
├── docker-compose.yml       # App, PostgreSQL, and Redis orchestration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20+ (recommended v22+)
- **PostgreSQL**: v14+
- **Redis**: v6+

### 2. Environment Setup
Run the postinstall initialization to setup environment files and RSA keys:
```bash
npm run postinstall
```
Review and customize `.env` as needed:
```env
PORT=3000
DATABASE_URL="postgresql://blogs-db-user:changeit@localhost:5432/blogs-db?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=changeit
```

### 3. Database Migration and Seeding
Generate Prisma Client:
```bash
npm run prisma:generate
```
Push the schema to your database (or run migrations):
```bash
npm run prisma:push
```
Seed initial API key (`GCMUDiuY5a7WvyUNt9n3QztToSHzK7Uj`), roles (`LEARNER`, `WRITER`, `EDITOR`, `ADMIN`), and default admin account:
```bash
npm run prisma:seed
```

### 4. Running the Application
Development mode (with nodemon):
```bash
npm run dev
```
Production build and run:
```bash
npm run build
npm start
```

### 5. Running with Docker Compose
To start the entire stack (Fastify app + PostgreSQL + Redis):
```bash
docker compose up -d
```

---

## API Endpoints

### Health Check
- `GET /health` - Health check (no API key required)

### Protected Endpoints (Requires `x-api-key` header)
- **Access / Auth**
  - `POST /signup/basic` - User signup
  - `POST /login/basic` - User login
  - `DELETE /logout` - User logout
  - `POST /token/refresh` - Refresh access token
  - `POST /credential/user/assign` - Admin password reset
- **Profile**
  - `GET /profile/my` - Get current user profile
  - `PUT /profile` - Update profile name and picture
- **Blogs (Public & Reader)**
  - `GET /blogs/tag/:tag` - Get published blogs by tag (paginated)
  - `GET /blogs/author/id/:id` - Get published blogs by author
  - `GET /blogs/latest` - Get latest published blogs (paginated)
  - `GET /blogs/similar/id/:id` - Get similar blogs
  - `GET /blog/id/:id` - Get single blog by ID
  - `GET /blog/url?endpoint=...` - Get single blog by URL
- **Blog (Writer)**
  - `POST /blog/writer` - Create a new blog
  - `PUT /blog/writer/id/:id` - Edit blog
  - `PUT /blog/writer/submit/:id` - Submit blog for review
  - `PUT /blog/writer/withdraw/:id` - Withdraw submission to draft
  - `DELETE /blog/writer/id/:id` - Delete blog / revert draft
  - `GET /blog/writer/submitted/all` - List submitted blogs
  - `GET /blog/writer/published/all` - List published blogs
  - `GET /blog/writer/drafts/all` - List draft blogs
- **Blog (Editor / Admin)**
  - `PUT /blog/editor/publish/:id` - Publish a submitted blog
  - `PUT /blog/editor/unpublish/:id` - Unpublish a blog
  - `DELETE /blog/editor/id/:id` - Permanently remove blog
  - `GET /blog/editor/published/all` - List all published blogs
  - `GET /blog/editor/submitted/all` - List all submitted blogs
  - `GET /blog/editor/drafts/all` - List all draft blogs
