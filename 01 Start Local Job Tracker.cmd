@echo off
setlocal
title Job tracker Launcher

set "ROOT=%~dp0"
set "SYNC_MINUTES=15"
set "LINKEDIN_IMPORT_PAGE_LIMIT=1"

echo.
echo Starting Job tracker locally with auto-sync...
echo =============================================
echo.

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Please install Node.js first:
  echo https://nodejs.org/
  echo.
  pause
  exit /b 1
)

if not exist "%ROOT%api\node_modules" (
  echo API dependencies are missing. Running npm install...
  pushd "%ROOT%api"
  call npm.cmd install --ignore-scripts
  if errorlevel 1 (
    popd
    echo API dependency install failed.
    pause
    exit /b 1
  )
  call npx.cmd prisma generate --schema prisma/schema.prisma
  if errorlevel 1 (
    popd
    echo Prisma client generation failed.
    pause
    exit /b 1
  )
  popd
)

if not exist "%ROOT%web\node_modules" (
  echo Web dependencies are missing. Running npm install...
  pushd "%ROOT%web"
  call npm.cmd install
  popd
)

echo Opening API server window...
start "Job tracker API" /D "%ROOT%api" cmd /k "title Job tracker API && set IMPORT_CRON_ENABLED=false&& npm.cmd run dev"

echo Opening web server window...
start "Job tracker Web" /D "%ROOT%web" cmd /k "title Job tracker Web && npm.cmd run dev -- --port 5173 --strictPort"

echo Opening auto-sync window...
start "Job tracker Sync" /D "%ROOT%api" powershell -NoExit -ExecutionPolicy Bypass -Command "$Host.UI.RawUI.WindowTitle='Job tracker Sync'; $env:LINKEDIN_IMPORT_PAGE_LIMIT='%LINKEDIN_IMPORT_PAGE_LIMIT%'; $minutes=%SYNC_MINUTES%; while ($true) { Clear-Host; Write-Host 'Job tracker Auto Sync'; Write-Host '====================='; Write-Host ('Sync started: ' + (Get-Date)); Write-Host ''; & npm.cmd run import:jobs; Write-Host ''; Write-Host ('Next sync in ' + $minutes + ' minutes. Keep this window open.'); Write-Host 'Refresh http://localhost:5173 after a sync finishes.'; Start-Sleep -Seconds ($minutes * 60) }"

echo.
echo Waiting for local servers...
timeout /t 8 /nobreak >nul

echo Opening browser...
start "" "http://localhost:5173"

echo.
echo Local app URL:
echo http://localhost:5173
echo.
echo Auto-sync is running every %SYNC_MINUTES% minutes.
echo Keep the API, Web, and Sync command windows open while using the app.
echo To stop everything, double-click "03 Stop Local Job Tracker.cmd".
echo.
pause
