const request = require("supertest");
const app     = require("../src/index");

describe("GET /health", () => {
    it("retorna status ok", async () => {
        const res = await request(app).get("/health");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("ok");
    });
});

describe("GET /api/metricas", () => {
    it("retorna status 200", async () => {
        const res = await request(app).get("/api/metricas");
        expect(res.statusCode).toBe(200);
    });

    it("resposta tem campo data", async () => {
        const res = await request(app).get("/api/metricas");
        expect(res.body).toHaveProperty("data");
    });

    it("data contém cpu, ram, disk, processes", async () => {
        const res = await request(app).get("/api/metricas");
        const { data } = res.body;
        expect(data).toHaveProperty("cpu");
        expect(data).toHaveProperty("ram");
        expect(data).toHaveProperty("disk");
        expect(data).toHaveProperty("processes");
    });

    it("data.cpu.value é um número", async () => {
        const res = await request(app).get("/api/metricas");
        expect(typeof res.body.data.cpu.value).toBe("number");
    });
});

describe("GET /api/cpu", () => {
    it("retorna status 200 com campo data", async () => {
        const res = await request(app).get("/api/cpu");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("data");
    });
});

describe("GET /api/ram", () => {
    it("retorna status 200 com campo data", async () => {
        const res = await request(app).get("/api/ram");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("data");
    });

    it("ram.percent entre 0 e 100", async () => {
        const res = await request(app).get("/api/ram");
        const { percent } = res.body.data;
        expect(percent).toBeGreaterThanOrEqual(0);
        expect(percent).toBeLessThanOrEqual(100);
    });
});

describe("GET /api/disco", () => {
    it("retorna status 200 com campo data", async () => {
        const res = await request(app).get("/api/disco");
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("data");
    });
});
