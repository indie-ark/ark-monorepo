FROM node:18-alpine

RUN adduser -D -S app

WORKDIR /opt/app

COPY package*.json ./

RUN npm ci

COPY --chown=app:app . .

RUN npm run build

RUN npm ci --only=production

RUN npm install -g serve

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["serve", "-s", "dist", "-l", "3000"]