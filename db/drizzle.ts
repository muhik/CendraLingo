import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const connectionString = process.env.TURSO_CONNECTION_URL!;
const authToken = process.env.TURSO_AUTH_TOKEN!;

// Use @libsql/client for both Edge and Local (file: logic handled if needed, or just remote)
const client = createClient({
    url: connectionString || "file:sqlite.db",
    authToken: authToken
});

export const db = drizzle(client, { schema });
