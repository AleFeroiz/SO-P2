# Monitor Linux — Dashboard de Métricas em Tempo Real

Projeto Integrador de DevOps e Sistemas Operacionais com uma API REST em Node.js/Express e um dashboard HTML/CSS/JS que exibe métricas reais do sistema Linux, com evidências práticas de Git Flow, automação Linux, Shell Script, Docker, Kubernetes, CI/CD e testes automatizados.

> O dashboard consome a API local para exibir dados reais coletados diretamente do sistema operacional via comandos Linux (`top`, `free`, `df`, `ps`).

## Objetivo

Demonstrar, em um projeto acadêmico, como uma aplicação de monitoramento pode ser organizada com práticas de DevOps e conceitos de Sistemas Operacionais Linux. O foco do trabalho não é apenas a interface, mas o ecossistema ao redor dela: automação com shell script, containerização, orquestração, pipeline de CI/CD, testes, logs e documentação.

## Contexto Acadêmico

Este projeto atende aos critérios de avaliação das disciplinas de DevOps e Sistemas Operacionais:

- Git e Git Flow
- Conceitos de Linux e comandos GNU
- Automação com Shell Script
- Docker
- Kubernetes
- CI/CD com GitHub Actions
- Testes automatizados (unitários e de integração)
- Logs e monitoramento
- Gerenciamento de configuração
- Documentação e prontidão para apresentação

## Tecnologias

| Área | Tecnologias |
| --- | --- |
| Backend | Node.js, Express |
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Testes | Jest, Supertest |
| CI/CD | GitHub Actions |
| Linux | Bash, `top`, `free`, `df`, `ps`, `uptime` |
| Containers | Docker, Node Alpine |
| Kubernetes | Deployment, Service |
| Configuração | `.env`, variáveis de ambiente |

## Arquitetura

```text
Usuario
  |
  v
Dashboard HTML/CSS/JS (public/)
  |
  v (fetch /api/metricas)
API Express (src/index.js)
  |
  v
systemMetrics.js — execSync com comandos Linux
  |
  v
Sistema Operacional (CPU, RAM, Disco, Processos)
```

O backend coleta métricas reais do sistema operacional executando comandos Linux via `execSync`. O frontend consome a API via `fetch` a cada atualização e exibe os dados em cards com barras de progresso.

## Estrutura

```text
.
|-- .github/workflows/ci.yml
|-- k8s/
|   |-- deployment.yaml
|   `-- service.yaml
|-- public/
|   |-- index.html
|   |-- style.css
|   `-- app.js
|-- scripts/
|   `-- monitoramento.sh
|-- src/
|   |-- index.js
|   `-- systemMetrics.js
|-- tests/
|   |-- api.test.js
|   `-- systemMetrics.test.js
|-- .dockerignore
|-- .env
|-- .gitignore
|-- Dockerfile
|-- package.json
`-- package-lock.json
```

## Git Flow

O repositório segue a estratégia Git Flow com branches `main`, `develop` e `feature/*`. A estratégia recomendada para a demonstração é:

```bash
git checkout develop
git checkout -b feature/nome-da-etapa
git add .
git commit -m "feat: descreve a melhoria"
git push origin feature/nome-da-etapa
```

Pull Requests devem ser abertos para `develop`. O CI está configurado para rodar em `push` e `pull_request` na branch `main`.

## Ambiente Local

Instale as dependências:

```bash
npm ci
```

Execute em desenvolvimento:

```bash
npm run dev
```

Validações principais:

```bash
npm test
npm start
```

Acesso:

```text
http://localhost:3000
```

## Variáveis de Ambiente

O arquivo `.env` configura o comportamento da aplicação e do script de monitoramento:

```env
PORT=3000
RAM_THRESHOLD=80
MONITOR_INTERVAL=10
```

- `PORT`: porta em que o servidor Express escuta
- `RAM_THRESHOLD`: percentual de RAM que dispara alerta no script shell
- `MONITOR_INTERVAL`: intervalo em segundos entre coletas no script shell

## Testes Automatizados

O projeto usa Jest com Supertest.

```bash
npm test
```

Os testes verificam:

**Testes unitários** (`tests/systemMetrics.test.js`):
- estrutura completa retornada por `collectMetrics()`
- validade do campo `timestamp` como ISO string
- campos e tipos de `getCpu()`, `getRam()`, `getDisk()`, `getProcesses()`
- regras de negócio, como `ram.used` não ultrapassar `ram.total` e `percent` entre 0 e 100

**Testes de integração** (`tests/api.test.js`):
- `GET /health` retorna status 200 e `{ status: "ok" }`
- `GET /api/metricas` retorna status 200 com `cpu`, `ram`, `disk` e `processes`
- `GET /api/cpu`, `GET /api/ram` e `GET /api/disco` retornam status 200 com campo `data`
- `ram.percent` entre 0 e 100 via endpoint HTTP

Os testes não exigem Docker, Kubernetes ou ambiente Linux específico.

## CI/CD

Workflow: `.github/workflows/ci.yml`

O GitHub Actions executa dois jobs encadeados:

**Job `test`:**
1. `npm ci`
2. Validação de sintaxe do shell script (`sh -n`)
3. `npm test`

**Job `docker`** (depende de `test`):
1. `docker build -t monitor-linux .`
2. Smoke test: sobe o container, aguarda 3 segundos e faz `curl -f http://localhost:3000/health`

O pipeline não faz deploy e não envia imagem para registry.

## Linux e Shell Script

O script `scripts/monitoramento.sh` usa `sh` com `set -euo pipefail` implícito e coleta métricas continuamente em loop.

Dar permissão de execução:

```bash
chmod +x scripts/monitoramento.sh
```

Validar sintaxe sem executar:

```bash
sh -n scripts/monitoramento.sh
```

Executar monitoramento:

```bash
./scripts/monitoramento.sh
```

Executar com variáveis customizadas:

```bash
RAM_THRESHOLD=70 MONITOR_INTERVAL=5 LOG_DIR=./logs ./scripts/monitoramento.sh
```

Inspecionar logs gerados:

```bash
tail -f logs/sistema.log
tail -f logs/alertas.log
```

Conceitos demonstrados:

- uso de CPU com `top -bn1`
- memória com `free -m`
- disco com `df -h`
- processos com `ps aux`
- uptime com `uptime -p`
- redirecionamento e append para arquivos de log (`>>`)
- alerta condicional por threshold de RAM
- agendamento via variável `MONITOR_INTERVAL` com `sleep`
- criação de diretórios com `mkdir -p`

## Logs

O script de monitoramento grava dois arquivos no diretório `LOG_DIR` (padrão: `./logs`):

- `logs/sistema.log`: coleta periódica de CPU, RAM, disco e processos
- `logs/alertas.log`: entradas geradas quando a RAM ultrapassa o threshold configurado

Exemplo de entrada no log:

```
[2025-05-31 23:10:00] ============================================
[2025-05-31 23:10:00] CPU:        12%
[2025-05-31 23:10:00] RAM:        512MB / 2048MB (25%)
[2025-05-31 23:10:00] Disco:      usado 45% | disponível 10G
[2025-05-31 23:10:00] Processos:  87 ativos
```

## Docker

O Dockerfile usa uma imagem `node:20-alpine` com ferramentas Linux instaladas via `apk` para que os comandos de coleta de métricas funcionem dentro do container.

Build:

```bash
docker build -t monitor-linux .
```

Run:

```bash
docker run -d -p 3000:3000 --name monitor-linux monitor-linux
```

Acesso:

```text
http://localhost:3000
```

Parar/remover:

```bash
docker stop monitor-linux
docker rm monitor-linux
```

Verificar logs do container:

```bash
docker logs monitor-linux
```

## Kubernetes

Manifests em `k8s/`:

- `deployment.yaml`: 1 réplica, `livenessProbe` e `readinessProbe` em `/health`, variáveis de ambiente configuradas
- `service.yaml`: Service `ClusterIP` na porta 80 apontando para a porta 3000 do container

Validação local requer `kubectl` e um cluster ativo (Docker Desktop Kubernetes, Minikube ou Kind).

Aplicar:

```bash
kubectl apply -f k8s/
```

Inspecionar:

```bash
kubectl get pods
kubectl get svc
kubectl get deployments
```

Port-forward:

```bash
kubectl port-forward svc/monitor-linux 3000:80
```

Acesso:

```text
http://localhost:3000
```

Remover:

```bash
kubectl delete -f k8s/
```

## Endpoints da API

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Health check — retorna `{ status: "ok" }` |
| GET | `/api/metricas` | Todas as métricas: CPU, RAM, disco, processos, uptime |
| GET | `/api/cpu` | Uso de CPU em percentual |
| GET | `/api/ram` | Uso de RAM em MB e percentual |
| GET | `/api/disco` | Uso de disco em `/` |

## Comandos de Demonstração

```bash
# Git
git branch -a
git log --oneline --graph --decorate -n 10

# Testes e validação
npm ci
sh -n scripts/monitoramento.sh
npm test

# Docker
docker build -t monitor-linux .
docker run -d -p 3000:3000 --name monitor-linux monitor-linux
curl http://localhost:3000/health

# Kubernetes
kubectl apply -f k8s/
kubectl get pods
kubectl port-forward svc/monitor-linux 3000:80
```

## Melhorias Futuras

- histórico de métricas com banco de dados (SQLite ou InfluxDB)
- gráficos de série temporal no dashboard
- script de backup automatizado com agendamento via cron
- publicação de imagem em registry (Docker Hub ou GHCR)
- deploy em cluster real (EKS, GKE ou DigitalOcean)
- observabilidade com Prometheus e Grafana
- alertas via webhook (Slack, e-mail)
- suporte a múltiplos ambientes com Docker Compose