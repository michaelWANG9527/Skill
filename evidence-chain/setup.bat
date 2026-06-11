@echo off
rem ============================================
rem  Evidence Chain System - One-time setup
rem  (Shuang Ji = double-click this file)
rem  Requirements: Node.js only. NO Docker needed.
rem ============================================
cd /d %~dp0

echo.
echo ========================================
echo  [Setup 1/4] Creating config file...
echo ========================================
if not exist .env copy .env.example .env >nul

echo.
echo ========================================
echo  [Setup 2/4] Installing packages...
echo  (3-10 minutes, please wait)
echo ========================================
call npm install
if errorlevel 1 goto :error

echo.
echo ========================================
echo  [Setup 3/4] Creating database...
echo ========================================
call npx prisma generate
if errorlevel 1 goto :error
call npx prisma db push
if errorlevel 1 goto :error

echo.
echo ========================================
echo  [Setup 4/4] Creating demo accounts...
echo ========================================
call node prisma/seed.js
if errorlevel 1 goto :error

echo.
echo ============================================
echo  SETUP COMPLETE!  ^(an zhuang wan cheng^)
echo.
echo  Next step: double-click  start.bat
echo.
echo  Login account:  admin
echo  Password:       Admin@123456
echo ============================================
echo.
pause
exit /b 0

:error
echo.
echo ============================================
echo  SETUP FAILED - see error message above
echo  Make sure Node.js is installed: nodejs.org
echo ============================================
echo.
pause
exit /b 1
