#!/bin/sh
set -eu
if [ -n "${APP_PUBLIC_CONFIG_FILE:-}" ]; then
  # Solo el esquema publico permitido puede llegar al navegador.
  if ! jq -e '
    type == "object" and
    ((keys - ["appId","apiBaseUrl","checkoutBaseUrl","demoEnabled","demoOnly","conversationsEnabled","push","social","pluginWeb"]) | length == 0) and
    ([.. | objects | keys[] | select(test("secret|password|private.?key|credential|refresh.?token|access.?token|id.?token";"i"))] | length == 0) and
    (.demoOnly != true) and (.demoEnabled != true) and
    (.appId == "com.gestadia.app") and
    (if has("conversationsEnabled") then (.conversationsEnabled | type == "boolean") else true end) and
    (
      (.apiBaseUrl | test("^https://[^/]+$")) and
      .push.enabled == true and
      (.social.google.webClientId | test("^[a-zA-Z0-9.-]+\\.apps\\.googleusercontent\\.com$")) and
      (.social.google.iosClientId | test("^[a-zA-Z0-9.-]+\\.apps\\.googleusercontent\\.com$")) and
      .social.apple.clientId == "com.gestadia.app" and
      .social.apple.androidServiceId == "com.gestadia.app.login" and
      .social.apple.redirectUrl == (.apiBaseUrl + "/api/auth/social/apple/callback")
    )
  ' "$APP_PUBLIC_CONFIG_FILE" >/dev/null 2>&1; then
    echo 'Configuracion publica movil ausente, incompleta o no permitida' >&2
    exit 1
  fi
  jq 'del(.demoOnly,.demoEnabled)' "$APP_PUBLIC_CONFIG_FILE" > /tmp/app-config.json
else
  jq -n --arg checkout "${APP_CHECKOUT_URL:-https://gestadia.com}" --arg key "${APP_PLUGIN_KEY:-}" '{apiBaseUrl:"",checkoutBaseUrl:$checkout,conversationsEnabled:false,pluginWeb:{baseUrl:"/lidia",key:$key}}' > /tmp/app-config.json
fi
cp /tmp/app-config.json /usr/share/nginx/html/app-config.json
printf 'window.GESTADIA_APP_CONFIG = ' > /usr/share/nginx/html/app-config.js
cat /tmp/app-config.json >> /usr/share/nginx/html/app-config.js
printf ';\n' >> /usr/share/nginx/html/app-config.js
rm /tmp/app-config.json
