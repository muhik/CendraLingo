import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/web";
import * as schema from "./schema";

const connectionString = process.env.TURSO_CONNECTION_URL || "https://placeholder-url-for-build.com";
const authToken = process.env.TURSO_AUTH_TOKEN || "placeholder-token";

// Use @libsql/client for both Edge and Local (file: logic handled if needed, or just remote)
const client = createClient({
    url: connectionString,
    authToken: authToken
});

export const db = drizzle(client, { schema });
