@echo off
setlocal
title Deploy APAC Job Tracker API

set "ROOT=%~dp0"

echo.
echo Deploying API to Vercel
echo =======================
echo.
echo Before continuing, set API environment variables in Vercel:
echo.
echo DATABASE_URL
echo CORS_ORIGIN
echo CRON_SECRET
echo LINKEDIN_IMPORT_PAGE_LIMIT
echo IMPORT_CRON_ENABLED=false
echo.
echo This command may ask you to log in to Vercel in the browser.
echo.
pause

pushd "%ROOT%api"
call npx.cmd vercel --prod
set "DEPLOY_EXIT=%ERRORLEVEL%"
popd

echo.
if "%DEPLOY_EXIT%"=="0" (
  echo API deploy command finished.
) else (
  echo API deploy command failed or was cancelled.
)
echo.
pause
exit /b %DEPLOY_EXIT%
