@echo off
setlocal
set ROOT=%~dp0
title iNNv0 Dev Environment

echo.
echo +----------------------------------------------------+
echo ^|            iNNv0 - Dev Environment                 ^|
echo +----------------------------------------------------+
echo.

REM ── Kill any stale node/vite processes to free ports ──
echo   Cleaning up stale processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo   Done.
echo.

echo Starting 4 development servers in their own windows...
echo.

echo   [cogNNitive]  http://localhost:8080
start "cogNNitive" cmd /c "title cogNNitive && cd /d %ROOT% && npx http-server docs/ -p 8080 -c-1 --silent"

echo   [file-format]  http://localhost:3001
start "file-format" cmd /c "title file-format && cd /d %ROOT%..\file-format && npx vite --port 3001 --host"

echo   [folder-format] http://localhost:3002
start "folder-format" cmd /c "title folder-format && cd /d %ROOT%..\folder-format && npx vite --port 3002 --host"

echo   [launcher]     http://localhost:5173
start "launcher" cmd /c "title launcher && cd /d %ROOT%apps\launcher && npx vite --port 5173 --host"

echo.
echo +----------------------------------------------------+
echo ^|  Server            Window Title       URL           ^|
echo ^|  cogNNitive     - cogNNitive       - http://localhost:8080 ^|
echo ^|  file-format    - file-format      - http://localhost:3001 ^|
echo ^|  folder-format  - folder-format    - http://localhost:3002 ^|
echo ^|  launcher       - launcher         - http://localhost:5173 ^|
echo +----------------------------------------------------+
echo.
echo Each server runs in its own window. Close the windows
echo or press Ctrl+C here to stop all servers.
echo.
pause >nul

echo.
echo Stopping all servers...
taskkill /f /im node.exe >nul 2>&1
echo Done.
echo.

endlocal
