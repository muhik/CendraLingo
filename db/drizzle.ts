import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const connectionString = process.env.TURSO_CONNECTION_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

// If using Turso (Production / Cloud)
// Ideally we check if env vars are present.
// For now, let's allow fallback or keep it simple.
// Since User is moving to Cloud, we prioritize Turso if env vars exist.

import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";

let db: any;

if (process.env.TURSO_CONNECTION_URL) {
    const client = createClient({
        url: process.env.TURSO_CONNECTION_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });
    db = drizzle(client, { schema });
} else {
    const sqlite = new Database("sqlite.db");
    db = drizzleSqlite(sqlite, { schema });
}

export { db };
