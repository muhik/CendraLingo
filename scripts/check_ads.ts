
import { db } from "../db/drizzle";
import { adSettings } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking Ad Settings...");
    try {
        const settings = await db.select().from(adSettings);
        console.log("Found settings:", JSON.stringify(settings, null, 2));
    } catch (err) {
        console.error("Error:", err);
    }
}

main();
