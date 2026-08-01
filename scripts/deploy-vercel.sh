#!/usr/bin/env bash
# Deploy Ownvite to Vercel (preview by default; pass --prod for production).
set -euo pipefail
cd "$(dirname "$0")/.."

if ! npx vercel whoami >/dev/null 2>&1; then
  echo "Not logged in. Run: npx vercel login"
  exit 1
fi

if [[ "${1:-}" == "--prod" ]]; then
  npx vercel deploy --prod --yes
else
  npx vercel deploy --yes
fi
