@echo off
setlocal
title Job tracker Desktop Launcher

set "ROOT=%~dp0"

echo.
echo Starting Job tracker as a desktop app...
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
  echo Desktop app dependency is missing. Running npm install...
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

if not exist "%ROOT%desktop\node_modules\electron\dist\electron.exe" (
  echo Electron runtime is missing. Finishing Electron install...
  pushd "%ROOT%desktop"
  call node.exe node_modules\electron\install.js
  if errorlevel 1 (
    popd
    echo Electron runtime install failed.
    pause
    exit /b 1
  )
  popd
)

if not exist "%ROOT%api\dist\app.js" (
  echo API build is missing. Building API...
  pushd "%ROOT%api"
  call npm.cmd run build
  if errorlevel 1 (
    popd
    echo API build failed.
    pause
    exit /b 1
  )
  popd
)

if not exist "%ROOT%web\dist\index.html" (
  echo Web build is missing. Building web app...
  pushd "%ROOT%web"
  call npm.cmd run build
  if errorlevel 1 (
    popd
    echo Web build failed.
    pause
    exit /b 1
  )
  popd
)

echo Opening desktop window...
start "Job tracker Desktop" /D "%ROOT%desktop" cmd /k "title Job tracker Desktop && npm.cmd start"

echo.
echo The desktop app is starting.
echo You do not need to open a browser.
echo.
timeout /t 3 /nobreak >nul
