@echo off
setlocal
title Deploy APAC Job Tracker Web

set "ROOT=%~dp0"

echo.
echo Deploying Web to Vercel
echo =======================
echo.
echo Before continuing, set this Web environment variable in Vercel:
echo.
echo VITE_API_BASE_URL=https://your-api-project.vercel.app
echo.
echo This command may ask you to log in to Vercel in the browser.
echo.
pause

pushd "%ROOT%web"
call npx.cmd vercel --prod
set "DEPLOY_EXIT=%ERRORLEVEL%"
popd

echo.
if "%DEPLOY_EXIT%"=="0" (
  echo Web deploy command finished.
) else (
  echo Web deploy command failed or was cancelled.
)
echo.
pause
exit /b %DEPLOY_EXIT%
