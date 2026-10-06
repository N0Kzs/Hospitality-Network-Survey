@echo off
echo ========================================================
echo   Hospitality Network Survey - Project Setup
echo ========================================================
echo.

echo 1. Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/ first.
    pause
    exit /b
)
echo Node.js is installed.
echo.

echo 2. Installing project dependencies (like requirements.txt)...
call npm install
echo.

echo 3. Checking for environment variables file (.env.local)...
if not exist ".env.local" (
    echo NOTE: .env.local was not found. Creating a template from .env.example...
    copy .env.example .env.local
    echo Please open .env.local and add the required SESSION_SECRET and ADMIN_USERS!
) else (
    echo .env.local is present.
)
echo.

echo ========================================================
echo Setup Complete! 
echo To start the application, run: npm run dev
echo ========================================================
pause
