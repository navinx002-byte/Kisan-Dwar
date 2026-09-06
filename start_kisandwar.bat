@echo off
title KisanDwar - SIH 2026 Prototype Server
color 0A

echo ===================================================
echo   Starting KisanDwar Prototype Backend...
echo ===================================================
echo.

cd /d "C:\Users\Navin D\.gemini\antigravity\scratch\kisandwar"

echo [1/2] Installing required lightweight Python libraries...
pip install flask flask-cors werkzeug

echo.
echo [2/2] Starting Flask Web Server on http://127.0.0.1:5000 ...
echo.
echo ===================================================
echo   Server is running! KEEP THIS WINDOW OPEN.
echo   Opening browser now...
echo ===================================================
echo.

start http://127.0.0.1:5000

python app.py
pause
