// RESET SCRIPT - Run in browser console to fully reset guest state
// Copy and paste this entire block into browser console

(function resetForGuestTest() {
    console.log("🔄 Starting full reset...");

    // 1. Clear ALL localStorage
    localStorage.clear();
    console.log("✅ localStorage cleared");

    // 2. Clear sessionStorage
    sessionStorage.clear();
    console.log("✅ sessionStorage cleared");

    // 3. Clear IndexedDB (Zustand might use this)
    if (window.indexedDB) {
        indexedDB.databases().then(dbs => {
            dbs.forEach(db => {
                indexedDB.deleteDatabase(db.name);
                console.log("✅ IndexedDB deleted:", db.name);
            });
        }).catch(e => console.log("IndexedDB clear failed (normal in some browsers):", e));
    }

    // 4. Log current state
    console.log("📍 Current URL:", window.location.href);

    // 5. Force redirect to home
    console.log("🚀 Redirecting to home page in 1 second...");
    console.log("➡️  AFTER REDIRECT: Click the GREEN 'START GAME' button!");

    setTimeout(() => {
        window.location.href = "http://localhost:3005";
    }, 1000);
})();
