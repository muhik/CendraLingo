// Raw Turso HTTP client - Cloudflare Pages compatible
export async function tursoQuery(sql: string, args: any[] = []) {
    const url = process.env.TURSO_CONNECTION_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!url || !token) {
        throw new Error("Database credentials missing");
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            statements: [{ q: sql, params: args }]
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    // Check for errors in response
    if (data[0]?.error) {
        throw new Error(data[0].error.message || "Query failed");
    }

    const result = data[0]?.results;
    if (!result) return [];

    const columns = result.columns;
    const rows = result.rows;

    if (!columns || !rows) return [];

    return rows.map((row: any[]) => {
        const obj: any = {};
        columns.forEach((col: string, i: number) => {
            obj[col] = row[i];
        });
        return obj;
    });
}

// Get single row
export async function tursoQueryOne(sql: string, args: any[] = []) {
    const rows = await tursoQuery(sql, args);
    return rows[0] || null;
}

// Execute without result (INSERT, UPDATE, DELETE)
export async function tursoExecute(sql: string, args: any[] = []) {
    await tursoQuery(sql, args);
    return true;
}
