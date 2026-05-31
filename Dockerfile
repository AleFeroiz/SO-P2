# ==========================================
# Dockerfile — Monitor Linux
# Imagem base leve com Node.js e ferramentas Linux
# ==========================================

FROM node:18-alpine

# Instala ferramentas Linux necessárias para monitoramento
RUN apk add --no-cache procps coreutils util-linux

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia e instala dependências primeiro (melhor cache do Docker)
COPY package.json .
RUN npm install --production

# Copia o restante do projeto
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY entrypoint.sh .

# Garante permissões de execução nos scripts
RUN chmod +x entrypoint.sh scripts/monitoramento.sh

# Variáveis de ambiente padrão (podem ser sobrescritas)
ENV PORT=3000
ENV LOG_DIR=/app/logs
ENV RAM_THRESHOLD=80
ENV MONITOR_INTERVAL=10

# Cria a pasta de logs
RUN mkdir -p /app/logs

# Expõe a porta do servidor
EXPOSE 3000

# Ponto de entrada
ENTRYPOINT ["./entrypoint.sh"]
