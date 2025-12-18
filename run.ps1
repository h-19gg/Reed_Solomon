# Reed-Solomon System Launcher

# Settings
$FrontendPort = 8080
$BackendPort = 8000

# Show info
Clear-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reed-Solomon Error Correction System" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Developer: Hussein Fahim Al-Khazaali" -ForegroundColor Green
Write-Host "Email: husseinfaheem6@gmail.com" -ForegroundColor Green
Write-Host "Phone: 07716167814" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check files
Write-Host "Checking files..." -ForegroundColor Yellow
if (-not (Test-Path "backend\app.py")) {
    Write-Host "ERROR: Backend file not found!" -ForegroundColor Red
    Write-Host "Make sure app.py exists in backend folder" -ForegroundColor White
    pause
    exit
}
if (-not (Test-Path "frontend\index.html")) {
    Write-Host "ERROR: Frontend file not found!" -ForegroundColor Red
    Write-Host "Make sure index.html exists in frontend folder" -ForegroundColor White
    pause
    exit
}
Write-Host "OK: Files found" -ForegroundColor Green
Write-Host ""

# Check Python
Write-Host "Checking Python..." -ForegroundColor Yellow
try {
    python --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Python found" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Python may not be in PATH" -ForegroundColor Yellow
    }
} catch {
    Write-Host "WARNING: Python check failed" -ForegroundColor Yellow
}
Write-Host ""

# Install requirements
Write-Host "Installing requirements..." -ForegroundColor Yellow
if (Test-Path "backend\requirements.txt") {
    cd backend
    pip install fastapi uvicorn reedsolo pydantic numpy --quiet 2>$null
    cd ..
    Write-Host "OK: Requirements installed" -ForegroundColor Green
} else {
    Write-Host "WARNING: requirements.txt not found" -ForegroundColor Yellow
}
Write-Host ""

# Show options
Write-Host "System URLs:" -ForegroundColor Cyan
Write-Host "• Main Interface: http://localhost:$FrontendPort" -ForegroundColor Green
Write-Host "• API Docs: http://localhost:$BackendPort/api/docs" -ForegroundColor Green
Write-Host ""

Write-Host "Choose option:" -ForegroundColor Cyan
Write-Host "1 - Start Full System (Recommended)" -ForegroundColor White
Write-Host "2 - Start Backend Only" -ForegroundColor White
Write-Host "3 - Start Frontend Only" -ForegroundColor White
Write-Host "4 - Manual Setup" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

if ($choice -eq "1") {
    # Full system
    Write-Host ""
    Write-Host "Starting Full System..." -ForegroundColor Yellow
    
    # Start Backend
    Write-Host "Starting Backend on port $BackendPort..." -ForegroundColor Cyan
    $backendJob = Start-Job -ScriptBlock {
        cd backend
        python app.py
    }
    
    Start-Sleep -Seconds 3
    
    # Start Frontend
    Write-Host "Starting Frontend on port $FrontendPort..." -ForegroundColor Cyan
    $frontendJob = Start-Job -ScriptBlock {
        cd frontend
        python -m http.server $FrontendPort
    }
    
    Start-Sleep -Seconds 2
    
    # Open browser
    try {
        Start-Process "http://localhost:$FrontendPort"
        Write-Host "Browser opened" -ForegroundColor Green
    } catch {
        Write-Host "Open manually: http://localhost:$FrontendPort" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SYSTEM IS RUNNING!" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access:" -ForegroundColor Cyan
    Write-Host "• Main: http://localhost:$FrontendPort" -ForegroundColor White
    Write-Host "• API: http://localhost:$BackendPort/api/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop: Close this window or press Ctrl+C" -ForegroundColor Red
    
    # Keep running
    try {
        Wait-Job $backendJob, $frontendJob
    } catch {
        Write-Host "System stopped" -ForegroundColor Yellow
    }
    
} elseif ($choice -eq "2") {
    # Backend only
    Write-Host ""
    Write-Host "Starting Backend Only..." -ForegroundColor Yellow
    cd backend
    python app.py
    cd ..
    
} elseif ($choice -eq "3") {
    # Frontend only
    Write-Host ""
    Write-Host "Starting Frontend Only..." -ForegroundColor Yellow
    cd frontend
    python -m http.server $FrontendPort
    cd ..
    
} elseif ($choice -eq "4") {
    # Manual
    Write-Host ""
    Write-Host "Manual Setup:" -ForegroundColor Yellow
    Write-Host "1. For Backend: Open PowerShell, type: cd backend ; python app.py" -ForegroundColor White
    Write-Host "2. For Frontend: Open another PowerShell, type: cd frontend ; python -m http.server $FrontendPort" -ForegroundColor White
    Write-Host "3. Open browser: http://localhost:$FrontendPort" -ForegroundColor White
    Write-Host ""
    pause
    
} else {
    Write-Host "Invalid choice" -ForegroundColor Red
    pause
}