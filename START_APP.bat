@echo off
cd /d "%~dp0"
echo Starting mycareerpilot...
echo.
echo When it says "Ready", open http://localhost:3000
echo Keep this window open while using the app.
echo.
npm.cmd run dev -- -H 127.0.0.1 -p 3000
pause
