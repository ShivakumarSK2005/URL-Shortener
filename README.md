# Scalable Microservices URL Shortener

A high-performance, containerized microservices URL shortener platform with user authentication, custom URL aliasing, analytics tracking, and Redis caching. Built with Node.js, Express, PostgreSQL, Redis, Docker, and React (Vite).

---

## 🚀 Features

- **🔐 Authentication & User Management (`auth-service`)**:
  - Secure registration and login with BCrypt password hashing.
  - Stateless JWT (JSON Web Token) authentication.
  - User profile management and password update support.

- **⚡ Fast URL Shortening & Redirection (`url-service`)**:
  - Generates compact, collision-resistant 6-character alphanumeric short codes.
  - Sub-millisecond URL redirections powered by **Redis in-memory caching** (Cache-Aside pattern).
  - Tracks total and unique click counts per link in real time.
  - User-isolated URL ownership with full CRUD capabilities (create, list, inspect stats, delete).

- **🛡️ Reverse Proxy & API Gateway (`gateway`)**:
  - Nginx-based API Gateway orchestrating traffic routing to microservices.
  - CORS header handling, proxying, and request rate safety.

- **📊 Comprehensive Analytics & Dashboard**:
  - Live click counter and URL engagement metrics.
  - Direct clipboard copy, real-time redirection, and link management.

- **🐳 Production Ready & Orchestrated**:
  - Full **Docker Compose** multi-container setup for local development.
  - **Kubernetes (k8s)** manifests ready for cluster deployment.
  - Cloud-ready configuration for **Neon PostgreSQL**, **Upstash Redis**, and **Render / Cloud VMs**.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router DOM, Axios, Modern CSS
- **Backend Microservices**: Node.js, Express.js
- **Databases & Cache**: PostgreSQL 16 (`pg`), Redis 7 (`redis`)
- **Security**: JSON Web Tokens (`jsonwebtoken`), `bcrypt`
- **Gateway & Proxy**: Nginx
- **DevOps & Containers**: Docker, Docker Compose, Kubernetes (`k8s`)

---

## 📂 Project Architecture

```
url-shortener
├── auth-service/          # Authentication & User Management Microservice (Port: 3001)
│   ├── src/
│   │   ├── config/        # PostgreSQL connection pool with SSL support
│   │   ├── controllers/   # Auth & profile request handlers
│   │   ├── middleware/    # JWT verification middleware
│   │   ├── models/        # User data access queries
│   │   ├── routes/        # /api/auth routes
│   │   └── app.js         # Express server entry point
│   ├── Dockerfile
│   └── package.json
│
├── url-service/           # URL Shortening & Redirects Microservice (Port: 3002)
│   ├── src/
│   │   ├── config/        # PostgreSQL and Redis client connections
│   │   ├── controllers/   # Shorten, redirect, metrics, & delete logic
│   │   ├── middleware/    # Auth middleware for protected link routes
│   │   ├── models/        # URL data access queries
│   │   ├── routes/        # /api/urls routes
│   │   └── app.js         # Express server entry point
│   ├── Dockerfile
│   └── package.json
│
├── gateway/               # Nginx API Gateway (Port: 80)
│   ├── nginx.conf         # Reverse proxy routing for /api/auth and /api/urls
│   └── Dockerfile
│
├── frontend/              # Modern React + Vite Web Client (Port: 5173 / 80)
│   ├── src/
│   │   ├── components/    # Navbar, EyeIcons, Messages
│   │   ├── pages/         # Dashboard, MyUrls, Analytics, Login, Register, Profile
│   │   ├── routes/        # Protected & public route guards
│   │   └── services/      # Axios API client & token storage
│   └── vite.config.js
│
├── k8s/                   # Kubernetes deployment & service manifests
└── docker-compose.yml     # Complete multi-container orchestration
```

### Request Flow
```
Client (Browser / React)
         │
         ▼
Nginx API Gateway (Port 80)
    ├── /api/auth/*  ──► auth-service (Port 3001) ──► PostgreSQL (Users)
    └── /api/urls/*  ──► url-service  (Port 3002) ──► Redis (Cache) / PostgreSQL (URLs)
```

---

## ⚙️ Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Node.js 18+](https://nodejs.org/) (for standalone local development)
- [Git](https://git-scm.com/)

---

### Option 1: Quickstart with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShivakumarSK2005/URL-Shortener.git
   cd URL-Shortener
   ```

2. **Launch all services:**
   ```bash
   docker compose up -d --build
   ```

3. **Verify running containers:**
   ```bash
   docker compose ps
   ```

4. **Access the application:**
   - **API Gateway:** `http://localhost/`
   - **Auth Service:** `http://localhost:3001`
   - **URL Service:** `http://localhost:3002`

---

### Option 2: Running Standalone Services Locally

1. **Start PostgreSQL & Redis** locally or via Docker:
   ```bash
   docker run -d --name local-postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16
   docker run -d --name local-redis -p 6379:6379 redis:7
   ```

2. **Run Auth Service:**
   ```bash
   cd auth-service
   npm install
   # Configure .env: PORT=3001, DB_HOST=localhost, DB_USER=postgres, DB_PASSWORD=postgres, DB_NAME=auth_db, JWT_SECRET=secret
   npm run dev
   ```

3. **Run URL Service:**
   ```bash
   cd ../url-service
   npm install
   # Configure .env: PORT=3002, DB_HOST=localhost, REDIS_URL=redis://localhost:6379, JWT_SECRET=secret
   npm run dev
   ```

4. **Run Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📡 API Overview

### 1. Authentication Service (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT token | ❌ No |
| `GET` | `/api/auth/profile` | Retrieve logged-in user profile details | ✅ Bearer JWT |
| `PUT` | `/api/auth/profile` | Update profile information | ✅ Bearer JWT |
| `PUT` | `/api/auth/profile/password` | Change user password | ✅ Bearer JWT |

### 2. URL Service (`/api/urls`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/urls/shorten` | Create a shortened URL | ✅ Bearer JWT |
| `GET` | `/api/urls/my-urls` | List all shortened links created by current user | ✅ Bearer JWT |
| `GET` | `/api/urls/stats/:shortCode` | Get click count & metadata for a short link | ✅ Bearer JWT |
| `DELETE`| `/api/urls/:shortCode` | Delete a shortened URL and invalidate cache | ✅ Bearer JWT |
| `GET` | `/api/urls/:shortCode` | **Redirect endpoint**: Redirects to original long URL | ❌ No |

---

## ☁️ Cloud Deployment (100% Free Tier)

This repository is optimized for zero-cost cloud deployment:

- **Database**: [Neon.tech](https://neon.tech) Serverless PostgreSQL (supports `DATABASE_URL` with SSL).
- **Cache**: [Upstash](https://upstash.com) Serverless Redis (supports `rediss://` TLS URLs).
- **Backend Services**: [Render](https://render.com) Web Services (`auth-service`, `url-service`).
- **Frontend**: [Render](https://render.com) or [Vercel](https://vercel.com) Static Site.

### Database Table Schemas

Run the following SQL in your Neon / PostgreSQL console:

```sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS urls (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    original_url TEXT NOT NULL,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    click_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
