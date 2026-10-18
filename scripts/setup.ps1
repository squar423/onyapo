$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 22+ first.' }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'Install Python 3.10+ first.' }
if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env'; Write-Host 'Created .env. Configure Supabase for real accounts.' }
python scripts/validate_data.py
npm install
npm run build
Write-Host 'Ready. Run: npm run dev'
