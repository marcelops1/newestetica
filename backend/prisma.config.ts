import { defineConfig } from "prisma/config";

const PLACEHOLDER_URL =
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? PLACEHOLDER_URL,
  },
});
