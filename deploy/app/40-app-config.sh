#!/bin/sh
set -eu
case "${APP_DEMO_ENABLED:-true}" in true|false) ;; *) echo 'APP_DEMO_ENABLED debe ser true o false' >&2; exit 1;; esac
case "${APP_DEMO_ONLY:-true}" in true|false) ;; *) echo 'APP_DEMO_ONLY debe ser true o false' >&2; exit 1;; esac
jq -n --arg checkout "${APP_CHECKOUT_URL:-https://gestadia.com}" --arg key "${APP_PLUGIN_KEY:-}" --argjson demo "${APP_DEMO_ENABLED:-true}" --argjson demoOnly "${APP_DEMO_ONLY:-true}" '{apiBaseUrl:"",checkoutBaseUrl:$checkout,demoEnabled:$demo,demoOnly:$demoOnly,pluginWeb:{baseUrl:"/lidia",key:$key}}' > /tmp/app-config.json
cp /tmp/app-config.json /usr/share/nginx/html/app-config.json
printf 'window.GESTADIA_APP_CONFIG = ' > /usr/share/nginx/html/app-config.js
cat /tmp/app-config.json >> /usr/share/nginx/html/app-config.js
printf ';\n' >> /usr/share/nginx/html/app-config.js
rm /tmp/app-config.json
