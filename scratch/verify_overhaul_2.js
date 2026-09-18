(() => {
    const results = {};
    const app = window.gameApp;
    const gs = app.gameState;

    // 1. Check GE and AZ ownership
    results.geOwner = gs.regions['ge']?.owner;
    results.azOwner = gs.regions['az']?.owner;

    // 2. Check Germany's 16 provinces
    const deProvs = Object.values(gs.regions).filter(r => r.id.startsWith('de_'));
    results.deCount = deProvs.length;
    results.deAllHavePolygons = deProvs.every(r => r.projectedPolygons && r.projectedPolygons.length > 0);
    results.deAllHavePath2d = deProvs.every(r => !!r.path2d);
    results.deIds = deProvs.map(r => r.id);

    // 3. Check USSR provinces: Russia, Ukraine, Belarus
    const ruProvs = Object.values(gs.regions).filter(r => r.id.startsWith('ru_'));
    const uaProvs = Object.values(gs.regions).filter(r => r.id.startsWith('ua_'));
    const byProvs = Object.values(gs.regions).filter(r => r.id.startsWith('by_'));
    results.ruCount = ruProvs.length;
    results.uaCount = uaProvs.length;
    results.byCount = byProvs.length;
    results.ruAllHavePolygons = ruProvs.every(r => r.projectedPolygons && r.projectedPolygons.length > 0);
    results.uaAllHavePolygons = uaProvs.every(r => r.projectedPolygons && r.projectedPolygons.length > 0);
    results.byAllHavePolygons = byProvs.every(r => r.projectedPolygons && r.projectedPolygons.length > 0);

    // Verify eastern Russian cities like Kazan and Samara have valid bounds and polygons
    const ruKazan = gs.regions['ru_kazan'];
    const ruSamara = gs.regions['ru_samara'];
    results.kazanValid = ruKazan && ruKazan.projectedPolygons.length > 0;
    results.samaraValid = ruSamara && ruSamara.projectedPolygons.length > 0;

    // 4. Check Army Morale & Blitz Fatigue system
    const m1 = gs.getArmyMorale('germany');
    results.initialMorale = { order: m1.order, percent: m1.percent, damageMult: m1.damageMult, casualtyMult: m1.casualtyMult };

    // Setup adjacent regions for attack simulation
    const berlin = gs.regions['de_berlin'];
    const dresden = gs.regions['de_dresden'];
    dresden.owner = 'neutral';
    dresden.units = { infantry: 1, armor: 0, air: 0 };
    berlin.owner = 'germany';
    berlin.units = { infantry: 10, armor: 5, air: 2 };
    gs.turnOrder = ['germany', 'neutral'];
    gs.currentTurnIndex = 0;

    // Simulate 4 consecutive attacks
    const attResults = [];
    for (let i = 1; i <= 4; i++) {
        dresden.owner = 'neutral';
        dresden.units = { infantry: 1, armor: 0, air: 0 };
        berlin.units = { infantry: 10, armor: 5, air: 2 };
        const res = gs.executeAttack('de_berlin', 'de_dresden', { infantry: 2, armor: 1, air: 0 });
        const lastRep = gs.lastCombatReport;
        attResults.push({
            attackNum: i,
            success: res.success,
            attacksCountThisTurn: gs.attacksThisTurn['germany'],
            moraleStatus: gs.getArmyMorale('germany')
        });
    }
    results.attackSimulation = attResults;

    // End turn and verify morale resets
    gs.endTurn();
    const moraleAfterTurn = gs.getArmyMorale('germany');
    results.moraleAfterTurnReset = {
        attacksCount: gs.attacksThisTurn['germany'] || 0,
        percent: moraleAfterTurn.percent
    };

    return JSON.stringify(results);
})()
