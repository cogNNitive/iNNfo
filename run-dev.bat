@echo off
setlocal

:: iNNv0 cogNNitive - Web Server
:: Serves the public website from docs/ (no build step required)

echo [cogNNitive] Starting web server at http://localhost:8080...
echo [cogNNitive] Open http://localhost:8080 in your browser.
echo [cogNNitive] Press Ctrl+C to stop.
echo.

npx http-server docs/ -p 8080 -c-1 --silent

endlocal
