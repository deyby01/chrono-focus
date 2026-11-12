COMPOSE       := docker compose
TAIL          ?= 100
POSTGRES_USER ?= chronofocus
POSTGRES_DB   ?= chronofocus_db
BACKEND_PORT  ?= 4001

.DEFAULT_GOAL := help

.PHONY: help up up-build build down restart ps health \
        logs logs-back logs-front logs-db \
        sh-back sh-front db-shell dev-db reset-db check

help: ## Show all available commands
	@echo ""
	@echo "ChronoFocus — Available Shortcuts"
	@echo "----------------------------------"
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z0-9_-]+:.*## / {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# --- Docker Compose Lifecycle ---

up: ## Start all services in background (db, backend, frontend)
	$(COMPOSE) up -d

up-build: ## Rebuild images and start all services
	$(COMPOSE) up --build -d

build: ## Build all Docker images without starting containers
	$(COMPOSE) build

down: ## Stop and remove containers (preserves database volume)
	$(COMPOSE) down

restart: ## Restart all running services
	$(COMPOSE) restart

ps: ## Show status and ports of all containers
	$(COMPOSE) ps

health: ## Check backend API and database health
	curl -fsS http://localhost:$(BACKEND_PORT)/api/health && echo ""

# --- Logs ---

logs: ## Follow live logs for all services (override lines with TAIL=200)
	$(COMPOSE) logs -f --tail=$(TAIL)

logs-back: ## Follow live logs for the backend API
	$(COMPOSE) logs -f --tail=$(TAIL) backend

logs-front: ## Follow live logs for the frontend Nginx server
	$(COMPOSE) logs -f --tail=$(TAIL) frontend

logs-db: ## Follow live logs for PostgreSQL
	$(COMPOSE) logs -f --tail=$(TAIL) db

# --- Container Shells & Local Dev ---

dev-db: ## Start only PostgreSQL for local backend/frontend development
	$(COMPOSE) up -d db

sh-back: ## Open an interactive shell inside the backend container
	$(COMPOSE) exec backend sh

sh-front: ## Open an interactive shell inside the frontend container
	$(COMPOSE) exec frontend sh

db-shell: ## Open PostgreSQL CLI (psql) inside the db container
	$(COMPOSE) exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

reset-db: ## Wipe database volume and rebuild stack from scratch
	$(COMPOSE) down -v
	$(COMPOSE) up --build -d

# --- Code Checks ---

check: ## Run backend syntax check and frontend TypeScript check
	@for f in $$(find backend/src -name "*.js"); do node --check "$$f" || exit 1; done
	@echo "Backend syntax OK"
	cd frontend && npm run build

