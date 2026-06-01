const { collectMetrics, getCpu, getRam, getDisk, getProcesses, getUptime } = require("../src/systemMetrics");

describe("collectMetrics", () => {
    test("retorna estrutura correta", () => {
        const result = collectMetrics();
        expect(result).toHaveProperty("timestamp");
        expect(result).toHaveProperty("uptime");
        expect(result).toHaveProperty("cpu");
        expect(result).toHaveProperty("ram");
        expect(result).toHaveProperty("disk");
        expect(result).toHaveProperty("processes");
    });

    test("timestamp é uma string ISO válida", () => {
        const { timestamp } = collectMetrics();
        expect(typeof timestamp).toBe("string");
        expect(() => new Date(timestamp)).not.toThrow();
        expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    test("cpu tem campos value e label", () => {
        const { cpu } = collectMetrics();
        expect(cpu).toHaveProperty("value");
        expect(cpu).toHaveProperty("label");
        expect(typeof cpu.value).toBe("number");
        expect(cpu.value).toBeGreaterThanOrEqual(0);
    });

    test("ram tem campos total, used, percent e label", () => {
        const { ram } = collectMetrics();
        expect(ram).toHaveProperty("total");
        expect(ram).toHaveProperty("used");
        expect(ram).toHaveProperty("percent");
        expect(ram).toHaveProperty("label");
        expect(ram.percent).toBeGreaterThanOrEqual(0);
        expect(ram.percent).toBeLessThanOrEqual(100);
    });

    test("disk tem campos total, used, percent e label", () => {
        const { disk } = collectMetrics();
        expect(disk).toHaveProperty("total");
        expect(disk).toHaveProperty("used");
        expect(disk).toHaveProperty("percent");
        expect(disk).toHaveProperty("label");
    });

    test("processes é um número não negativo", () => {
        const { processes } = collectMetrics();
        expect(typeof processes).toBe("number");
        expect(processes).toBeGreaterThanOrEqual(0);
    });
});

describe("getCpu", () => {
    test("retorna value como número", () => {
        const cpu = getCpu();
        expect(typeof cpu.value).toBe("number");
    });

    test("retorna label com %", () => {
        const cpu = getCpu();
        expect(cpu.label).toContain("%");
    });
});

describe("getRam", () => {
    test("used não ultrapassa total", () => {
        const ram = getRam();
        expect(ram.used).toBeLessThanOrEqual(ram.total);
    });

    test("percent entre 0 e 100", () => {
        const ram = getRam();
        expect(ram.percent).toBeGreaterThanOrEqual(0);
        expect(ram.percent).toBeLessThanOrEqual(100);
    });
});

describe("getProcesses", () => {
    test("retorna número maior que zero", () => {
        const count = getProcesses();
        expect(count).toBeGreaterThan(0);
    });
});
