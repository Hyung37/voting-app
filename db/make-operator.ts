import { Client } from "@neondatabase/serverless";

async function main() {
  const email = process.argv[2];
  if (!email) {
    throw new Error("Usage: npm run db:make-operator -- <email>");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client(process.env.DATABASE_URL);
  await client.connect();

  const result = await client.query(
    "update users set is_operator = true where email = $1 and email_verified = true returning id",
    [email],
  );

  await client.end();

  if (result.rowCount === 0) {
    throw new Error(
      `No verified account found for ${email}. They must sign up and verify their email first.`,
    );
  }

  console.log(`${email} is now an operator.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
