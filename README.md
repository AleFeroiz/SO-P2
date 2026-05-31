# 🖥️ Monitor Linux — Projeto Integrador DevOps

Sistema de monitoramento de recursos Linux com **dashboard web**, **API REST** e infraestrutura completa com Docker, Kubernetes e CI/CD.

---

## 📋 Objetivo

Demonstrar na prática a integração entre **desenvolvimento**, **infraestrutura** e **sistemas operacionais Linux**, aplicando conceitos de DevOps como containerização, orquestração, pipelines automatizados e monitoramento.

---

## 🚀 Tecnologias Utilizadas

| Tecnologia     | Finalidade                              |
|----------------|-----------------------------------------|
| Node.js 18     | Servidor HTTP e dashboard web           |
| Shell Script   | Coleta de métricas Linux em background  |
| Docker         | Containerização da aplicação            |
| Kubernetes     | Orquestração e escalabilidade           |
| GitHub Actions | Pipeline CI/CD automatizado             |

---

## 🗂️ Estrutura do Projeto

```
projeto-monitor/
├── src/
│   └── index.js              # Servidor Node.js + dashboard web
├── scripts/
│   └── monitoramento.sh      # Coleta métricas Linux (Shell Script)
├── tests/
│   └── app.test.js           # Testes automatizados
├── k8s/
│   ├── deployment.yaml       # Deploy no Kubernetes
│   └── service.yaml          # Service para expor a aplicação
├── .github/
│   └── workflows/
│       └── ci-cd.yml         # Pipeline GitHub Actions
├── logs/                     # Gerado automaticamente (gitignored)
├── Dockerfile                # Imagem Docker da aplicação
├── docker-compose.yml        # Execução local simplificada
├── entrypoint.sh             # Inicia monitoramento + servidor
├── package.json              # Dependências e scripts Node.js
└── .env                      # Variáveis de ambiente (não commitar)
```

---

## ⚙️ Como Rodar

### Opção 1 — Direto com Node.js

```bash
# Instalar dependências
npm install

# Rodar o servidor
npm start

# Acessar no navegador
http://localhost:3000
```

### Opção 2 — Docker Compose (recomendado)

```bash
# Subir tudo com um comando
docker-compose up --build

# Acessar no navegador
http://localhost:3000

# Parar
docker-compose down
```

### Opção 3 — Docker Manual

```bash
# Build da imagem
docker build -t monitor-linux .

# Rodar o container
docker run -p 3000:3000 monitor-linux

# Acessar no navegador
http://localhost:3000
```

---

## 🌐 Endpoints da API

| Método | Rota             | Descrição                          |
|--------|------------------|------------------------------------|
| GET    | `/`              | Dashboard web com métricas ao vivo |
| GET    | `/api/metricas`  | Métricas em formato JSON           |
| GET    | `/api/logs`      | Últimas 50 linhas de log           |
| GET    | `/health`        | Health check (usado pelo K8s)      |

---

## 🐳 Docker

A imagem é baseada em `node:18-alpine` com ferramentas Linux (`procps`, `coreutils`) instaladas.

O `entrypoint.sh` inicia dois processos:
1. `monitoramento.sh` — roda em background coletando métricas
2. `node src/index.js` — servidor web em foreground

---

## ☸️ Kubernetes

```bash
# Aplicar deployment e service
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Verificar pods
kubectl get pods

# Acessar a aplicação
kubectl port-forward deployment/monitor-linux 3000:3000
```

O deployment inclui **liveness probe** e **readiness probe** no endpoint `/health`, permitindo que o Kubernetes reinicie automaticamente o container se ele travar.

---

## 🔄 Pipeline CI/CD (GitHub Actions)

O arquivo `.github/workflows/ci-cd.yml` executa automaticamente ao fazer push:

1. **Testes** — valida arquivos, sintaxe do shell e endpoints HTTP
2. **Docker Build** — constrói e testa a imagem
3. **Kubernetes Validate** — valida os manifests YAML

---

## 🐧 Conceitos de Linux Aplicados

- **Shell Script** — coleta de métricas com `free`, `top`, `df`, `ps`
- **Gerenciamento de processos** — background com `&`, controle via `PID`
- **Logs** — geração automática em `/logs/sistema.log` e `/logs/alertas.log`
- **Variáveis de ambiente** — configuração via `.env` e `ENV` no Dockerfile
- **Permissões** — `chmod +x` nos scripts
- **Agendamento implícito** — loop `while true` com `sleep` no script

---

## 📊 Variáveis de Ambiente

| Variável           | Padrão  | Descrição                          |
|--------------------|---------|------------------------------------|
| `PORT`             | `3000`  | Porta do servidor Node.js          |
| `LOG_DIR`          | `./logs`| Caminho dos arquivos de log        |
| `RAM_THRESHOLD`    | `80`    | % de RAM para disparar alerta      |
| `MONITOR_INTERVAL` | `10`    | Intervalo de coleta em segundos    |
