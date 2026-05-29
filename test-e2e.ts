import "dotenv/config";
import { buildApp } from "./src/app";
import { FastifyInstance } from "fastify";

let app: FastifyInstance;
let passed = 0;
let failed = 0;

function log(status: string, name: string, detail?: string) {
  const icon = status === "PASS" ? "✓" : "✗";
  console.log(`  ${icon} ${name}${detail ? " — " + detail : ""}`);
  if (status === "PASS") passed++;
  else failed++;
}

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    log("PASS", name);
  } catch (e: any) {
    log("FAIL", name, e.message);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

async function main() {
  app = await buildApp();
  console.log("\n=== MePaga API — Testes E2E ===\n");

  // ─── 1. Registro com sucesso ───
  await test("POST /api/users/register — cria usuario", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/users/register",
      payload: {
        name: "Maria Teste",
        email: "maria.e2e@test.com",
        password: "senha123",
        pix_key: "maria@pix.com",
      },
    });
    assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.name === "Maria Teste", "Nome incorreto");
    assert(body.email === "maria.e2e@test.com", "Email incorreto");
    assert(body.pix_key === "maria@pix.com", "Pix incorreto");
    assert(typeof body.id === "number", "ID deve ser number");
  });

  // ─── 2. Email duplicado ───
  await test("POST /api/users/register — email duplicado retorna 409", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/users/register",
      payload: {
        name: "Maria Duplicada",
        email: "maria.e2e@test.com",
        password: "outrasenha1",
      },
    });
    assert(res.statusCode === 409, `Expected 409, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.error.includes("em uso"), `Msg inesperada: ${body.error}`);
  });

  // ─── 3. Registro sem pix_key ───
  await test("POST /api/users/register — sem pix_key funciona", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/users/register",
      payload: {
        name: "Joao Sem Pix",
        email: "joao.e2e@test.com",
        password: "abc456",
      },
    });
    assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.pix_key === null, "pix_key deveria ser null");
  });

  // ─── 4. Criar grupo ───
  await test("POST /api/groups — cria grupo", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/groups",
      payload: {
        name: "Viagem Teste",
        category: "viagem",
        creator_name: "Carlos E2E",
      },
    });
    assert(res.statusCode === 201, `Expected 201, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.group.name === "Viagem Teste", "Nome do grupo incorreto");
    assert(body.creator.name === "Carlos E2E", "Nome do criador incorreto");
    assert(typeof body.group.id === "number", "Group ID deve ser number");
  });

  // ─── 5. Link account ───
  await test("PATCH /api/users/link-account — vincula email", async () => {
    // Criar grupo para ter usuario temporario
    const groupRes = await app.inject({
      method: "POST",
      url: "/api/groups",
      payload: {
        name: "Grupo Link",
        category: "outros",
        creator_name: "Temp User",
      },
    });
    const { creator } = JSON.parse(groupRes.body);

    const res = await app.inject({
      method: "PATCH",
      url: "/api/users/link-account",
      payload: {
        user_id: creator.id,
        email: "linked.e2e@test.com",
      },
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.email === "linked.e2e@test.com", "Email nao vinculado");
    assert(body.is_temporary === false, "Deveria nao ser temporario");
  });

  // ─── 6. Login ───
  await test("POST /api/users/login — login com sucesso", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/users/login",
      payload: { email: "maria.e2e@test.com", password: "senha123" },
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.name === "Maria Teste", "Nome incorreto");
    assert(body.email === "maria.e2e@test.com", "Email incorreto");
    assert(typeof body.id === "number", "ID deve ser number");
  });

  // ─── 7. Login — senha errada ───
  await test("POST /api/users/login — senha errada retorna 401", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/users/login",
      payload: { email: "maria.e2e@test.com", password: "errada" },
    });
    assert(res.statusCode === 401, `Expected 401, got ${res.statusCode}`);
  });

  // ─── 8. User summary ───
  await test("GET /api/users/:id/summary — retorna saldo", async () => {
    // Pegar ID da Maria
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/users/login",
      payload: { email: "maria.e2e@test.com", password: "senha123" },
    });
    const { id } = JSON.parse(loginRes.body);

    const res = await app.inject({
      method: "GET",
      url: `/api/users/${id}/summary`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.totalBalance === 0, "Balance deveria ser 0");
    assert(body.name === "Maria Teste", "Nome incorreto");
  });

  // ─── 9. User groups ───
  await test("GET /api/users/:id/groups — retorna grupos", async () => {
    const loginRes = await app.inject({
      method: "POST",
      url: "/api/users/login",
      payload: { email: "maria.e2e@test.com", password: "senha123" },
    });
    const { id } = JSON.parse(loginRes.body);

    const res = await app.inject({
      method: "GET",
      url: `/api/users/${id}/groups`,
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(Array.isArray(body.groups), "groups deve ser array");
    assert(typeof body.settledCount === "number", "settledCount deve ser number");
  });

  // ─── 10. Forgot password ───
  await test("POST /api/users/forgot-password — envia codigo", async () => {
    // Criar usuario primeiro
    await app.inject({
      method: "POST",
      url: "/api/users/register",
      payload: { name: "Reset User", email: "reset.e2e@test.com", password: "old123" },
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/users/forgot-password",
      payload: { email: "reset.e2e@test.com" },
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.message.includes("enviado"), `Msg inesperada: ${body.message}`);
  });

  // ─── 7. Forgot password — email inexistente ───
  await test("POST /api/users/forgot-password — email inexistente retorna 404", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/users/forgot-password",
      payload: { email: "naoexiste@test.com" },
    });
    assert(res.statusCode === 404, `Expected 404, got ${res.statusCode}`);
  });

  // ─── 8. Reset password — codigo correto ───
  await test("POST /api/users/reset-password — reseta com codigo valido", async () => {
    // Pegar o codigo do banco
    const pg = require("pg");
    const pool2 = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    const { rows } = await pool2.query(
      "SELECT reset_code FROM users WHERE email = 'reset.e2e@test.com'"
    );
    await pool2.end();
    const code = rows[0].reset_code;

    const res = await app.inject({
      method: "POST",
      url: "/api/users/reset-password",
      payload: { email: "reset.e2e@test.com", code, new_password: "nova456" },
    });
    assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    const body = JSON.parse(res.body);
    assert(body.message.includes("sucesso"), `Msg inesperada: ${body.message}`);
  });

  // ─── 9. Reset password — codigo errado ───
  await test("POST /api/users/reset-password — codigo errado retorna 400", async () => {
    // Solicitar novo codigo primeiro
    await app.inject({
      method: "POST",
      url: "/api/users/forgot-password",
      payload: { email: "reset.e2e@test.com" },
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/users/reset-password",
      payload: { email: "reset.e2e@test.com", code: "000000", new_password: "teste1" },
    });
    assert(res.statusCode === 400, `Expected 400, got ${res.statusCode}`);
  });

  // ─── Resultado ───
  console.log(`\n  ${passed + failed} testes | ${passed} passou | ${failed} falhou\n`);

  // Cleanup
  const pg = require("pg");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pool.query(
    "DELETE FROM users WHERE email IN ('maria.e2e@test.com','joao.e2e@test.com','linked.e2e@test.com','teste.e2e@mepaga.com','reset.e2e@test.com')"
  );
  await pool.query("DELETE FROM users WHERE name IN ('Carlos E2E','Temp User')");
  await pool.end();
  console.log("  Cleanup concluido.\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
