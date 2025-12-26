# API Gateway Docker Compose Management Script
# Usage: .\manage.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "API Gateway - Docker Compose Commands" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  .\manage.ps1 up          - Start all services"
    Write-Host "  .\manage.ps1 down        - Stop all services"
    Write-Host "  .\manage.ps1 restart     - Restart all services"
    Write-Host "  .\manage.ps1 logs        - View logs (all services)"
    Write-Host "  .\manage.ps1 logs-api    - View API Gateway logs only"
    Write-Host "  .\manage.ps1 logs-rmq    - View RabbitMQ logs only"
    Write-Host "  .\manage.ps1 build       - Rebuild and start services"
    Write-Host "  .\manage.ps1 clean       - Stop and remove all containers, networks, and volumes"
    Write-Host "  .\manage.ps1 dev         - Start in development mode"
    Write-Host "  .\manage.ps1 prod        - Start in production mode"
    Write-Host "  .\manage.ps1 health      - Check health status of services"
    Write-Host "  .\manage.ps1 shell       - Open shell in API Gateway container"
    Write-Host "  .\manage.ps1 rmq-ui      - Open RabbitMQ Management UI in browser"
    Write-Host "  .\manage.ps1 install     - Install npm dependencies"
    Write-Host "  .\manage.ps1 test        - Run tests"
    Write-Host "  .\manage.ps1 lint        - Run linter"
    Write-Host ""
}

function Start-Services {
    Write-Host "Starting services..." -ForegroundColor Green
    docker-compose up -d
    Write-Host ""
    Write-Host "✅ Services started!" -ForegroundColor Green
    Write-Host "API Gateway: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Swagger Docs: http://localhost:3000/docs" -ForegroundColor Cyan
    Write-Host "RabbitMQ UI: http://localhost:15672" -ForegroundColor Cyan
}

function Stop-Services {
    Write-Host "Stopping services..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ Services stopped!" -ForegroundColor Green
}

function Restart-Services {
    Write-Host "Restarting services..." -ForegroundColor Yellow
    docker-compose restart
    Write-Host "✅ Services restarted!" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "Showing logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose logs -f
}

function Show-ApiLogs {
    Write-Host "Showing API Gateway logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose logs -f api-gateway
}

function Show-RabbitMQLogs {
    Write-Host "Showing RabbitMQ logs (Ctrl+C to exit)..." -ForegroundColor Cyan
    docker-compose logs -f rabbitmq
}

function Build-Services {
    Write-Host "Rebuilding and starting services..." -ForegroundColor Green
    docker-compose up -d --build
    Write-Host "✅ Services rebuilt and started!" -ForegroundColor Green
}

function Clean-All {
    Write-Host "Cleaning all containers, networks, and volumes..." -ForegroundColor Red
    $confirmation = Read-Host "Are you sure? This will delete all data. (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        docker-compose down -v
        Write-Host "✅ All containers, networks, and volumes removed!" -ForegroundColor Green
    } else {
        Write-Host "Cancelled." -ForegroundColor Yellow
    }
}

function Start-Dev {
    Write-Host "Starting in development mode..." -ForegroundColor Green
    Write-Host "Make sure to uncomment 'command: npm run start:dev' in docker-compose.yml" -ForegroundColor Yellow
    docker-compose up -d
    docker-compose logs -f api-gateway
}

function Start-Prod {
    Write-Host "Starting in production mode..." -ForegroundColor Green
    docker-compose up -d --build
    Write-Host "✅ Production services started!" -ForegroundColor Green
}

function Check-Health {
    Write-Host "Checking API Gateway health..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/health" -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ API Gateway is healthy" -ForegroundColor Green
    } catch {
        Write-Host "❌ API Gateway not responding" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Checking RabbitMQ health..." -ForegroundColor Cyan
    $rmqHealth = docker-compose exec rabbitmq rabbitmq-diagnostics ping 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ RabbitMQ is healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ RabbitMQ not responding" -ForegroundColor Red
    }
}

function Open-Shell {
    Write-Host "Opening shell in API Gateway container..." -ForegroundColor Cyan
    docker-compose exec api-gateway sh
}

function Open-RabbitMQUI {
    Write-Host "Opening RabbitMQ Management UI..." -ForegroundColor Cyan
    Start-Process "http://localhost:15672"
}

function Install-Dependencies {
    Write-Host "Installing npm dependencies..." -ForegroundColor Green
    npm install
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
}

function Run-Tests {
    Write-Host "Running tests..." -ForegroundColor Cyan
    npm test
}

function Run-Lint {
    Write-Host "Running linter..." -ForegroundColor Cyan
    npm run lint
}

# Main command router
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "up" { Start-Services }
    "down" { Stop-Services }
    "restart" { Restart-Services }
    "logs" { Show-Logs }
    "logs-api" { Show-ApiLogs }
    "logs-rmq" { Show-RabbitMQLogs }
    "build" { Build-Services }
    "clean" { Clean-All }
    "dev" { Start-Dev }
    "prod" { Start-Prod }
    "health" { Check-Health }
    "shell" { Open-Shell }
    "rmq-ui" { Open-RabbitMQUI }
    "install" { Install-Dependencies }
    "test" { Run-Tests }
    "lint" { Run-Lint }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
