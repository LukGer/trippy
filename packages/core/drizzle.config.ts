import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
  strict: true,
  verbose: true,
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: Resource.DatabaseUrl.value,
  },
  schema: "./src/**/*.sql.ts",
});
