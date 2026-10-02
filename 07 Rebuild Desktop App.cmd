@echo off
setlocal
title Rebuild Job tracker Desktop

set "ROOT=%~dp0"

echo.
echo Rebuilding Job tracker desktop assets...
echo ========================================
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
  if errorlevel 1 (
    popd
    echo Web dependency install failed.
    pause
    exit /b 1
  )
  popd
)

if not exist "%ROOT%desktop\node_modules\electron" (
  echo Desktop dependency is missing. Running npm install...
  pushd "%ROOT%desktop"
  call npm.cmd install
  if errorlevel 1 (
    popd
    echo Desktop dependency install failed.
    pause
    exit /b 1
  )
  popd
)

echo Building API...
pushd "%ROOT%api"
call npm.cmd run build
if errorlevel 1 (
  popd
  echo API build failed.
  pause
  exit /b 1
)
popd

echo Building web app...
pushd "%ROOT%web"
call npm.cmd run build
if errorlevel 1 (
  popd
  echo Web build failed.
  pause
  exit /b 1
)
popd

echo.
echo Rebuild complete.
echo Now double-click "06 Start Desktop App.cmd".
echo.
pause
