import { execFileSync } from "node:child_process";
import path from "node:path";
import { Client } from "pg";

const DEFAULT_TEST_DATABASE_URL =
  "postgresql://newestetica:changeme-dev@127.0.0.1:5432/newestetica_test";

function testDatabaseUrl(): string {
  return process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
}

async function ensureDatabaseExists(url: string): Promise<void> {
  const database = new URL(url);
  const databaseName = database.pathname.slice(1);
  const admin = new URL(url);
  admin.pathname = "/postgres";
  admin.search = "";

  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const existing = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [databaseName],
    );
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${databaseName}"`);
    }
  } finally {
    await client.end();
  }
}

function applyMigrations(url: string): void {
  const backendRoot = path.resolve(__dirname, "../..");
  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    cwd: backendRoot,
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });
}

export default async function setup(): Promise<void> {
  const url = testDatabaseUrl();
  await ensureDatabaseExists(url);
  applyMigrations(url);
}
