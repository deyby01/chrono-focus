# ChronoFocus ⏱️

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Node: 18+](https://img.shields.io/badge/Node-18%2B-blue.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express-4.21-zinc.svg)](https://expressjs.com/)
[![Sequelize ORM](https://img.shields.io/badge/Sequelize-6.37-blue.svg)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Docker Compose](https://img.shields.io/badge/Docker_Compose-v2-blue.svg)](https://docs.docker.com/compose/)

> **ChronoFocus** is an open-source, full-stack personal time management, task scheduling, and reverse-chronometer focus platform. Built with **Express.js**, **React + TypeScript**, **Tailwind CSS**, **PostgreSQL**, and **Docker Compose** following the **MVC model**, **SOLID**, and **DRY** principles.

---

## The Problem & The Solution

Have you ever sat down with a long list of courses to complete, software projects to build, hobbies to practice, and chores to handle—only to jump between distractions, lose momentum, and reach the end of the day feeling like **nothing was accomplished**?

**ChronoFocus solves this:**
1. **Allocate explicit time budgets**: Choose how many minutes you will commit to each task before starting.
2. **Reverse Chronometer Focus Dial**: Instead of a passive stopwatch, the chronometer counts down toward `00:00` with visual progress rings, browser title countdowns, and completion audio cues to anchor your attention.
3. **Structured Daily Schedule**: Time-block your day by hour slots with interactive sub-task checklists.
4. **End-of-Day Daily Resume**: Review exactly where your time was spent across task categories compared to your planned goals.
5. **My Best Time Records**: Automatically tracks your longest uninterrupted focus sprint, your best productive day, and your peak productivity hour window.

---

## Key Features

- **Dynamic Reverse Chronometer**:
  - Automatically loads your scheduled task's planned duration (or remaining time).
  - Quick minute adjustments (`-5m`, `+5m`), one-click presets (`15m`, `25m`, `45m`, `60m`, `90m`), or custom minute inputs.
  - Luminous glowing SVG countdown dial with live percentage tracking.
  - Web Audio synthesized completion chimes and live browser tab title updates `(MM:SS) Task | ChronoFocus`.
  - Atomically logs sessions to PostgreSQL and updates accumulated task time.
- **Task Types & Category Taxonomies**:
  - Register custom task types (Courses & Learning, Software Projects, Hobbies & Creative, Deep Work & Career, Reading & Research, Wellness & Routine).
  - Assign alive custom accent colors, icons, and daily target goals in minutes.
- **Daily Schedule & Time Blocking**:
  - Assign specific dates and optional time slots (`09:00`, `11:00`, `14:30`).
  - Prioritize tasks (`low`, `medium`, `high`, `critical`) and decompose tasks into sub-step checklists.
- **Daily Resume & Personal Best Time Analytics**:
  - **Daily Resume**: End-of-day accomplishment breakdown, completion percentage, focus time vs. planned budget, and session timeline.
  - **My Best Time**: Identifies your **Best Single Focus Time**, **Record Productive Day**, **Peak Productivity Hour Window**, and **Time Spent Completing Tasks**.
- **Minimalist Aesthetic with Alive Accent Lights**:
  - Precision dark grayscale design system (`zinc-950`, `zinc-900`, `zinc-800`) paired with vibrant glowing accents (`emerald`, `cyan`, `amber`, `violet`, `rose`) built with Tailwind CSS.
- **SQL-Injection Safe & Fully Documented**:
  - 100% ORM data layer using Sequelize models, parameterized operators, and ACID transactions.
  - Clean JSDoc documentation across all backend controllers, models, routes, and views.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite | Declarative component UI and custom MVC controller hooks |
| **Styling** | Tailwind CSS 3.4 | Modern grayscale design system with glow effects and responsive layouts |
| **Icons** | Lucide React | Clean, consistent vector iconography |
| **Backend** | Node.js, Express.js (ESM) | RESTful API built with the MVC architecture |
| **ORM & DB** | Sequelize 6, PostgreSQL 16 | Parameterized ORM models, validation, associations, and auto-sync |
| **DevOps** | Docker, Docker Compose, Nginx | Multi-stage container builds, automated healthchecks, and reverse proxying |

---

## Quick Start (Docker Compose)

The fastest way to spin up the entire stack on any platform:

### 1. Clone the repository and configure environment:
```bash
git clone https://github.com/deyby01/chrono-focus.git
cd chrono-focus
cp .env.example .env
```

### 2. Launch with Docker Compose:
```bash
docker compose up --build -d
```

### 3. Open in your browser:
- **Web App (Frontend)**: [http://localhost:3000](http://localhost:3000)
- **REST API Healthcheck**: [http://localhost:4001/api/health](http://localhost:4001/api/health)
- **PostgreSQL Database**: `localhost:5433`

### 4. Stop containers:
```bash
docker compose down
```

> [!TIP]
> For complete, step-by-step installation guides covering **Linux**, **macOS**, and **Windows (WSL2 / PowerShell)**, as well as native local development without Docker, check out the [Comprehensive Setup Guide](./docs/SETUP.md).

---

## Local Development (Without Docker)

If you prefer to run services natively on your host machine:

```bash
# 1. Start the PostgreSQL database only:
docker compose up -d db

# 2. Run the Express backend (Terminal 1):
cd backend
npm install
npm run dev

# 3. Run the React frontend (Terminal 2):
cd frontend
npm install
npm run dev
```

The frontend will run on [http://localhost:3000](http://localhost:3000) with hot-module replacement (HMR).

---

## Project Structure (MVC Architecture)

```text
chrono-focus/
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── config/          # Environment & Sequelize connection pool
│       ├── controllers/     # Express MVC Controllers (Category, Task, Session, Analytics)
│       ├── db/              # Database initialization and starter seed logic
│       ├── middlewares/     # Centralized error handling and asyncHandler wrappers
│       ├── models/          # Sequelize entities, associations, and domain model classes
│       ├── routes/          # Modular Express API route definitions
│       ├── utils/           # Custom AppError and slugify utilities
│       ├── views/           # ApiView JSON response serializer
│       ├── types.js         # JSDoc type definitions
│       ├── app.js           # Express app middleware configuration
│       └── server.js        # Server bootstrap and database connection
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js   # Tailwind custom glow shadows & typography
│   └── src/
│       ├── components/      # Reusable UI components (ReverseChronometer, TaskCard, Modals)
│       ├── controllers/     # React MVC controller hooks (useReverseTimer, useWorkspace)
│       ├── models/          # TypeScript domain interfaces and DTOs
│       ├── services/        # REST API client and Web Audio sound synthesis
│       ├── styles/          # Tailwind base and utility classes
│       ├── utils/           # DRY time and date formatting functions
│       └── views/           # Workspace views (Focus Studio, Schedule, Categories, Analytics)
├── docs/
│   ├── SETUP.md             # Detailed installation for Linux, macOS, and Windows
│   ├── ARCHITECTURE.md      # MVC, SOLID, DRY, and system architecture diagrams
│   ├── API_REFERENCE.md     # Complete REST API endpoint documentation
│   ├── DATABASE_SCHEMA.md   # PostgreSQL ER diagram, tables, and constraints
│   └── USER_GUIDE.md        # Step-by-step usage guide and time management tips
├── .env                     # Local environment configuration
├── .env.example             # Template environment variables
├── docker-compose.yml       # Multi-container orchestration (db, backend, frontend)
└── README.md
```

---

## Documentation Hub

Explore the `docs/` folder for in-depth documentation:

- 📖 [**Complete Setup & Installation Guide**](./docs/SETUP.md): OS-specific guides for Linux, macOS, and Windows.
- 📐 [**Architecture & Design Principles**](./docs/ARCHITECTURE.md): Deep-dive into MVC layers, SOLID, DRY, and Mermaid diagrams.
- 🔌 [**REST API Reference**](./docs/API_REFERENCE.md): Full breakdown of request parameters, response schemas, and error codes.
- 🗄️ [**Database Schema**](./docs/DATABASE_SCHEMA.md): Entity-relationship diagram, tables, data types, and indexes.
- 🎯 [**User Guide**](./docs/USER_GUIDE.md): Practical guide to time-blocking your day and getting the most out of your focus sprints.

---

## Contributing & Collaboration

We welcome contributions from the open-source community! Whether you want to fix a bug, improve documentation, suggest a feature, or refactor code, your help is appreciated.

### How to Contribute

1. **Fork the Repository**:
   Click the **Fork** button at the top right of the GitHub repository page to create your own copy.

2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/chrono-focus.git
   cd chrono-focus
   ```

3. **Create a descriptive feature branch**:
   ```bash
   # For new features:
   git checkout -b feature/audio-presets

   # For bug fixes:
   git checkout -b bugfix/timer-drift-fix

   # For documentation updates:
   git checkout -b docs/update-api-guide
   ```

4. **Commit your changes**:
   We recommend following the [Conventional Commits](https://www.conventionalcommits.org/) specification:
   - `feat: add sound volume control to reverse chronometer`
   - `fix: prevent duplicate category slug creation on update`
   - `docs: clarify Windows WSL2 Docker Desktop setup`
   - `refactor: optimize Sequelize eager loading queries`

5. **Ensure code cleanliness & verification**:
   ```bash
   # Backend syntax & type check:
   cd backend && node --check src/server.js

   # Frontend type check & build verification:
   cd ../frontend && npm run build
   ```

6. **Push to your fork and submit a Pull Request (PR)**:
   ```bash
   git push origin feature/your-feature-name
   ```
   Open a Pull Request on GitHub against the `main` branch. Provide a clear summary of what was changed and why.

---

## Reporting Issues & Requesting Features

If you encounter a bug or have an idea for an enhancement:

1. **Check existing issues** to make sure it hasn't already been reported.
2. **Open a new issue** using the appropriate format:
   - **Bug Reports**: Include your OS version (Linux, macOS, Windows), Node/Docker versions, steps to reproduce, expected vs. actual behavior, and relevant console/terminal logs.
   - **Feature Requests**: Describe the problem you are trying to solve and how the proposed feature would improve the user workflow.

---

## Creator & Maintainer

**ChronoFocus** was conceived, designed, and created by:

**Deyby** ([@deyby01](https://github.com/deyby01))

*Passionate about clean code, robust architecture, and building tools that empower developers and learners to achieve deep focus.*

---

## License

This project is open-source and licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute it for personal or commercial projects.
