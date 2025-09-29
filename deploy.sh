#!/bin/bash

# CSM Clinic Dashboard Deployment Script
# This script helps deploy the application using Docker Compose

set -e

echo "🚀 Starting CSM Clinic Dashboard deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from env.docker template..."
    cp env.docker .env
    print_warning "Please update .env file with your actual API keys and configuration."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads
mkdir -p ssl

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Remove old images (optional)
if [ "$1" = "--clean" ]; then
    print_status "Cleaning up old images..."
    docker-compose down --rmi all
fi

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service status..."
docker-compose ps

# Run database migrations (if needed)
print_status "Running database setup..."
docker-compose exec app npm run db:migrate || print_warning "Database migration failed or not needed"

# Check if application is accessible
print_status "Checking application health..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "✅ Application is running successfully!"
    print_status "🌐 Application URL: http://localhost:3000"
    print_status "🗄️  Database URL: postgres://postgres:postgres@localhost:5432/csm_clinic_dashboard"
else
    print_error "❌ Application is not accessible. Check logs with: docker-compose logs app"
fi

# Show logs
print_status "Showing recent logs..."
docker-compose logs --tail=20

echo ""
print_status "🎉 Deployment completed!"
print_status "To view logs: docker-compose logs -f"
print_status "To stop services: docker-compose down"
print_status "To restart services: docker-compose restart"
