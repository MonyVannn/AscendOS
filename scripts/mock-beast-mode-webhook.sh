#!/usr/bin/env bash
set -euo pipefail

WEBHOOK_URL="${BEAST_MODE_WEBHOOK_URL:-https://services.leadconnectorhq.com/hooks/JeieskgnqqWMrSrGVc21/webhook-trigger/db55d74f-5a1c-4be9-ab55-1b90024d553c}"

curl -sS -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Jane","last_name":"Doe","email":"jane.doe@example.com","phone":"+15551234567","sales_academy_start_date":"2026-06-30"}'

echo
