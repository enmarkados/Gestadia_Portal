FROM node:22-alpine AS build
WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/vite.app.config.js ./
COPY frontend/app ./app
COPY shared /workspace/shared
RUN npm run build:app

FROM nginx:1.28-alpine
RUN apk add --no-cache ca-certificates jq
COPY --from=build /workspace/frontend/dist-app /usr/share/nginx/html
COPY deploy/app/default.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/app/40-app-config.sh /docker-entrypoint.d/40-app-config.sh
ARG APP_VERSION=0.1.0
ARG VCS_REF=local
RUN chmod +x /docker-entrypoint.d/40-app-config.sh && jq -n --arg version "$APP_VERSION" --arg revision "$VCS_REF" '{app:"Gestadia",version:$version,revision:$revision}' > /usr/share/nginx/html/build-info.json
ENV PORTAL_UPSTREAM=https://gestadia.com PORTAL_HOST=gestadia.com LIDIA_UPSTREAM=https://lidia.gestadia.com LIDIA_HOST=lidia.gestadia.com APP_CHECKOUT_URL=https://gestadia.com APP_DEMO_ENABLED=true APP_DEMO_ONLY=true APP_PLUGIN_KEY=""
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
