#!/bin/sh
# =============================================================
# entrypoint.sh — Ponto de entrada do container Docker
# Inicia o shell de monitoramento + servidor Node.js
# =============================================================

echo "================================================"
echo "   Monitor Linux — DevOps"
echo "   Iniciando ambiente..."
echo "================================================"

# Garante permissão nos scripts
chmod +x /app/scripts/monitoramento.sh

# Inicia o script de monitoramento em background
echo "[entrypoint] Iniciando monitoramento em background..."
/app/scripts/monitoramento.sh &

# Inicia o servidor Node.js em foreground
echo "[entrypoint] Iniciando servidor Node.js na porta ${PORT:-3000}..."
exec node /app/src/index.js
