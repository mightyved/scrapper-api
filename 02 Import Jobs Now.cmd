@echo off
setlocal
title Job tracker Import

set "ROOT=%~dp0"
set "LINKEDIN_IMPORT_PAGE_LIMIT=3"

echo.
echo Importing jobs now...
echo =====================
echo.
echo This may take a minute or two.
echo.

pushd "%ROOT%api"
call npm.cmd run import:jobs
set "IMPORT_EXIT=%ERRORLEVEL%"
popd

echo.
if "%IMPORT_EXIT%"=="0" (
  echo Import finished.
) else (
  echo Import finished with errors. Check the messages above.
)
echo.
pause
exit /b %IMPORT_EXIT%
