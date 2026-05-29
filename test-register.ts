import "dotenv/config";
import { buildApp } from "./src/app";

async function main() {
  const app = await buildApp();

  const res = await app.inject({
    method: "POST",
    url: "/api/users/register",
    payload: {
      name: "Teste E2E",
      email: "teste.e2e@mepaga.com",
      password: "abc123",
      pix_key: "teste@pix.com",
    },
  });

  console.log("STATUS:", res.statusCode);
  console.log("BODY:", res.body);

  // cleanup if success
  if (res.statusCode === 201) {
    const body = JSON.parse(res.body);
    console.log("User created:", body.id);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
