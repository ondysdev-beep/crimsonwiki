# Crimson Desert Database Import Script (PowerShell)
# This script will import all items from crimsondesert.gg

Write-Host "🚀 Starting Crimson Desert Database Import..." -ForegroundColor Green
Write-Host "📡 This will:" -ForegroundColor Yellow
Write-Host "   1. Create new hierarchical category structure (Items -> subcategories)" -ForegroundColor White
Write-Host "   2. Import all 5,902 items from crimsondesert.gg" -ForegroundColor White
Write-Host "   3. Remove old duplicate categories" -ForegroundColor White
Write-Host "   4. Update navigation structure" -ForegroundColor White
Write-Host ""

# Check if the server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running. Please start the development server first:" -ForegroundColor Red
    Write-Host "   npm run dev" -ForegroundColor Yellow
    exit 1
}

# Run the import
Write-Host "🔧 Running database import..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer import-crimson-desert-db"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/import-database" -Method POST -Headers $headers -Body "{}" -TimeoutSec 300
    Write-Host "✅ Import completed successfully!" -ForegroundColor Green
    Write-Host "Response: $($response.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Import failed:" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📊 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Check the new Items category structure" -ForegroundColor White
Write-Host "   2. Verify all items were imported correctly" -ForegroundColor White
Write-Host "   3. Test navigation to new subcategories" -ForegroundColor White
Write-Host "   4. Update any hardcoded links if needed" -ForegroundColor White
