.PHONY: help up down restart logs build clean dev prod health

# Default target
help:
	@echo "API Gateway - Docker Compose Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View logs (all services)"
	@echo "  make logs-api    - View API Gateway logs only"
	@echo "  make logs-rmq    - View RabbitMQ logs only"
	@echo "  make build       - Rebuild and start services"
	@echo "  make clean       - Stop and remove all containers, networks, and volumes"
	@echo "  make dev         - Start in development mode (with hot reload)"
	@echo "  make prod        - Start in production mode"
	@echo "  make health      - Check health status of services"
	@echo "  make shell       - Open shell in API Gateway container"
	@echo "  make rmq-ui      - Open RabbitMQ Management UI in browser"

# Start services
up:
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "API Gateway: http://localhost:3000"
	@echo "Swagger Docs: http://localhost:3000/docs"
	@echo "RabbitMQ UI: http://localhost:15672"

# Stop services
down:
	docker-compose down
	@echo "✅ Services stopped!"

# Restart services
restart:
	docker-compose restart
	@echo "✅ Services restarted!"

# View logs
logs:
	docker-compose logs -f

# View API Gateway logs only
logs-api:
	docker-compose logs -f api-gateway

# View RabbitMQ logs only
logs-rmq:
	docker-compose logs -f rabbitmq

# Rebuild and start
build:
	docker-compose up -d --build
	@echo "✅ Services rebuilt and started!"

# Clean everything
clean:
	docker-compose down -v
	@echo "✅ All containers, networks, and volumes removed!"

# Development mode (requires uncommenting command in docker-compose.yml)
dev:
	@echo "Starting in development mode..."
	@echo "Make sure to uncomment 'command: npm run start:dev' in docker-compose.yml"
	docker-compose up -d
	docker-compose logs -f api-gateway

# Production mode
prod:
	@echo "Starting in production mode..."
	docker-compose up -d --build
	@echo "✅ Production services started!"

# Health check
health:
	@echo "Checking API Gateway health..."
	@curl -s http://localhost:3000/api/v1/health || echo "❌ API Gateway not responding"
	@echo ""
	@echo "Checking RabbitMQ health..."
	@docker-compose exec rabbitmq rabbitmq-diagnostics ping || echo "❌ RabbitMQ not responding"

# Open shell in API Gateway container
shell:
	docker-compose exec api-gateway sh

# Open RabbitMQ Management UI (Windows)
rmq-ui:
	@echo "Opening RabbitMQ Management UI..."
	@start http://localhost:15672

# Install dependencies
install:
	npm install

# Run tests
test:
	npm test

# Run linter
lint:
	npm run lint

# Format code
format:
	npm run format
