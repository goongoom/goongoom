import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
    ssl: true,
  },
  schemaFilter: ["goongoom"],
  migrations: {
    schema: "public",
    table: "__drizzle_migrations",
  },
})
