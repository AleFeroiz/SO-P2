const POLL_INTERVAL = 5000; // ms

function setBar(id, percent) {
    const el = document.getElementById(id);
    if (!el) return;
    const p = Math.min(Math.max(percent, 0), 100);
    el.style.width = p + "%";
    el.classList.remove("medium", "high");
    if (p >= 80) el.classList.add("high");
    else if (p >= 50) el.classList.add("medium");
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setAlert(cardId, on) {
    const el = document.getElementById(cardId);
    if (el) el.classList.toggle("alert", on);
}

async function fetchMetrics() {
    try {
        const res  = await fetch("/api/metricas");
        const json = await res.json();
        const d    = json.data;

        // CPU
        setText("cpu-value", d.cpu.label);
        setBar("cpu-bar", d.cpu.value);
        setAlert("card-cpu", d.cpu.value >= 80);

        // RAM
        setText("ram-value", d.ram.percent + "%");
        setText("ram-label", d.ram.label);
        setBar("ram-bar", d.ram.percent);
        setAlert("card-ram", d.ram.percent >= 80);

        // Disco
        const diskPct = parseInt(d.disk.percent) || 0;
        setText("disk-value", d.disk.percent);
        setText("disk-label", d.disk.label);
        setBar("disk-bar", diskPct);
        setAlert("card-disk", diskPct >= 80);

        // Processos
        setText("proc-value", d.processes);

        // Info bar
        setText("uptime-value", d.uptime);
        setText("last-update", new Date(d.timestamp).toLocaleTimeString("pt-BR"));

        const badge = document.getElementById("status-badge");
        if (badge) {
            badge.textContent = "● Online";
            badge.className   = "badge badge-ok";
        }
    } catch (err) {
        console.error("Erro ao buscar métricas:", err);
        const badge = document.getElementById("status-badge");
        if (badge) {
            badge.textContent = "● Offline";
            badge.className   = "badge badge-error";
        }
    }
}

fetchMetrics();
setInterval(fetchMetrics, POLL_INTERVAL);
