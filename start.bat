@echo off
REM Raza Boiler - Quick Start Script for Windows

echo.
echo ========================================
echo   RAZA BOILER - Quick Start
echo ========================================
echo.

REM Check if Node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

REM Check if MySQL is running
netstat -ano | findstr :3306 >nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: MySQL not running on port 3306
    echo Start XAMPP and enable MySQL
    pause
    exit /b 1
)

REM STEP 1: Database Import
echo.
echo [STEP 1] Database Setup
echo ========================================
echo.
echo 1. Open http://localhost/phpmyadmin
echo 2. Click "Import" tab
echo 3. Click "Choose File" and select: database.sql
echo 4. Click "GO"
echo.
pause /b

REM STEP 2: Backend
echo.
echo [STEP 2] Installing Backend...
echo ========================================
cd backend
call npm install
echo.
echo Starting backend server on http://localhost:3000
echo Keep this window open!
echo.
start cmd /k "node server.js"
timeout /t 3

REM STEP 3: Frontend
echo.
echo [STEP 3] Installing Frontend...
echo ========================================
cd ..
call npm install
echo.
echo Starting frontend...
echo.
start cmd /k "npm run dev"
timeout /t 3

REM STEP 4: Done
echo.
echo ========================================
echo   SYSTEM READY!
echo ========================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:3000
echo Database:  razaboiler
echo.
echo Press ENTER to exit this script
echo (Frontend and Backend will continue running)
echo.
pause

exit /b 0
