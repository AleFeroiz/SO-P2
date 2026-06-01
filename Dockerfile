FROM node:20-alpine

RUN apk add --no-cache procps coreutils util-linux

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/
COPY public/ ./public/
COPY scripts/ ./scripts/

RUN chmod +x scripts/monitoramento.sh

EXPOSE 3000

CMD ["node", "src/index.js"]
