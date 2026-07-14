

Set-Location -Path $PSScriptRoot

Write-Host "Starting HomeCareMarket Backend (Daphne ASGI Server)..." -ForegroundColor Cyan
Write-Host "WebSocket support: ENABLED" -ForegroundColor Green
Write-Host "Listening on: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""


.\venv\Scripts\daphne.exe -b 0.0.0.0 -p 8000 homecare_market.asgi:application
