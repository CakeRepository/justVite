# Azure Static Web App Deployment Script
Write-Host "Building the application..." -ForegroundColor Green
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Exiting."
    exit 1
}

Write-Host "Checking Azure PowerShell..." -ForegroundColor Green
$azModule = Get-Module -ListAvailable Az.Accounts
if (-not $azModule) {
    Write-Host "Azure PowerShell not found. Installing..." -ForegroundColor Yellow
    Install-Module -Name Az -Repository PSGallery -Force -AllowClobber -Scope CurrentUser
}

Write-Host "Logging into Azure..." -ForegroundColor Green
Connect-AzAccount

Write-Host "Creating resource group..." -ForegroundColor Green
$ResourceGroup = "socratic-tutor-rg"
$Location = "eastus2"
$rg = New-AzResourceGroup -Name $ResourceGroup -Location $Location -Force

Write-Host "Creating Static Web App..." -ForegroundColor Green
$AppName = "socratic-tutor-frontend"
Write-Host "Note: Using Azure PowerShell for deployment." -ForegroundColor Yellow

try {
    $staticApp = New-AzStaticWebApp -ResourceGroupName $ResourceGroup -Name $AppName -Location $Location -RepositoryUrl 'https://github.com/yourusername/yourrepo' -Branch 'main' -AppLocation '/' -OutputLocation 'dist' -Sku 'Free'
    
    Write-Host "Deployment complete!" -ForegroundColor Green
    Write-Host "Your app will be available at: https://$AppName.azurestaticapps.net" -ForegroundColor Cyan
} catch {
    Write-Error "Failed to create Static Web App: $_"
    exit 1
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
