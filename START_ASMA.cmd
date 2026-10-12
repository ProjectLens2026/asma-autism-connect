@echo off
cd /d "%~dp0"
call npm run build
if errorlevel 1 goto failed
echo.
echo Close old Asma tabs, then open http://localhost:4173
echo Keep this window open. Press Ctrl+C to stop.
call npm start
:failed
pause
