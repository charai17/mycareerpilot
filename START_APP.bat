@echo off
cd /d "%~dp0"
echo Starting mycareerpilot...
echo.
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo Stopping old local server on port 3000...
  taskkill /PID %%a /F >nul 2>nul
)
echo.
echo Cleaning old local build cache...
if exist ".next" rmdir /s /q ".next"
echo.
echo When it says "Ready", open http://localhost:3000
echo Keep this window open while using the app.
echo.
npm.cmd run dev -- -H 127.0.0.1 -p 3000
pause
