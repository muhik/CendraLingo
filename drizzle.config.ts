import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./db/schema.ts",
    out: "./drizzle",
    dialect: "turso",
    dbCredentials: {
        url: (process.env.TURSO_CONNECTION_URL || "sqlite.db").trim(),
        authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
    },
});
