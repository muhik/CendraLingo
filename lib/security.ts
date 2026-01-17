import { tursoExecute, tursoQuery } from "@/db/turso-http";

export enum SecurityEvent {
    SUSPICIOUS_SYNC = "SUSPICIOUS_SYNC",
    SPIN_ABUSE = "SPIN_ABUSE",
    VOUCHER_BRUTEFORCE = "VOUCHER_BRUTEFORCE",
    REDEEM_ABUSE = "REDEEM_ABUSE",
    GEMS_MANIPULATION = "GEMS_MANIPULATION",
    LOGIN_FAIL = "LOGIN_FAIL",
}

export enum SecuritySeverity {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    CRITICAL = "CRITICAL",
}

export class Security {

    /**
     * Log a security incident to the database.
     */
    static async log(userId: string, userName: string, event: SecurityEvent, description: string, severity: SecuritySeverity, ip?: string) {
        try {
            console.warn(`[SECURITY] ${severity} - ${event}: ${description} (${userId})`);
            await tursoExecute(
                "INSERT INTO security_logs (user_id, user_name, event_type, description, severity, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [userId, userName || "Unknown", event, description, severity, ip || "unknown", new Date().toISOString()]
            );
        } catch (e) {
            console.error("Failed to log security event:", e);
        }
    }

    /**
     * Check if an action is allowed based on rate limits.
     * returns TRUE if allowed, FALSE if blocked.
     */
    static async checkRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
        try {
            const now = Date.now();
            const windowMs = windowSeconds * 1000;

            const rows = await tursoQuery("SELECT * FROM rate_limits WHERE key = ?", [key]);
            const record = rows[0];

            if (!record) {
                await tursoExecute("INSERT INTO rate_limits (key, count, last_request, blocked_until) VALUES (?, 1, ?, 0)", [key, now]);
                return true;
            }

            if (record.blocked_until > now) {
                return false; // Still blocked
            }

            if (now - record.last_request > windowMs) {
                // Window reset
                await tursoExecute("UPDATE rate_limits SET count = 1, last_request = ? WHERE key = ?", [now, key]);
                return true;
            } else {
                // Inside window
                if (record.count >= maxRequests) {
                    // Block for 2x window
                    const blockUntil = now + (windowMs * 2);
                    await tursoExecute("UPDATE rate_limits SET blocked_until = ? WHERE key = ?", [blockUntil, key]);
                    return false;
                }

                await tursoExecute("UPDATE rate_limits SET count = count + 1, last_request = ? WHERE key = ?", [now, key]);
                return true;
            }

        } catch (e) {
            console.error("Rate limit check failed:", e);
            return true; // Fail open to not break UX if DB is slow, but log error
        }
    }
}
