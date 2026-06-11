@echo off
rem ============================================
rem  Evidence Chain System - Start server
rem  Double-click to start. Keep window OPEN.
rem ============================================
cd /d %~dp0

if not exist node_modules (
  echo Please run setup.bat first!
  pause
  exit /b 1
)

echo.
echo ============================================
echo  Starting Evidence Chain System...
echo.
echo  Browser will open automatically in ~15s.
echo  Or visit:  http://localhost:3000
echo.
echo  Login:     admin / Admin@123456
echo.
echo  IMPORTANT: Keep this window OPEN!
echo  Close this window = stop the system.
echo ============================================
echo.

start "" /min cmd /c "timeout /t 15 /nobreak >nul && start http://localhost:3000"
call npm run dev
pause
