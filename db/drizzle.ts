import { drizzle } from "drizzle-orm/libsql";
import { createClient, Client } from "@libsql/client/web";
import * as schema from "./schema";

// Lazy initialization - DB client is created per-request with runtime env vars
let cachedClient: Client | null = null;

export function getDb() {
    // Try to get env from Cloudflare runtime context first
    let url: string | undefined;
    let token: string | undefined;

    try {
        // For Cloudflare Pages runtime
        const { getRequestContext } = require("@cloudflare/next-on-pages");
        const ctx = getRequestContext();
        url = ctx.env.TURSO_CONNECTION_URL;
        token = ctx.env.TURSO_AUTH_TOKEN;
    } catch {
        // Fallback to process.env for local dev / build time
        url = process.env.TURSO_CONNECTION_URL;
        token = process.env.TURSO_AUTH_TOKEN;
    }

    if (!url || !token) {
        throw new Error(`Database credentials missing. URL: ${url ? 'SET' : 'MISSING'}, Token: ${token ? 'SET' : 'MISSING'}`);
    }

    // Create client if not cached or if credentials changed
    if (!cachedClient) {
        cachedClient = createClient({ url, authToken: token });
    }

    return drizzle(cachedClient, { schema });
}

// For backward compatibility - exports a proxy that calls getDb()
export const db = new Proxy({} as ReturnType<typeof getDb>, {
    get(_, prop) {
        return (getDb() as any)[prop];
    }
});
