@echo off
echo =====================================================
echo FASHION PARK INVENTORY SYSTEM - QUICK START
echo =====================================================
echo.

echo 🚀 Starting Fashion Park Inventory System...
echo.

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies installed successfully!
echo.

echo 🔧 Setting up environment...
if not exist .env (
    copy env-template.txt .env
    echo ⚠️  Please edit .env file with your MySQL credentials
    echo.
    pause
)

echo.
echo 🗄️  Starting server...
echo 📍 Server will run on http://localhost:3000
echo 📊 Health check: http://localhost:3000/
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

pause
