@echo off
setlocal
title Stop Job tracker

echo.
echo Stopping Job tracker local servers...
echo ====================================
echo.

taskkill /FI "WINDOWTITLE eq APAC Job Tracker API*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq APAC Job Tracker Web*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq APAC Job Tracker Sync*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq APAC Job Tracker Desktop*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq APAC Remote Job Tracker*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Job tracker API*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Job tracker Web*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Job tracker Sync*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq Job tracker Desktop*" /T /F >nul 2>nul

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; try { $root=(Resolve-Path '%~dp0').Path; $nodes=Get-CimInstance Win32_Process -Filter \"name = 'node.exe'\"; $electrons=Get-CimInstance Win32_Process -Filter \"name = 'electron.exe'\"; $targets=@($nodes)+@($electrons) | Where-Object { ($_.CommandLine -like \"*$root*\") -or ($_.CommandLine -match 'vite\\bin\\vite\.js.*5173') -or ($_.CommandLine -match 'tsx\\dist\\cli\.mjs.*src/server\.ts') -or ($_.CommandLine -match 'src/importJobs\.ts') }; foreach ($p in $targets) { try { Stop-Process -Id $p.ProcessId -Force; Write-Host \"Stopped process $($p.ProcessId)\" } catch {} } } catch { Write-Host 'Could not inspect node/electron command lines. If setup still says the API is running, close node.exe or electron.exe from Task Manager.' }"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -UseBasicParsing 'http://localhost:4000/health' -TimeoutSec 2 | Out-Null; Write-Host 'Warning: API is still responding on port 4000. Close remaining node.exe/electron.exe processes before setup.' } catch { Write-Host 'Local API is stopped.' }"

echo.
echo Done. If any API/Web window is still open, you can close it manually.
echo.
pause
