#!/bin/sh
# =============================================================
# monitoramento.sh — Coleta métricas do Linux e grava em logs
# Pode rodar standalone ou ser chamado por outra ferramenta
# =============================================================

LIMITE_RAM=${RAM_THRESHOLD:-80}
INTERVALO=${MONITOR_INTERVAL:-10}
LOG_DIR=${LOG_DIR:-./logs}

mkdir -p "$LOG_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Monitoramento iniciado (intervalo: ${INTERVALO}s | limite RAM: ${LIMITE_RAM}%)" >> "$LOG_DIR/sistema.log"

while true; do
  DATA=$(date '+%Y-%m-%d %H:%M:%S')

  RAM_USADA=$(free -m  | awk '/Mem:/ {print $3}')
  RAM_TOTAL=$(free -m  | awk '/Mem:/ {print $2}')
  RAM_PERCENT=$(free   | awk '/Mem:/ {printf("%.0f", $3/$2 * 100)}')
  DISCO_USO=$(df -h /  | tail -1 | awk '{print $5}')
  DISCO_DISP=$(df -h / | tail -1 | awk '{print $4}')
  CPU_USO=$(top -bn1   | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
  PROCESSOS=$(ps aux --no-headers | wc -l)

  {
    echo "[$DATA] ============================================"
    echo "[$DATA] CPU:        ${CPU_USO}%"
    echo "[$DATA] RAM:        ${RAM_USADA}MB / ${RAM_TOTAL}MB (${RAM_PERCENT}%)"
    echo "[$DATA] Disco:      usado ${DISCO_USO} | disponível ${DISCO_DISP}"
    echo "[$DATA] Processos:  ${PROCESSOS} ativos"
  } >> "$LOG_DIR/sistema.log"

  if [ "$RAM_PERCENT" -ge "$LIMITE_RAM" ]; then
    echo "[$DATA] ALERTA: RAM em ${RAM_PERCENT}% — limite de ${LIMITE_RAM}% atingido!" >> "$LOG_DIR/alertas.log"
    echo "[$DATA] ALERTA RAM: ${RAM_PERCENT}%" >> "$LOG_DIR/sistema.log"
  fi

  sleep "$INTERVALO"
done
