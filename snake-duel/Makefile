.PHONY: help install dev run-backend run-frontend test test-backend test-frontend build generate-client clean

# Default target
help:
	@echo "Snake Duel Project Makefile"
	@echo "Usage:"
	@echo "  make install          Install all dependencies (root, backend, frontend)"
	@echo "  make dev              Run backend and frontend concurrently"
	@echo "  make run-backend      Run backend server only"
	@echo "  make run-frontend     Run frontend dev server only"
	@echo "  make test             Run all tests"
	@echo "  make test-backend     Run backend tests"
	@echo "  make test-frontend    Run frontend tests"
	@echo "  make build            Build frontend for production"
	@echo "  make generate-client  Generate API client from OpenAPI spec"
	@echo "  make clean            Clean up build artifacts and dependencies"

# Install dependencies
install:
	@echo "Installing root dependencies..."
	npm install
	@echo "Installing backend dependencies..."
	cd backend && uv sync
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

# Development
dev:
	npm run dev

run-backend:
	cd backend && uv run main.py

run-frontend:
	cd frontend && npm run dev

# Testing
test: test-backend test-frontend

test-backend:
	@echo "Running backend tests..."
	cd backend && uv run pytest

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm run test

# Build
build:
	@echo "Building frontend..."
	cd frontend && npm run build

# Code Generation
generate-client:
	@echo "Generating API client..."
	cd frontend && npx openapi-typescript-codegen --input ../openapi.yaml --output ./src/client --client fetch

# Clean
clean:
	@echo "Cleaning up..."
	rm -rf node_modules
	rm -rf backend/.venv
	rm -rf backend/__pycache__
	rm -rf backend/app/__pycache__
	rm -rf backend/tests/__pycache__
	rm -rf frontend/node_modules
	rm -rf frontend/dist
	@echo "Clean complete."
