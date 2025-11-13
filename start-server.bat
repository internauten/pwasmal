@echo off
echo Starting PWA Development Server...
echo.
echo The app will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python HTTP Server
    python -m http.server 8000
) else (
    REM Check if Node.js is installed
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Python not found. Using npx http-server
        npx http-server -p 8000
    ) else (
        echo Error: Neither Python nor Node.js found!
        echo Please install Python or Node.js to run a local server.
        pause
    )
)
