
const tryTriggerAd = (chance, testName) => {
    let triggers = 0;
    const iterations = 100;

    console.log(`\n--- Testing ${testName} (Chance: ${chance * 100}%) ---`);

    for (let i = 0; i < iterations; i++) {
        const roll = Math.random();
        // Simulate logic from ad-manager.tsx
        if (roll <= chance) {
            triggers++;
        }
    }

    console.log(`Simulated ${iterations} events.`);
    console.log(`Ads Triggered: ${triggers}`);
    console.log(`Actual Rate: ${(triggers / iterations) * 100}%`);

    if (Math.abs((triggers / iterations) - chance) < 0.15) {
        console.log("✅ RESULT: Probability allows sporadic behavior as expected.");
    } else {
        console.log("⚠️ RESULT: Variance is high (randomness is working).");
    }
};

// Simulate Route Change (30%)
tryTriggerAd(0.3, "Navigation Change");

// Simulate Lesson Complete (80%)
tryTriggerAd(0.8, "Lesson Complete");
