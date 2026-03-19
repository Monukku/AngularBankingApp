@echo off
REM ============================================================
REM RewaBank Angular App - Complete Setup Script
REM ============================================================
REM This script automates the entire setup process

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║  RewaBank Angular App - Automated Setup               ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ ERROR: package.json not found
    echo Please run this script from the Angular project root directory
    pause
    exit /b 1
)

echo ✅ Found Angular project

REM Step 1: Install dependencies
echo.
echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    pause
    exit /b 1
)
echo ✅ Dependencies installed

REM Step 2: Build the app
echo.
echo [2/5] Building Angular app...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ Build successful

REM Step 3: Start the app
echo.
echo [3/5] Starting Angular dev server...
echo Starting on http://localhost:4200
echo Press Ctrl+C to stop the server
echo.
call npm start

REM The script ends here when npm start is running
pause
exit /b 0

