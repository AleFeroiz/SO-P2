const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', 'logs');

// Garante que a pasta de logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(msg) {
  const timestamp = new Date().toISOString();
  const linha = `[${timestamp}] ${msg}\n`;
  fs.appendFileSync(path.join(LOG_DIR, 'app.log'), linha);
  console.log(linha.trim());
}

// Coleta métricas reais do sistema via comandos Linux
function coletarMetricas(callback) {
  const comandos = {
    uptime: "uptime -p",
    cpu: "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1 | tr -d ' '",
    ram: "free -m | awk '/Mem:/ {printf \"%d %d %d\", $3, $2, ($3/$2)*100}'",
    disco: "df -h / | tail -1 | awk '{print $3, $2, $5}'",
    processos: "ps aux --no-headers | wc -l"
  };

  const resultados = {};
  const chaves = Object.keys(comandos);
  let concluidos = 0;

  chaves.forEach((chave) => {
    exec(comandos[chave], (err, stdout) => {
      resultados[chave] = err ? 'N/A' : stdout.trim();
      concluidos++;
      if (concluidos === chaves.length) {
        // Processa RAM
        const ramParts = resultados.ram.split(' ');
        const metricas = {
          timestamp: new Date().toISOString(),
          uptime: resultados.uptime,
          cpu: {
            uso: parseFloat(resultados.cpu) || 0,
            label: `${resultados.cpu}%`
          },
          ram: {
            usada: parseInt(ramParts[0]) || 0,
            total: parseInt(ramParts[1]) || 0,
            percentual: parseInt(ramParts[2]) || 0,
            label: `${ramParts[0]}MB / ${ramParts[1]}MB`
          },
          disco: {
            usado: ramParts[0] || 'N/A',
            total: ramParts[1] || 'N/A',
            percentual: resultados.disco.split(' ')[2] || 'N/A',
            label: resultados.disco
          },
          processos: parseInt(resultados.processos) || 0
        };
        callback(metricas);
      }
    });
  });
}

// Lê as últimas linhas do log
function lerLogs(arquivo, linhas = 20) {
  const caminhoLog = path.join(LOG_DIR, arquivo);
  if (!fs.existsSync(caminhoLog)) return [];
  const conteudo = fs.readFileSync(caminhoLog, 'utf8');
  return conteudo.trim().split('\n').slice(-linhas).reverse();
}

// HTML do dashboard
function renderDashboard(metricas) {
  const ramPct = metricas.ram.percentual;
  const cpuPct = metricas.cpu.uso;
  const corRam = ramPct > 80 ? '#ef4444' : ramPct > 60 ? '#f59e0b' : '#10b981';
  const corCpu = cpuPct > 80 ? '#ef4444' : cpuPct > 60 ? '#f59e0b' : '#10b981';

  const logsApp = lerLogs('app.log', 15).map(l =>
    `<div class="log-linha">${l}</div>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Monitor Linux — DevOps</title>
  <meta http-equiv="refresh" content="5"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
    }
    header {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      border-bottom: 1px solid #334155;
      padding: 20px 32px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    header .dot { width: 12px; height: 12px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
    header h1 { font-size: 1.4rem; font-weight: 700; color: #f1f5f9; }
    header span { font-size: 0.85rem; color: #64748b; margin-left: auto; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      padding: 28px 32px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 22px;
    }
    .card-titulo {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #64748b;
      margin-bottom: 12px;
    }
    .card-valor {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .card-sub { font-size: 0.82rem; color: #94a3b8; }
    .barra-bg {
      background: #0f172a;
      border-radius: 99px;
      height: 8px;
      margin-top: 14px;
      overflow: hidden;
    }
    .barra-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.6s ease;
    }
    .secao {
      max-width: 1200px;
      margin: 0 auto 28px;
      padding: 0 32px;
    }
    .secao h2 {
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 12px;
    }
    .logs-box {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 16px 20px;
      font-family: 'Courier New', monospace;
      font-size: 0.78rem;
      color: #94a3b8;
      max-height: 280px;
      overflow-y: auto;
    }
    .log-linha { padding: 3px 0; border-bottom: 1px solid #1e293b; }
    .log-linha:last-child { border: none; }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 99px;
      font-size: 0.7rem;
      font-weight: 600;
      background: #10b98120;
      color: #10b981;
      margin-left: 10px;
    }
    .apis {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .api-btn {
      background: #334155;
      color: #94a3b8;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.8rem;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }
    .api-btn:hover { background: #475569; color: #f1f5f9; }
    footer {
      text-align: center;
      padding: 24px;
      font-size: 0.75rem;
      color: #334155;
    }
  </style>
</head>
<body>
  <header>
    <div class="dot"></div>
    <h1>Monitor Linux <span class="badge">LIVE</span></h1>
    <span>Atualiza a cada 5s &bull; ${metricas.timestamp}</span>
  </header>

  <div class="grid">
    <div class="card">
      <div class="card-titulo">🖥️ CPU</div>
      <div class="card-valor" style="color:${corCpu}">${cpuPct.toFixed(1)}%</div>
      <div class="card-sub">Uso do processador</div>
      <div class="barra-bg"><div class="barra-fill" style="width:${Math.min(cpuPct,100)}%;background:${corCpu}"></div></div>
    </div>

    <div class="card">
      <div class="card-titulo">🧠 Memória RAM</div>
      <div class="card-valor" style="color:${corRam}">${ramPct}%</div>
      <div class="card-sub">${metricas.ram.label}</div>
      <div class="barra-bg"><div class="barra-fill" style="width:${Math.min(ramPct,100)}%;background:${corRam}"></div></div>
    </div>

    <div class="card">
      <div class="card-titulo">💾 Disco</div>
      <div class="card-valor" style="color:#38bdf8">${metricas.disco.percentual}</div>
      <div class="card-sub">${metricas.disco.label}</div>
    </div>

    <div class="card">
      <div class="card-titulo">⚙️ Processos</div>
      <div class="card-valor" style="color:#a78bfa">${metricas.processos}</div>
      <div class="card-sub">Processos ativos</div>
    </div>

    <div class="card">
      <div class="card-titulo">⏱️ Uptime</div>
      <div class="card-valor" style="font-size:1.1rem;color:#f1f5f9;margin-top:8px">${metricas.uptime || 'N/A'}</div>
      <div class="card-sub">Tempo ligado</div>
    </div>
  </div>

  <div class="secao">
    <h2>📋 Endpoints da API</h2>
    <div class="apis">
      <a class="api-btn" href="/api/metricas" target="_blank">GET /api/metricas</a>
      <a class="api-btn" href="/api/logs" target="_blank">GET /api/logs</a>
      <a class="api-btn" href="/health" target="_blank">GET /health</a>
    </div>
  </div>

  <div class="secao">
    <h2>📄 Logs da Aplicação</h2>
    <div class="logs-box">
      ${logsApp || '<div class="log-linha">Nenhum log ainda...</div>'}
    </div>
  </div>

  <footer>Projeto DevOps &mdash; Monitor Linux &mdash; Node.js + Docker + Kubernetes</footer>
</body>
</html>`;
}

// Servidor HTTP
const server = http.createServer((req, res) => {
  const url = req.url;

  // Dashboard principal
  if (url === '/' || url === '/dashboard') {
    coletarMetricas((metricas) => {
      log(`GET / — CPU: ${metricas.cpu.label} | RAM: ${metricas.ram.percentual}%`);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(renderDashboard(metricas));
    });

  // API JSON de métricas
  } else if (url === '/api/metricas') {
    coletarMetricas((metricas) => {
      log(`GET /api/metricas`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', data: metricas }, null, 2));
    });

  // API de logs
  } else if (url === '/api/logs') {
    const linhas = lerLogs('app.log', 50);
    log(`GET /api/logs`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', logs: linhas }, null, 2));

  // Health check (usado pelo Kubernetes)
  } else if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
  }
});

server.listen(PORT, () => {
  log(`Servidor iniciado na porta ${PORT}`);
  log(`Dashboard: http://localhost:${PORT}`);
  log(`API Métricas: http://localhost:${PORT}/api/metricas`);
});
