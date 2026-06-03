import { defineConfig } from "drizzle-kit";

import { getDatabaseUrl, loadEnvFiles } from "./db/load-env";

loadEnvFiles();

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  verbose: true,
  strict: true,
});
