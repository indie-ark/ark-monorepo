FROM node:18-alpine

RUN adduser -D -h /opt/app app

RUN npm install -g serve

WORKDIR /opt/app

USER app

COPY --chown=app:app package*.json ./

RUN npm ci

COPY --chown=app:app . .

RUN npm run build && rm -rf node_modules

EXPOSE 3000

ENV API_URL=http://localhost:8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT ["/opt/app/scripts/entrypoint.sh"]