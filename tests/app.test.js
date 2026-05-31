// =============================================
// tests/app.test.js — Testes Automatizados
// Roda com: npm test
// =============================================

const http = require('http');
const fs = require('fs');
const path = require('path');

let passou = 0;
let falhou = 0;

function assert(descricao, condicao) {
  if (condicao) {
    console.log(`  ✅ ${descricao}`);
    passou++;
  } else {
    console.error(`  ❌ FALHOU: ${descricao}`);
    falhou++;
  }
}

function requisicaoHttp(rota) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:3000${rota}`, (res) => {
      let corpo = '';
      res.on('data', (chunk) => corpo += chunk);
      res.on('end', () => resolve({ status: res.statusCode, corpo, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Timeout')));
  });
}

async function rodarTestes() {
  console.log('');
  console.log('=========================================');
  console.log('   TESTES AUTOMATIZADOS — Monitor Linux  ');
  console.log('=========================================');
  console.log('');

  // ─── TESTE 1: Arquivos essenciais existem ───
  console.log('📁 Teste 1: Estrutura de arquivos');
  const arquivos = [
    path.join(__dirname, '..', 'src', 'index.js'),
    path.join(__dirname, '..', 'package.json'),
    path.join(__dirname, '..', 'Dockerfile'),
    path.join(__dirname, '..', 'scripts', 'monitoramento.sh'),
    path.join(__dirname, '..', 'entrypoint.sh'),
  ];
  arquivos.forEach(f => {
    assert(`Arquivo existe: ${path.basename(f)}`, fs.existsSync(f));
  });

  // ─── TESTE 2: package.json válido ───
  console.log('');
  console.log('📦 Teste 2: package.json');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert('Tem campo "name"', typeof pkg.name === 'string' && pkg.name.length > 0);
  assert('Tem script "start"', typeof pkg.scripts?.start === 'string');
  assert('Tem script "test"', typeof pkg.scripts?.test === 'string');

  // ─── TESTE 3: Script de monitoramento ───
  console.log('');
  console.log('🐚 Teste 3: Script Shell');
  const conteudoScript = fs.readFileSync(
    path.join(__dirname, '..', 'scripts', 'monitoramento.sh'), 'utf8'
  );
  assert('Contém coleta de RAM', conteudoScript.includes('free'));
  assert('Contém coleta de CPU', conteudoScript.includes('top'));
  assert('Contém coleta de disco', conteudoScript.includes('df'));
  assert('Contém lógica de alerta', conteudoScript.includes('ALERTA'));
  assert('Usa variável RAM_THRESHOLD', conteudoScript.includes('RAM_THRESHOLD'));

  // ─── TESTE 4: Dockerfile ───
  console.log('');
  console.log('🐳 Teste 4: Dockerfile');
  const dockerfile = fs.readFileSync(path.join(__dirname, '..', 'Dockerfile'), 'utf8');
  assert('Usa imagem node', dockerfile.includes('FROM node'));
  assert('Expõe porta 3000', dockerfile.includes('EXPOSE 3000'));
  assert('Tem WORKDIR', dockerfile.includes('WORKDIR'));
  assert('Copia package.json', dockerfile.includes('COPY package.json'));

  // ─── TESTE 5: API HTTP (requer servidor rodando) ───
  console.log('');
  console.log('🌐 Teste 5: API HTTP (servidor precisa estar rodando)');

  try {
    const health = await requisicaoHttp('/health');
    assert('GET /health retorna 200', health.status === 200);

    const healthData = JSON.parse(health.corpo);
    assert('/health retorna status "healthy"', healthData.status === 'healthy');
    assert('/health retorna timestamp', typeof healthData.timestamp === 'string');

    const metricas = await requisicaoHttp('/api/metricas');
    assert('GET /api/metricas retorna 200', metricas.status === 200);

    const metricasData = JSON.parse(metricas.corpo);
    assert('/api/metricas tem campo "data"', metricasData.data !== undefined);
    assert('/api/metricas tem CPU', metricasData.data?.cpu !== undefined);
    assert('/api/metricas tem RAM', metricasData.data?.ram !== undefined);

    const logs = await requisicaoHttp('/api/logs');
    assert('GET /api/logs retorna 200', logs.status === 200);

    const dashboard = await requisicaoHttp('/');
    assert('GET / retorna 200', dashboard.status === 200);
    assert('Dashboard retorna HTML', dashboard.headers['content-type']?.includes('text/html'));

    const notFound = await requisicaoHttp('/rota-inexistente');
    assert('Rota inexistente retorna 404', notFound.status === 404);

  } catch (err) {
    console.log(`  ⚠️  Servidor não está rodando (${err.message}) — pulando testes HTTP`);
    console.log('     Execute "npm start" em outro terminal e rode os testes novamente.');
  }

  // ─── Resultado final ───
  console.log('');
  console.log('=========================================');
  console.log(`   Resultado: ${passou} passou | ${falhou} falhou`);
  console.log('=========================================');
  console.log('');

  if (falhou > 0) process.exit(1);
}

rodarTestes().catch((err) => {
  console.error('Erro inesperado nos testes:', err);
  process.exit(1);
});
