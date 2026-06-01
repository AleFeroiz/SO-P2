const { execSync } = require("child_process");

// Tenta executar um comando e retorna o resultado, ou fallback em caso de erro
function run(cmd, fallback = "N/A") {
    try {
        return execSync(cmd, { timeout: 3000 }).toString().trim();
    } catch {
        return fallback;
    }
}

function getCpu() {
    const raw = run("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | tr -d '%'", "0");
    const value = parseFloat(raw) || 0;
    return { value, label: `${value.toFixed(1)}%` };
}

function getRam() {
    const raw = run("free -m | awk '/Mem:/ {print $2, $3}'", "0 0");
    const parts = raw.split(" ");
    const total = parseInt(parts[0]) || 0;
    const used  = parseInt(parts[1]) || 0;
    const percent = total > 0 ? Math.round((used / total) * 100) : 0;
    return { total, used, percent, label: `${used} MB / ${total} MB` };
}

function getDisk() {
    const raw = run("df -h / | tail -1 | awk '{print $2, $3, $5}'", "N/A N/A N/A");
    const parts = raw.split(" ");
    return {
        total:   parts[0] || "N/A",
        used:    parts[1] || "N/A",
        percent: parts[2] || "N/A",
        label:   `${parts[1] || "N/A"} / ${parts[0] || "N/A"} (${parts[2] || "N/A"})`,
    };
}

function getProcesses() {
    const raw = run("ps aux --no-headers | wc -l", "0");
    return parseInt(raw) || 0;
}

function getUptime() {
    return run("uptime -p", "N/A");
}

function collectMetrics() {
    return {
        timestamp: new Date().toISOString(),
        uptime:    getUptime(),
        cpu:       getCpu(),
        ram:       getRam(),
        disk:      getDisk(),
        processes: getProcesses(),
    };
}

module.exports = { collectMetrics, getCpu, getRam, getDisk, getProcesses, getUptime };
