# PowerShell script to install Supabase CLI
Write-Host "Installing Supabase CLI..." -ForegroundColor Green

# Create directory for Supabase CLI
$supabaseDir = "$env:USERPROFILE\.supabase"
if (!(Test-Path $supabaseDir)) {
    New-Item -ItemType Directory -Path $supabaseDir -Force
}

# Download Supabase CLI for Windows
$downloadUrl = "https://github.com/supabase/cli/releases/latest/download/supabase_windows_amd64.exe"
$outputPath = "$supabaseDir\supabase.exe"

Write-Host "Downloading Supabase CLI..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $outputPath
    Write-Host "Download completed!" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$supabaseDir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$supabaseDir", "User")
    Write-Host "Added Supabase CLI to PATH" -ForegroundColor Green
}

Write-Host "Supabase CLI installed successfully!" -ForegroundColor Green
Write-Host "Please restart your terminal or run: refreshenv" -ForegroundColor Yellow
Write-Host "Then you can use: supabase --version" -ForegroundColor Yellow
