import { drizzle } from "drizzle-orm/libsql/http";
import { createClient } from "@libsql/client/http";
import * as schema from "./schema";

// Use HTTP client which is more compatible with edge runtimes
const connectionString = process.env.TURSO_CONNECTION_URL || "https://placeholder-url-for-build.com";
const authToken = process.env.TURSO_AUTH_TOKEN || "placeholder-token";

const client = createClient({
    url: connectionString,
    authToken: authToken
});

export const db = drizzle(client, { schema });
