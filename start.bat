@echo off
title Hospital Management System
echo ============================================================
echo   Hospital Management System - Starting...
echo ============================================================
echo.

cd /d "%~dp0"

echo Starting Flask server...
echo Once you see "Running on http://127.0.0.1:5000", open your browser.
echo.

start "" "http://127.0.0.1:5000"

python app.py

pause
