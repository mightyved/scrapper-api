@echo off
setlocal
title Job tracker Setup

set "ROOT=%~dp0"

echo.
echo Job tracker - local setup
echo =========================
echo.

echo Stopping any running tracker windows...
taskkill /FI "WINDOWTITLE eq APAC Job Tracker API*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq APAC Job Tracker Web*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq APAC Job Tracker Sync*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq APAC Job Tracker Desktop*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq APAC Remote Job Tracker*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Job tracker API*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Job tracker Web*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Job tracker Sync*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Job tracker Desktop*" /T /F >nul 2>nul
timeout /t 2 /nobreak >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing 'http://localhost:4000/health' -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if not errorlevel 1 (
  echo.
  echo The local API is still running on http://localhost:4000.
  echo Close APAC Remote Job Tracker, node.exe, and electron.exe, or run "03 Stop Local Job Tracker.cmd", then run setup again.
  echo.
  pause
  exit /b 1
)

where node.exe >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js first:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please reinstall Node.js with npm enabled.
  echo.
  pause
  exit /b 1
)

echo Installing API dependencies...
pushd "%ROOT%api"
call npm.cmd install --ignore-scripts
if errorlevel 1 (
  echo.
  echo API dependency install failed.
  popd
  pause
  exit /b 1
)

echo.
echo Cleaning old Prisma temp engine files...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$client=Join-Path (Resolve-Path '.').Path 'node_modules\.prisma\client'; if (Test-Path $client) { Get-ChildItem -LiteralPath $client -Filter 'query_engine-windows.dll.node.tmp*' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue }"

echo.
echo Generating Prisma client...
call npx.cmd prisma generate --schema prisma/schema.prisma
if errorlevel 1 (
  echo.
  echo Prisma generate failed. Waiting 5 seconds, cleaning temp files, then retrying once...
  timeout /t 5 /nobreak >nul
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$client=Join-Path (Resolve-Path '.').Path 'node_modules\.prisma\client'; if (Test-Path $client) { Get-ChildItem -LiteralPath $client -Filter 'query_engine-windows.dll.node.tmp*' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue }"
  call npx.cmd prisma generate --schema prisma/schema.prisma
)
if errorlevel 1 (
  echo.
  echo Prisma client generation failed.
  echo Close every APAC Job Tracker, node.exe, and electron.exe window, then run this setup again.
  popd
  pause
  exit /b 1
)

echo.
echo Creating database if it is missing...
set "CREATE_DB_SQL=%TEMP%\apac_job_tracker_create_db.sql"
> "%CREATE_DB_SQL%" echo CREATE DATABASE apac_remote_job_tracker;
call npx.cmd prisma db execute --stdin --url "postgresql://postgres:postgres@localhost:5432/postgres?schema=public" < "%CREATE_DB_SQL%"
del "%CREATE_DB_SQL%" >nul 2>nul

echo.
echo Applying database schema...
call npx.cmd prisma db push --schema prisma/schema.prisma
if errorlevel 1 (
  echo.
  echo Database setup failed.
  echo Make sure PostgreSQL is running and api\.env has the correct DATABASE_URL.
  popd
  pause
  exit /b 1
)

echo.
echo Seeding job sources...
call npm.cmd run seed
if errorlevel 1 (
  echo.
  echo Seed failed.
  popd
  pause
  exit /b 1
)
popd

echo.
echo Installing web dependencies...
pushd "%ROOT%web"
call npm.cmd install
if errorlevel 1 (
  echo.
  echo Web dependency install failed.
  popd
  pause
  exit /b 1
)
popd

echo.
echo Setup complete.
echo Next: double-click "01 Start Local Job Tracker.cmd".
echo.
pause
