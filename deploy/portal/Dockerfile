FROM node:22-alpine AS build
WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/index.html frontend/vite.config.js ./
COPY frontend/src ./src
COPY frontend/public ./public
COPY shared /workspace/shared
RUN npm run build

FROM nginx:1.28-alpine
RUN apk add --no-cache jq
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
COPY deploy/portal/default.conf.template /etc/nginx/templates/default.conf.template
ARG VCS_REF=local
ARG APP_VERSION=0.1.0
LABEL org.opencontainers.image.revision=$VCS_REF org.opencontainers.image.title="Gestadia web y Portal"
RUN jq -n --arg revision "$VCS_REF" --arg version "$APP_VERSION" '{app:"Gestadia Portal",version:$version,revision:$revision}' > /usr/share/nginx/html/build-info.json && sed -i 's@^pid[[:space:]].*;@pid /tmp/nginx.pid;@' /etc/nginx/nginx.conf && chown -R nginx:nginx /etc/nginx/conf.d /var/cache/nginx /usr/share/nginx/html
ENV BACKEND_UPSTREAM=http://gestadia-backend:3001
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
