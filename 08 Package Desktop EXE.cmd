@echo off
setlocal
title Package Job tracker Desktop EXE

set "ROOT=%~dp0"

echo.
echo Packaging Job tracker desktop EXE...
echo ====================================
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

if not exist "%ROOT%desktop\node_modules\electron-builder" (
  echo EXE packager is missing. Running npm install...
  pushd "%ROOT%desktop"
  call npm.cmd install
  if errorlevel 1 (
    popd
    echo Desktop package install failed.
    pause
    exit /b 1
  )
  popd
)

echo Creating portable EXE...
pushd "%ROOT%desktop"
call npm.cmd run package:win
if errorlevel 1 (
  popd
  echo EXE packaging failed.
  pause
  exit /b 1
)
popd

echo.
echo Done.
echo EXE location:
echo %ROOT%desktop\dist\APAC-Remote-Job-Tracker.exe
echo.
echo Keep the EXE inside this project folder so it can find api and web files.
echo.
pause
