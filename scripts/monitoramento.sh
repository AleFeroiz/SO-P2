#!/bin/sh
# =============================================================
# monitoramento.sh — Coleta métricas do Linux e grava em logs
# Roda em background junto com a API Node.js
# =============================================================

LIMITE_RAM=${RAM_THRESHOLD:-80}
INTERVALO=${MONITOR_INTERVAL:-10}
LOG_DIR=${LOG_DIR:-./logs}

mkdir -p "$LOG_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Monitoramento iniciado (intervalo: ${INTERVALO}s | limite RAM: ${LIMITE_RAM}%)" >> "$LOG_DIR/sistema.log"

while true; do
  DATA=$(date '+%Y-%m-%d %H:%M:%S')

  # Coleta de RAM
  RAM_USADA=$(free -m | awk '/Mem:/ {print $3}')
  RAM_TOTAL=$(free -m | awk '/Mem:/ {print $2}')
  RAM_PERCENT=$(free | awk '/Mem:/ {printf("%.0f", $3/$2 * 100)}')

  # Coleta de Disco
  DISCO_USO=$(df -h / | tail -1 | awk '{print $5}')
  DISCO_DISP=$(df -h / | tail -1 | awk '{print $4}')

  # Coleta de CPU
  CPU_USO=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)

  # Processos ativos
  PROCESSOS=$(ps aux --no-headers | wc -l)

  # Grava log principal
  {
    echo "[$DATA] ============================================"
    echo "[$DATA] CPU:        ${CPU_USO}%"
    echo "[$DATA] RAM:        ${RAM_USADA}MB / ${RAM_TOTAL}MB (${RAM_PERCENT}%)"
    echo "[$DATA] Disco:      usado ${DISCO_USO} | disponível ${DISCO_DISP}"
    echo "[$DATA] Processos:  ${PROCESSOS} ativos"
  } >> "$LOG_DIR/sistema.log"

  # Alerta se RAM ultrapassar limite
  if [ "$RAM_PERCENT" -ge "$LIMITE_RAM" ]; then
    echo "[$DATA] ALERTA: RAM em ${RAM_PERCENT}% — limite de ${LIMITE_RAM}% atingido!" >> "$LOG_DIR/alertas.log"
    echo "[$DATA] ALERTA RAM: ${RAM_PERCENT}%" >> "$LOG_DIR/sistema.log"
  fi

  sleep "$INTERVALO"
done
