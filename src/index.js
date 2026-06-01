const express = require("express");
const path    = require("path");
const { collectMetrics } = require("./systemMetrics");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ─── Rotas da API ──────────────────────────────────────────────

app.get("/api/metricas", (req, res) => {
    const data = collectMetrics();
    res.json({ status: "ok", data });
});

app.get("/api/cpu", (req, res) => {
    const { getCpu } = require("./systemMetrics");
    res.json({ status: "ok", data: getCpu() });
});

app.get("/api/ram", (req, res) => {
    const { getRam } = require("./systemMetrics");
    res.json({ status: "ok", data: getRam() });
});

app.get("/api/disco", (req, res) => {
    const { getDisk } = require("./systemMetrics");
    res.json({ status: "ok", data: getDisk() });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

// ─── Inicialização ─────────────────────────────────────────────

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Monitor Linux rodando na porta ${PORT}`);
    });
}

module.exports = app;
