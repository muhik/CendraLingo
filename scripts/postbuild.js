const fs = require('fs');
const path = require('path');

const outputDir = '.open-next';
const workerFile = path.join(outputDir, 'worker.js');
const finalWorkerFile = path.join(outputDir, '_worker.js');
const assetsDir = path.join(outputDir, 'assets');
const routesFile = path.join(outputDir, '_routes.json');

console.log('🚀 Starting Post-Build Script...');

// 1. Rename worker.js to _worker.js
if (fs.existsSync(workerFile)) {
    fs.renameSync(workerFile, finalWorkerFile);
    console.log('✅ Renamed worker.js to _worker.js');
} else {
    console.log('⚠️ worker.js not found (already renamed?)');
}

// 2. Move assets from .open-next/assets to .open-next root
if (fs.existsSync(assetsDir)) {
    console.log('📂 Moving assets to root...');
    const items = fs.readdirSync(assetsDir);

    items.forEach(item => {
        const srcPath = path.join(assetsDir, item);
        const destPath = path.join(outputDir, item);

        console.log(`   -> Moving ${item}`);

        // Use cpSync + rmSync to simulate move across potentially different devices/folders
        fs.cpSync(srcPath, destPath, { recursive: true, force: true });
    });

    // Remove the empty assets directory
    fs.rmSync(assetsDir, { recursive: true, force: true });
    console.log('✅ Assets moved successfully.');
} else {
    console.log('⚠️ Assets directory not found (already moved?)');
}

// 3. Generate _routes.json to exclude static assets from Worker
// This ensures /_next/static/* is served from CDN, not processed by Worker (which would 404).
const routesConfig = {
    version: 1,
    include: ["/*"],
    exclude: [
        "/_next/static/*",
        "/favicon.ico",
        "/*.png",
        "/*.svg",
        "/*.jpg",
        "/*.jpeg",
        "/*.gif",
        "/*.webp"
    ]
};

fs.writeFileSync(routesFile, JSON.stringify(routesConfig, null, 2));
console.log('✅ Generated _routes.json for proper routing.');

console.log('🎉 Post-Build Script Complete!');
