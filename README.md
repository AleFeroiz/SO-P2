# 🖥️ Monitor Linux

Sistema de monitoramento de recursos do servidor em tempo real, desenvolvido como Projeto Integrador das disciplinas de **DevOps** e **Sistemas Operacionais**.

---

## 🎯 Objetivo

Demonstrar na prática a integração entre desenvolvimento de software, infraestrutura Linux e cultura DevOps — automatizando a coleta de métricas do sistema operacional e expondo-as em um dashboard web acessível via navegador.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| Node.js + Express | Backend / API REST |
| HTML + CSS + JavaScript | Dashboard frontend |
| Shell Script (sh) | Automação e coleta de logs |
| Docker | Containerização da aplicação |
| Kubernetes | Orquestração e deploy |
| GitHub Actions | Pipeline CI/CD |
| Jest + Supertest | Testes automatizados |

---

## 📁 Estrutura do Projeto

```
projeto-monitor/
│
├── src/                        # Código-fonte do backend
│   ├── index.js                # Servidor Express e definição das rotas da API
│   └── systemMetrics.js        # Coleta de métricas do sistema via comandos Linux
│
├── public/                     # Frontend estático servido pelo Express
│   ├── index.html              # Estrutura do dashboard
│   ├── style.css               # Estilização da interface
│   └── app.js                  # Atualização das métricas em tempo real (fetch)
│
├── scripts/
│   └── monitoramento.sh        # Script Shell de coleta contínua e geração de logs
│
├── tests/                      # Testes automatizados
│   ├── api.test.js             # Testes de integração das rotas HTTP
│   └── systemMetrics.test.js   # Testes unitários das funções de métricas
│
├── k8s/                        # Manifests Kubernetes
│   ├── deployment.yaml         # Configuração do Deployment (réplicas, probes, env)
│   └── service.yaml            # Exposição do serviço na rede
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD com GitHub Actions
│
├── Dockerfile                  # Imagem Docker da aplicação
├── .env                        # Variáveis de ambiente (não versionado)
├── .dockerignore               # Arquivos ignorados no build Docker
├── .gitignore                  # Arquivos ignorados pelo Git
└── package.json                # Dependências e scripts do projeto
```

---

## ⚙️ Como Funciona

### Backend — API REST

O servidor Express (`src/index.js`) expõe as seguintes rotas:

| Rota | Descrição |
|---|---|
| `GET /` | Serve o dashboard web |
| `GET /health` | Health check da aplicação |
| `GET /api/metricas` | Retorna todas as métricas juntas |
| `GET /api/cpu` | Uso atual de CPU |
| `GET /api/ram` | Uso de memória RAM |
| `GET /api/disco` | Uso do disco |

### Coleta de Métricas — Sistemas Operacionais Linux

O arquivo `src/systemMetrics.js` executa comandos nativos do Linux para coletar os dados em tempo real:

| Métrica | Comando Linux utilizado |
|---|---|
| CPU | `top -bn1 \| grep 'Cpu(s)'` |
| RAM | `free -m` |
| Disco | `df -h /` |
| Processos ativos | `ps aux --no-headers \| wc -l` |
| Uptime | `uptime -p` |

### Frontend — Dashboard

O dashboard (`public/`) consome a API via `fetch` a cada poucos segundos e atualiza os cartões de CPU, RAM, Disco e Processos com barras de progresso visuais, sem recarregar a página.

### Script Shell — Automação e Logs

O `scripts/monitoramento.sh` é um script independente que:
- Coleta as mesmas métricas via comandos Linux
- Grava registros contínuos em `logs/sistema.log`
- Emite alertas em `logs/alertas.log` quando a RAM ultrapassa o limite configurado
- O intervalo de coleta e o limite de RAM são controlados por variáveis de ambiente

---

## 🔁 Pipeline CI/CD — GitHub Actions

O arquivo `.github/workflows/ci.yml` define dois jobs executados automaticamente a cada `push` ou `pull_request` na branch `main`:

**Job 1 — Test**
1. Faz checkout do repositório
2. Instala o Node.js 20
3. Instala as dependências (`npm ci`)
4. Valida a sintaxe do script Shell (`sh -n`)
5. Executa todos os testes automatizados (`npm test`)

**Job 2 — Docker** *(depende do Job 1 passar)*
1. Faz o build da imagem Docker
2. Sobe o container e executa um smoke test no `/health`

---

## 🧪 Testes Automatizados

Os testes cobrem ~93% do código e estão divididos em:

**`tests/api.test.js`** — Testes de integração:
- Verifica se todas as rotas retornam HTTP 200
- Valida a estrutura do JSON retornado
- Garante que os tipos de dados estão corretos

**`tests/systemMetrics.test.js`** — Testes unitários:
- Valida a estrutura retornada por cada função de coleta
- Verifica se `ram.percent` está entre 0 e 100
- Verifica se `cpu.value` é um número válido
- Confirma que o timestamp segue o formato ISO 8601

Para rodar os testes:
```bash
npm test
```

---

## 🐳 Docker

A aplicação é containerizada com uma imagem baseada em `node:20-alpine`. O Dockerfile:
1. Instala utilitários Linux necessários (`procps`, `coreutils`, `util-linux`)
2. Copia apenas os arquivos necessários para produção
3. Expõe a porta 3000
4. Inicializa o servidor Node.js

```bash
# Build
docker build -t monitor-linux .

# Execução
docker run -p 3000:3000 monitor-linux
```

---

## ☸️ Kubernetes

Os manifests em `k8s/` definem a infraestrutura de orquestração:

**`deployment.yaml`**
- 1 réplica do container
- Variáveis de ambiente injetadas via `env`
- **Liveness Probe**: verifica `/health` a cada 15s para reiniciar o container se travar
- **Readiness Probe**: verifica `/health` a cada 10s para sinalizar quando o container está pronto para receber tráfego

**`service.yaml`**
- Expõe o Deployment internamente no cluster

```bash
# Aplicar no cluster
kubectl apply -f k8s/
```

---

## 🌍 Variáveis de Ambiente

Definidas no `.env` (não deve ser commitado em produção):

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor HTTP |
| `RAM_THRESHOLD` | `80` | Limite de RAM (%) para alertas |
| `MONITOR_INTERVAL` | `10` | Intervalo em segundos do script Shell |

---

## 🚀 Como Rodar Localmente

**Pré-requisito:** Node.js 20+

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor
npm start

# 3. Acessar no navegador
# http://localhost:3000
```

> ⚠️ As métricas exibidas são do sistema onde a aplicação estiver rodando. Para ver os dados do seu PC, rode localmente com `npm start`.

---

## 📊 Critérios do Projeto Atendidos

| Critério | Implementação |
|---|---|
| Git / Git Flow | Branches `main`, `develop`, `feature/*`, Pull Requests |
| Sistemas Operacionais Linux | Comandos `top`, `free`, `df`, `ps`, `uptime` + script Shell com logs e alertas |
| Pipeline CI/CD | GitHub Actions com build, testes e smoke test Docker |
| Docker | Dockerfile com imagem Alpine, build e execução containerizada |
| Kubernetes | Deployment + Service + Liveness/Readiness Probes |
| Testes Automatizados | 20 testes Jest/Supertest com ~93% de cobertura |
| Organização e documentação | Estrutura clara de diretórios, variáveis de ambiente separadas, README completo |
