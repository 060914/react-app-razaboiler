#!/bin/bash
# Raza Boiler - Quick Start Script

echo "🚀 Raza Boiler Management System - Setup Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# STEP 1: Database
echo -e "${YELLOW}[1/4] Setting up Database...${NC}"
echo "Run this in MySQL/phpMyAdmin:"
echo "-----"
echo "1. Go to http://localhost/phpmyadmin"
echo "2. Click 'Import'"
echo "3. Select 'database.sql'"
echo "4. Click 'Import'"
echo ""
echo "OR from command line:"
echo "  mysql -u root -p < database.sql"
echo "-----"
read -p "Press ENTER when database is imported..."

# STEP 2: Backend
echo ""
echo -e "${YELLOW}[2/4] Starting Backend Server...${NC}"
echo "Installing dependencies..."
cd backend
npm install > /dev/null 2>&1

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""
echo "Starting backend (keep this terminal open)..."
echo "  Running: node server.js"
echo ""
node server.js &
BACKEND_PID=$!
sleep 2

# STEP 3: Frontend
echo ""
echo -e "${YELLOW}[3/4] Starting Frontend...${NC}"
echo "Installing dependencies..."
cd ..
npm install > /dev/null 2>&1

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""
echo "Starting frontend (in new window)..."
npm run dev &
FRONTEND_PID=$!
sleep 3

# STEP 4: Ready
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ System Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "⚙️  Backend:  http://localhost:3000"
echo "🗄️  Database: razaboiler on localhost"
echo ""
echo "✓ Backend PID: $BACKEND_PID"
echo "✓ Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop servers, press Ctrl+C"
echo ""

# Keep script running
wait
