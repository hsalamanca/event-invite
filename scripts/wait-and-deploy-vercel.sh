#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

AUTH_DIR="${HOME}/.local/share/com.vercel.cli"
MARKER="/tmp/vercel-deploy-status.txt"
echo "waiting" >"$MARKER"

echo "Waiting for Vercel credentials in ${AUTH_DIR}..."
for i in $(seq 1 180); do
  if ls "${AUTH_DIR}"/auth.json "${AUTH_DIR}"/*.json 2>/dev/null | xargs grep -l -iE 'token|access' 2>/dev/null | grep -q .; then
    echo "Credentials detected."
    break
  fi
  # Newer CLIs may store under config.json after login
  if grep -qiE 'Congratulations|Login successful|Authenticated' /tmp/vercel-login.log 2>/dev/null; then
    sleep 2
    if npx vercel whoami >/tmp/vercel-whoami.txt 2>&1; then
      if ! grep -qiE 'Waiting for authentication|No existing credentials|Visit https' /tmp/vercel-whoami.txt; then
        echo "whoami ok: $(cat /tmp/vercel-whoami.txt)"
        break
      fi
    fi
  fi
  sleep 5
  if [[ "$i" -eq 180 ]]; then
    echo "timeout" >"$MARKER"
    echo "Timed out waiting for auth."
    exit 1
  fi
done

echo "Deploying as $(npx vercel whoami 2>/dev/null || echo unknown)"
npx vercel link --yes --project ownvite 2>&1 || true
echo "=== PREVIEW ===" | tee /tmp/vercel-deploy-out.log
npx vercel deploy --yes 2>&1 | tee -a /tmp/vercel-deploy-out.log
echo "=== PROD ===" | tee -a /tmp/vercel-deploy-out.log
npx vercel deploy --prod --yes 2>&1 | tee -a /tmp/vercel-deploy-out.log
echo "done" >"$MARKER"
echo "DEPLOY_DONE"
