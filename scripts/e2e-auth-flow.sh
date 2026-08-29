#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:3000/api/v1}"
EMAIL="${E2E_EMAIL:-e2e.user@shopsphere.test}"
PASSWORD="${E2E_PASSWORD:-SecurePass1!}"
NEW_PASSWORD="${E2E_NEW_PASSWORD:-NewSecurePass2!}"
COMPOSE_ARGS="${COMPOSE_ARGS:--f docker-compose.yml -f docker-compose.e2e.yml}"

pass() { echo "✓ $1"; }
fail() { echo "✗ $1"; exit 1; }

json_get() {
  node -e "const d=JSON.parse(process.argv[1]); const p=process.argv[2].split('.'); let v=d; for (const k of p) v=v?.[k]; if (v===undefined) process.exit(2); process.stdout.write(String(v));" "$1" "$2"
}

request() {
  local method="$1" path="$2" body="${3:-}" auth="${4:-}"
  local args=(-sS -X "$method" "${API_BASE}${path}" -H "Content-Type: application/json" -H "Accept: application/json")
  if [[ -n "$auth" ]]; then args+=(-H "Authorization: Bearer ${auth}"); fi
  if [[ -n "$body" ]]; then args+=(-d "$body"); fi
  curl "${args[@]}"
}

get_otp_from_redis() {
  local purpose="$1"
  docker compose $COMPOSE_ARGS exec -T redis redis-cli GET "e2e:otp:${EMAIL}:${purpose}"
}

echo "=== ShopSphere S1 Docker E2E Auth Flow ==="
echo "API: $API_BASE"
echo "Email: $EMAIL"
echo

echo "[1/12] Health check"
health=$(request GET /health)
echo "$health" | grep -q '"success":true' || fail "health check failed"
pass "GET /health"

echo "[2/12] Register"
register=$(request POST /auth/register "$(cat <<EOF
{"email":"${EMAIL}","password":"${PASSWORD}","firstName":"E2E","lastName":"User"}
EOF
)")
if echo "$register" | grep -q '"success":true'; then
  pass "POST /auth/register"
elif echo "$register" | grep -q 'EMAIL_ALREADY_EXISTS'; then
  echo "  (user already exists — continuing)"
  pass "POST /auth/register (existing user)"
else
  echo "$register"
  fail "register failed"
fi

echo "[3/12] Fetch registration OTP from Redis (E2E_EXPOSE_OTP)"
REG_OTP=$(get_otp_from_redis REGISTRATION | tr -d '\r')
[[ -n "$REG_OTP" && "$REG_OTP" != "(nil)" ]] || fail "registration OTP not found in Redis"
pass "OTP retrieved: ******"

echo "[4/12] Verify registration OTP"
verify=$(request POST /auth/verify-otp "$(cat <<EOF
{"email":"${EMAIL}","code":"${REG_OTP}","purpose":"REGISTRATION"}
EOF
)")
echo "$verify" | grep -q '"success":true' || { echo "$verify"; fail "verify-otp failed"; }
ACCESS=$(json_get "$verify" data.accessToken)
REFRESH=$(json_get "$verify" data.refreshToken)
[[ -n "$ACCESS" && -n "$REFRESH" ]] || fail "tokens missing after verify"
pass "POST /auth/verify-otp"

echo "[5/12] GET /users/me"
me=$(request GET /users/me "" "$ACCESS")
echo "$me" | grep -q "\"email\":\"${EMAIL}\"" || { echo "$me"; fail "/users/me failed"; }
pass "GET /users/me"

echo "[6/12] Refresh token"
refresh=$(request POST /auth/refresh "$(cat <<EOF
{"refreshToken":"${REFRESH}"}
EOF
)")
echo "$refresh" | grep -q '"success":true' || { echo "$refresh"; fail "refresh failed"; }
ACCESS2=$(json_get "$refresh" data.accessToken)
REFRESH2=$(json_get "$refresh" data.refreshToken)
pass "POST /auth/refresh (rotation)"

echo "[7/12] Logout"
logout=$(request POST /auth/logout "$(cat <<EOF
{"refreshToken":"${REFRESH2}"}
EOF
)")
echo "$logout" | grep -q '"loggedOut":true' || { echo "$logout"; fail "logout failed"; }
pass "POST /auth/logout"

echo "[8/12] Login with password"
login=$(request POST /auth/login "$(cat <<EOF
{"email":"${EMAIL}","password":"${PASSWORD}"}
EOF
)")
echo "$login" | grep -q '"success":true' || { echo "$login"; fail "login failed"; }
ACCESS=$(json_get "$login" data.accessToken)
REFRESH=$(json_get "$login" data.refreshToken)
pass "POST /auth/login"

echo "[9/12] Forgot password"
forgot=$(request POST /auth/forgot-password "$(cat <<EOF
{"email":"${EMAIL}"}
EOF
)")
echo "$forgot" | grep -q '"success":true' || { echo "$forgot"; fail "forgot-password failed"; }
pass "POST /auth/forgot-password"

echo "[10/12] Fetch reset OTP"
RESET_OTP=$(get_otp_from_redis PASSWORD_RESET | tr -d '\r')
[[ -n "$RESET_OTP" && "$RESET_OTP" != "(nil)" ]] || fail "reset OTP not found in Redis"
pass "Reset OTP retrieved"

echo "[11/12] Reset password"
reset=$(request POST /auth/reset-password "$(cat <<EOF
{"email":"${EMAIL}","code":"${RESET_OTP}","newPassword":"${NEW_PASSWORD}"}
EOF
)")
echo "$reset" | grep -q '"passwordReset":true' || { echo "$reset"; fail "reset-password failed"; }
pass "POST /auth/reset-password"

echo "[12/12] Login with new password"
login2=$(request POST /auth/login "$(cat <<EOF
{"email":"${EMAIL}","password":"${NEW_PASSWORD}"}
EOF
)")
echo "$login2" | grep -q '"success":true' || { echo "$login2"; fail "login with new password failed"; }
pass "POST /auth/login (new password)"

echo
echo "=== E2E AUTH FLOW: ALL STEPS PASSED ==="
