import { defineConfig } from "drizzle-kit"
import { env } from "./env"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL ?? "",
    ssl: true,
  },
  schemaFilter: [env.DATABASE_SCHEMA],
  migrations: {
    schema: "public",
    table: "__drizzle_migrations",
  },
})
