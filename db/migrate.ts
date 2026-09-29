import { Client } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import path from "node:path";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await client.query(schema);

  await client.end();
  console.log("Migration applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
