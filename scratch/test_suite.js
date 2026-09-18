(() => {
    const results = {};
    const app = window.gameApp;
    const gs = app.gameState;

    // 1. Check turkey provinces
    results.turkeyProvinces = Object.values(gs.regions).filter(r => r.owner === "turkey").map(r => r.id);
    results.turkeyProvincesCount = results.turkeyProvinces.length;

    // 2. Check capital & non-aligned start
    results.turkeyCapital = gs.factions.turkey.capitalRegionId;
    results.isTurkeyAlliedGermanyAtStart = gs.isAllied("turkey", "germany");
    results.turkeyAllianceId = gs.factions.turkey.allianceId;
    results.germanyAllianceId = gs.factions.germany.allianceId;

    // 3. Test Diplomatic Aid
    gs.factions.turkey.industryPoints = 50;
    const relBefore = gs.getRelation("turkey", "germany");
    const aidRes = gs.sendDiplomaticAid("turkey", "germany", 10);
    const relAfter = gs.getRelation("turkey", "germany");
    results.aid = { success: aidRes.success, relBefore, relAfter };

    // 4. Test Non-Aggression Pact
    const pactRes = gs.signNonAggressionPact("turkey", "germany", 5);
    results.pact = { hasPact: gs.hasNonAggressionPact("turkey", "germany") };

    // 5. Test Capital Relocation & Debuff
    const capRegion = gs.regions["tr_ankara"];
    capRegion.owner = "germany";
    gs.factions.turkey.capitalOccupiedTurns = 4;
    gs.turnOrder = ["turkey", "germany"];
    gs.currentTurnIndex = 1; // advancing to index 0 (turkey)
    gs.endTurn();
    results.capitalAfter5TurnsOccupation = gs.factions.turkey.capitalRegionId;
    results.isOldCapitalAnkaraCapital = gs.regions["tr_ankara"].capital;
    results.newCapitalIsOwnerTurkey = gs.regions[gs.factions.turkey.capitalRegionId].owner === "turkey";

    // 6. Test Exit Game Button
    document.getElementById("btn-exit-game").click();
    const modalConfirmShown = document.getElementById("modal-exit-confirm").classList.contains("visible");
    document.getElementById("btn-exit-confirm").click();
    results.exitTest = { modalConfirmShown, isGameStarted: app.isGameStarted, lobbyVisible: document.getElementById("modal-lobby").classList.contains("visible") };

    // 7. Test Briefing Back Button
    app._showStrategicBriefing();
    const briefingShown = document.getElementById("modal-briefing").classList.contains("visible");
    document.getElementById("btn-briefing-back").click();
    const briefingHiddenAfterBack = !document.getElementById("modal-briefing").classList.contains("visible");
    const lobbyShownAfterBack = document.getElementById("modal-lobby").classList.contains("visible");
    results.briefingBackTest = { briefingShown, briefingHiddenAfterBack, lobbyShownAfterBack };

    // 8. Test Difficulty Selector
    const hardPill = document.querySelector("#lobby-difficulty-pills [data-difficulty='hard']");
    if (hardPill) hardPill.click();
    results.difficultyAfterClick = app.gameState.aiDifficulty;

    return JSON.stringify(results);
})()
