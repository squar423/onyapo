#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if ! command -v node >/dev/null; then echo 'Install Node.js 22+ first'; exit 1; fi
if ! command -v python3 >/dev/null; then echo 'Install Python 3.10+ first'; exit 1; fi
if [ ! -f .env ]; then cp .env.example .env; echo 'Created .env; configure Supabase details for real accounts.'; fi
python3 scripts/validate_data.py
npm install
npm run build
echo 'Ready. Run: npm run dev'
