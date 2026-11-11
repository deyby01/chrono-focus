# ChronoFocus — Complete Installation & Setup Guide

This guide provides comprehensive, step-by-step instructions to install, configure, run, and troubleshoot **ChronoFocus** across **Linux**, **macOS**, and **Windows**.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Overview & Port Mappings](#2-quick-overview--port-mappings)
3. [Environment Configuration (`.env`)](#3-environment-configuration-env)
4. [Method A: Docker Compose (Recommended)](#4-method-a-docker-compose-recommended)
5. [Method B: OS-Specific Native / Local Setup](#5-method-b-os-specific-native--local-setup)
   - [Linux (Ubuntu / Debian / Fedora / Arch)](#linux-ubuntu--debian--fedora--arch)
   - [macOS (Apple Silicon & Intel)](#macos-apple-silicon--intel)
   - [Windows (WSL2 & Native PowerShell)](#windows-wsl2--native-powershell)
6. [Verifying the Installation](#6-verifying-the-installation)
7. [Troubleshooting & FAQs](#7-troubleshooting--faqs)

---

## 1. Prerequisites

Before installing ChronoFocus, make sure your machine has the following tools installed:

| Tool | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Git** | `2.30+` | Source code management |
| **Node.js** | `18.x`, `20.x`, or `22.x` (LTS) | Backend runtime & frontend build |
| **npm** | `9.x` or `10.x+` | Package manager |
| **Docker** | `24.x+` or `27.x+` | Containerization engine |
| **Docker Compose** | `v2.20+` | Multi-container orchestration |
| **PostgreSQL** *(optional)* | `16.x` | Only needed if running without Docker |

---

## 2. Quick Overview & Port Mappings

ChronoFocus consists of three interconnected services defined in `docker-compose.yml`:

```
┌─────────────────────────────────────────────────────────────┐
│                       USER BROWSER                          │
│                             │                               │
│              http://localhost:3000 (UI)                     │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  frontend container (Nginx + React + TypeScript)      │  │
│  │  Internal: 3000   │   Host: 3000                      │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │ /api proxy / direct fetch     │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  backend container (Node.js + Express + Sequelize)    │  │
│  │  Internal: 4000   │   Host: 4001                      │  │
│  └──────────────────────────┬────────────────────────────┘  │
│                             │ SQL queries & transactions    │
│                             ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  db container (PostgreSQL 16 Alpine)                  │  │
│  │  Internal: 5432   │   Host: 5433 (avoids local 5432)  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> The default host ports are set to **`3000`** (Frontend), **`4001`** (Backend), and **`5433`** (PostgreSQL) to avoid conflicts with system services already running on ports `4000` or `5432`.

---

## 3. Environment Configuration (`.env`)

Clone the repository and copy the environment configuration template:

```bash
git clone https://github.com/deyby01/chrono-focus.git
cd chrono-focus
cp .env.example .env
```

Review the variables inside `.env`:

```ini
# PostgreSQL Database Credentials
POSTGRES_USER=chronofocus
POSTGRES_PASSWORD=chronofocus_secret
POSTGRES_DB=chronofocus_db
POSTGRES_HOST=db
POSTGRES_PORT=5433

# Full Database Connection URL
DATABASE_URL=postgresql://chronofocus:chronofocus_secret@db:5432/chronofocus_db

# Backend Express API Configuration
BACKEND_PORT=4001
NODE_ENV=development
CORS_ORIGIN=*

# Frontend React Application Configuration
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:4001/api
```

---

## 4. Method A: Docker Compose (Recommended)

Docker Compose is the fastest and most reliable way to spin up the entire ChronoFocus stack on any OS with a single command.

### 1. Build and Start All Services
```bash
docker compose up --build -d
```

### 2. Verify Container Status
```bash
docker compose ps
```

You should see all 3 containers up and running:
- `chronofocus-db` (`healthy`)
- `chronofocus-backend` (`running`)
- `chronofocus-frontend` (`running`)

### 3. Access the Application
- **Web App (Frontend)**: [http://localhost:3000](http://localhost:3000)
- **API Health Check**: [http://localhost:4001/api/health](http://localhost:4001/api/health)
- **PostgreSQL**: `localhost:5433`

### 4. Viewing Live Logs
```bash
# Stream all logs:
docker compose logs -f

# Stream only backend or database logs:
docker compose logs -f backend
docker compose logs -f db
```

### 5. Stopping the Stack
```bash
# Stop containers (preserves database data volume):
docker compose down

# Stop and wipe database data volume (full clean reset):
docker compose down -v
```

---

## 5. Method B: OS-Specific Native / Local Setup

If you prefer to run the backend and frontend locally with native Node.js and a local or Docker-hosted PostgreSQL instance, follow the section for your operating system:

---

### Linux (Ubuntu / Debian / Fedora / Arch)

#### 1. Install Node.js, Git, and Docker
- **Ubuntu / Debian**:
  ```bash
  sudo apt update
  sudo apt install -y git curl build-essential
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  ```
- **Fedora**:
  ```bash
  sudo dnf install -y git curl nodejs npm
  ```
- **Arch Linux**:
  ```bash
  sudo pacman -S git curl nodejs npm
  ```

#### 2. Configure Docker Permissions (Avoid `sudo` requirement)
```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### 3. Start Database Only via Docker
```bash
docker compose up -d db
```

#### 4. Run Backend Locally
```bash
cd backend
npm install
npm run dev
```
The backend initializes the database schema and seeds initial data automatically on port `4001`.

#### 5. Run Frontend Locally (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Access the Vite development server at [http://localhost:3000](http://localhost:3000).

---

### macOS (Apple Silicon & Intel)

#### 1. Install Homebrew and Dependencies
If you do not have [Homebrew](https://brew.sh/) installed:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Install Git, Node.js, and Docker Desktop:
```bash
brew install git node
brew install --cask docker
```

> [!TIP]
> Launch Docker Desktop from `/Applications` and ensure the Docker Engine whale icon indicates "Running" in your menu bar.

#### 2. Start PostgreSQL
You can either run the database container:
```bash
docker compose up -d db
```
Or use native PostgreSQL via Homebrew:
```bash
brew install postgresql@16
brew services start postgresql@16
createuser -s chronofocus
createdb -O chronofocus chronofocus_db
psql -d chronofocus_db -c "ALTER USER chronofocus WITH PASSWORD 'chronofocus_secret';"
```

#### 3. Run Backend & Frontend Locally
- **Terminal 1 (Backend)**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

### Windows (WSL2 & Native PowerShell)

#### Recommended: WSL2 (Windows Subsystem for Linux)
Running under WSL2 provides the most seamless Linux-compatible development environment on Windows.

1. Install WSL2 (Ubuntu):
   ```powershell
   wsl --install
   ```
2. Open your Ubuntu terminal inside WSL2 and install Docker Desktop with the **WSL2 backend** enabled under Docker Desktop Settings -> *Resources* -> *WSL Integration*.
3. Clone the repo inside the WSL Linux filesystem (e.g. `~/projects/chrono-focus` rather than `/mnt/c/` for maximum I/O performance):
   ```bash
   git clone https://github.com/deyby01/chrono-focus.git
   cd chrono-focus
   docker compose up --build -d
   ```

#### Alternative: Native Windows (PowerShell)

1. **Install Node.js & Git**:
   - Download the LTS installer from [nodejs.org](https://nodejs.org).
   - Download Git for Windows from [git-scm.com](https://git-scm.com).
2. **Install Docker Desktop for Windows**:
   - Download from [docker.com](https://www.docker.com/products/docker-desktop/).
3. **Run using PowerShell**:
   ```powershell
   # Clone repository
   git clone https://github.com/deyby01/chrono-focus.git
   cd chrono-focus

   # Copy environment file
   Copy-Item .env.example .env

   # Start containers
   docker compose up --build -d
   ```

---

## 6. Verifying the Installation

Test that all components are functioning correctly:

### 1. Test Backend API
```bash
curl -s http://localhost:4001/api/health
```
**Expected Output**:
```json
{
  "status": "success",
  "data": {
    "service": "chrono-focus-api",
    "orm": "Sequelize",
    "database": "connected",
    "serverTime": "2026-11-11T15:00:00.000Z"
  }
}
```

### 2. Test Frontend
Open [http://localhost:3000](http://localhost:3000) in your web browser. You should see:
- The ChronoFocus navigation sidebar and brand badge.
- Pre-populated starter task categories (Courses, Projects, Hobbies, etc.).
- The interactive circular Reverse Chronometer dial ready to countdown.
- Daily Resume metrics with today's scheduled roadmap.

---

## 7. Troubleshooting & FAQs

### Q1: `Bind for :::5432 failed: port is already allocated`
- **Cause**: A local instance of PostgreSQL is already running on port `5432` on your machine.
- **Solution**: ChronoFocus maps host port `5433` to container port `5432` by default. Verify your `.env` contains:
  ```ini
  POSTGRES_PORT=5433
  ```
  If you need another port, change `5433` to `5434` or any unused port.

### Q2: `Bind for :::4000 failed: port is already allocated`
- **Cause**: Another service or process is using port `4000`.
- **Solution**: ChronoFocus maps host port `4001` to container port `4000`. Verify `BACKEND_PORT=4001` in your `.env`.

### Q3: `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`
- **Linux**: Ensure your user is in the `docker` group (`sudo usermod -aG docker $USER`) and that the service is running (`sudo systemctl start docker`).
- **macOS / Windows**: Make sure Docker Desktop is launched and running.

### Q4: How do I reset the database to a clean state?
Run:
```bash
docker compose down -v
docker compose up --build -d
```
The `-v` flag removes the `postgres_data` volume, causing Sequelize to recreate the tables and re-seed the default starter data.

---

## Next Steps

- Check out the [User Guide](./USER_GUIDE.md) to learn how to schedule tasks and master the reverse chronometer.
- Read the [Architecture Document](./ARCHITECTURE.md) to understand the full MVC design.
- Browse the [REST API Reference](./API_REFERENCE.md) to inspect available backend endpoints.

