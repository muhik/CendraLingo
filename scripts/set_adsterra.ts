
import { db } from "../db/drizzle";
import { adSettings } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Setting up Adsterra Script...");

    const scriptCode = `
<script>
  atOptions = {
    'key' : '1a207cd775f2c2cd48de53d771f6f575',
    'format' : 'iframe',
    'height' : 600,
    'width' : 160,
    'params' : {}
  };
</script>
<script src="https://www.highperformanceformat.com/1a207cd775f2c2cd48de53d771f6f575/invoke.js"></script>
    `.trim();

    try {
        const existing = await db.select().from(adSettings).limit(1);

        if (existing.length > 0) {
            await db.update(adSettings)
                .set({
                    type: 'script',
                    scriptCode: scriptCode,
                    isActive: 1,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(adSettings.id, existing[0].id));
            console.log("Updated existing ad settings.");
        } else {
            await db.insert(adSettings).values({
                type: 'script',
                scriptCode: scriptCode,
                isActive: 1,
                updatedAt: new Date().toISOString()
            });
            console.log("Created new ad settings.");
        }

        console.log("Success! Adsterra script installed.");
    } catch (error) {
        console.error("Error setting ad:", error);
    }
}

main();
