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
ARG APP_PROXY_TEMPLATE=default.conf.template
COPY deploy/app/${APP_PROXY_TEMPLATE} /etc/nginx/templates/default.conf.template
COPY deploy/app/40-app-config.sh /docker-entrypoint.d/40-app-config.sh
ARG APP_VERSION=0.1.0
ARG VCS_REF=local
RUN chmod +x /docker-entrypoint.d/40-app-config.sh && jq -n --arg version "$APP_VERSION" --arg revision "$VCS_REF" '{app:"Gestadia",version:$version,revision:$revision}' > /usr/share/nginx/html/build-info.json
ENV PORTAL_UPSTREAM=https://gestadia.com PORTAL_HOST=gestadia.com LIDIA_UPSTREAM=https://lidia.gestadia.com LIDIA_HOST=lidia.gestadia.com APP_CHECKOUT_URL=https://gestadia.com APP_PLUGIN_KEY=""
LABEL org.opencontainers.image.revision=$VCS_REF org.opencontainers.image.title="Gestadia APP"
RUN sed -i 's@^pid[[:space:]].*;@pid /tmp/nginx.pid;@' /etc/nginx/nginx.conf && chown -R nginx:nginx /etc/nginx/conf.d /var/cache/nginx /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
