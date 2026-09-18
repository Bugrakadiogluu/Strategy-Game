/**
 * gameState.js - Central Authoritative State Management
 * Single source of truth for territories, faction economies,
 * turn cycling, player assignment, victory conditions, and serialization.
 */

import { INITIAL_REGIONS, MAP_DIMENSIONS } from './mapData.js';
import { FACTIONS, UNIT_TYPES, TURN_PHASES } from '../network/protocol.js';
import { CombatEngine } from './combat.js';
import { i18n } from '../i18n/translations.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.regions = {};
        this.factions = {};
        this.turnOrder = ['germany', 'uk', 'ussr', 'italy', 'france', 'spain', 'turkey', 'neutral'];
        this.currentTurnIndex = 0;
        this.currentPhase = TURN_PHASES.PRODUCTION;
        this.turnNumber = 1;
        this.actionHistory = [];
        this.winner = null;
        this.lastCombatReport = null;
        this.dimensions = MAP_DIMENSIONS;
        this.aiDifficulty = 'normal'; // 'easy' | 'normal' | 'hard'
        this.pacts = []; // Active non-aggression treaties: [{ f1, f2, turnsRemaining }]
        this.relations = {};

        this.initFactions();
        this.initRegions();
    }

    initFactions() {
        const playable = ['germany', 'uk', 'ussr', 'italy', 'france', 'spain', 'turkey'];
        for (const [key, f] of Object.entries(FACTIONS)) {
            const fId = f.id;
            this.factions[fId] = {
                ...f,
                industryPoints: 0,
                isEliminated: false,
                isAI: (fId !== 'neutral'),
                playerId: null,
                totalUnits: 0,
                totalRegions: 0,
                // Every nation starts non-aligned ("tek tabanca")
                allianceId: fId,
                capitalRegionId: null,
                originalCapitalRegionId: null,
                capitalOccupiedTurns: 0
            };
        }

        // Initialize dynamic diplomatic relations matrix (0 to 100)
        this.relations = {};
        for (const f1 of playable) {
            this.relations[f1] = {};
            for (const f2 of playable) {
                if (f1 === f2) {
                    this.relations[f1][f2] = 100;
                } else {
                    let baseline = 50;
                    if ((f1 === 'germany' && f2 === 'italy') || (f1 === 'italy' && f2 === 'germany')) baseline = 65;
                    else if ((f1 === 'germany' && f2 === 'spain') || (f1 === 'spain' && f2 === 'germany')) baseline = 60;
                    else if ((f1 === 'uk' && f2 === 'france') || (f1 === 'france' && f2 === 'uk')) baseline = 65;
                    else if ((f1 === 'uk' && f2 === 'ussr') || (f1 === 'ussr' && f2 === 'uk')) baseline = 55;
                    else if ((f1 === 'germany' && f2 === 'ussr') || (f1 === 'ussr' && f2 === 'germany')) baseline = 35;
                    this.relations[f1][f2] = baseline;
                }
            }
        }
    }

    initRegions() {
        for (const r of INITIAL_REGIONS) {
            let path2d = r.path2d || null;
            if (!path2d && typeof Path2D !== 'undefined' && (r.svgPath || r.path)) {
                try { path2d = new Path2D(r.svgPath || r.path); } catch (_) {}
            }
            const regionData = {
                id: r.id,
                code: r.code || r.id.toUpperCase(),
                name: r.name,
                geoName: r.geoName || r.name,
                owner: r.owner,
                terrain: r.terrain,
                industry: r.industry,
                capital: r.capital,
                capitalCity: r.capitalCity || null,
                x: r.x,
                y: r.y,
                bounds: r.bounds || null,
                path: r.svgPath || r.path,
                path2d,
                polygon: r.polygon ? JSON.parse(JSON.stringify(r.polygon)) : null,
                projectedPolygons: r.projectedPolygons || null,
                neighbors: [...r.neighbors],
                units: {
                    infantry: r.initialUnits ? (r.initialUnits.infantry || 0) : 0,
                    armor: r.initialUnits ? (r.initialUnits.armor || 0) : 0,
                    air: r.initialUnits ? (r.initialUnits.air || 0) : 0
                }
            };
            this.regions[r.id] = regionData;

            // Non-enumerable aliases so Object.values() won't duplicate territories
            if (r.aliases && Array.isArray(r.aliases)) {
                for (const alias of r.aliases) {
                    if (alias !== r.id && !(alias in this.regions)) {
                        Object.defineProperty(this.regions, alias, {
                            value: regionData,
                            enumerable: false,
                            writable: true,
                            configurable: true
                        });
                    }
                }
            }
        }

        // Establish initial capitals for each faction
        for (const r of Object.values(this.regions)) {
            if (r.capital && this.factions[r.owner] && !this.factions[r.owner].capitalRegionId) {
                this.factions[r.owner].capitalRegionId = r.id;
                this.factions[r.owner].originalCapitalRegionId = r.id;
            }
        }

        this.updateFactionStats();
    }

    getCurrentFaction() {
        const factionId = this.turnOrder[this.currentTurnIndex];
        return this.factions[factionId];
    }

    /**
     * Start of game setup: give starting factions initial income and deploy.
     * Optionally rotates turnOrder so the human player/host's chosen faction plays first.
     */
    startGame(startingFactionId = null) {
        this.winner = null;
        this.turnNumber = 1;
        this.currentPhase = TURN_PHASES.PRODUCTION;

        if (startingFactionId && this.factions[startingFactionId]) {
            const idx = this.turnOrder.indexOf(startingFactionId);
            if (idx !== -1) {
                this.turnOrder = [
                    ...this.turnOrder.slice(idx),
                    ...this.turnOrder.slice(0, idx)
                ];
            }
        }
        this.currentTurnIndex = 0;

        // Calculate initial income for all factions
        for (const fId of this.turnOrder) {
            const income = this.calculateIncome(fId);
            if (this.factions[fId]) {
                this.factions[fId].industryPoints = income;
            }
        }

        const active = this.getCurrentFaction();
        const activeName = this.getFactionDisplayName(active.id);
        this.addLog(`=== 2. DÜNYA SAVAŞI STRATEJİK HAREKATI BAŞLADI ===`);
        this.addLog(`Tur 1: ${activeName} (${active.flagEmoji}) komutası devraldı.`);
    }

    getFactionDisplayName(factionId) {
        return (i18n && i18n.getFactionName) ? i18n.getFactionName(factionId) : (this.factions[factionId]?.nameTr || factionId);
    }

    getRegionDisplayName(regionId) {
        return (i18n && i18n.getRegionName) ? i18n.getRegionName(regionId) : (this.regions[regionId]?.name || regionId);
    }

    calculateIncome(factionId) {
        let total = 0;
        for (const r of Object.values(this.regions)) {
            if (r.owner === factionId) {
                total += (r.industry || 1);
            }
        }
        let income = Math.max(total, 3);
        const f = this.factions[factionId];
        if (f && f.isAI) {
            if (this.aiDifficulty === 'easy') {
                income = Math.max(2, Math.round(income * 0.75));
            } else if (this.aiDifficulty === 'hard') {
                income = Math.ceil(income * 1.25);
            }
        }
        return income;
    }

    updateFactionStats() {
        // Reset counters
        for (const f of Object.values(this.factions)) {
            f.totalUnits = 0;
            f.totalRegions = 0;
        }

        for (const r of Object.values(this.regions)) {
            const f = this.factions[r.owner];
            if (f) {
                f.totalRegions++;
                f.totalUnits += (r.units.infantry + r.units.armor + r.units.air);
            }
        }

        // Check if any playable faction is eliminated
        for (const fId of this.turnOrder) {
            const f = this.factions[fId];
            if (f.totalRegions === 0) {
                f.isEliminated = true;
            }
        }
    }

    /**
     * Deploys newly purchased units to an owned region.
     */
    buyAndDeployUnits(factionId, regionId, unitCounts) {
        const faction = this.factions[factionId];
        const region = this.regions[regionId];

        if (!faction || !region) {
            return { success: false, reason: 'Geçersiz ülke veya bölge.' };
        }

        if (region.owner !== factionId) {
            return { success: false, reason: 'Yalnızca kontrolünüzdeki bölgelere asker yerleştirebilirsiniz.' };
        }

        const infantry = Math.max(0, parseInt(unitCounts.infantry, 10) || 0);
        const armor = Math.max(0, parseInt(unitCounts.armor, 10) || 0);
        const air = Math.max(0, parseInt(unitCounts.air, 10) || 0);

        const totalCost = (infantry * UNIT_TYPES.INFANTRY.cost) +
                          (armor * UNIT_TYPES.ARMOR.cost) +
                          (air * UNIT_TYPES.AIR.cost);

        if (totalCost <= 0) {
            return { success: false, reason: 'En az bir birim seçmelisiniz.' };
        }

        if (faction.industryPoints < totalCost) {
            return { success: false, reason: `Yetersiz Sanayi Puanı! Gereken: ${totalCost} IP, Mevcut: ${faction.industryPoints} IP.` };
        }

        // Deduct cost and add units
        faction.industryPoints -= totalCost;
        region.units.infantry += infantry;
        region.units.armor += armor;
        region.units.air += air;

        this.updateFactionStats();
        const facName = this.getFactionDisplayName(faction.id);
        const regName = this.getRegionDisplayName(region.id);
        this.addLog(`${facName}, ${regName} bölgesine takviye yaptı: +${infantry} Piyade, +${armor} Panzer, +${air} Filo (-${totalCost} IP).`);

        return { success: true, remainingIP: faction.industryPoints };
    }

    /**
     * Checks if an attack is legal
     */
    canAttack(fromRegionId, toRegionId, factionId) {
        const from = this.regions[fromRegionId];
        const to = this.regions[toRegionId];

        if (!from || !to) return { allowed: false, reason: 'Bölge bulunamadı.' };
        if (from.owner !== factionId) return { allowed: false, reason: 'Saldırı başlatılacak bölge size ait değil.' };
        if (to.owner === factionId) return { allowed: false, reason: 'Kendi bölgenize saldıramazsınız.' };
        if (this.isAllied(from.owner, to.owner)) {
            return { allowed: false, reason: 'Müttefikiniz olan bir devlete saldıramazsınız! Önce ittifaktan ayrılmalısınız.' };
        }
        if (this.hasNonAggressionPact(from.owner, to.owner)) {
            return { allowed: false, reason: 'Bu devlet ile yürürlükte aktif bir Saldırmazlık Paktı bulunuyor!' };
        }
        if (!from.neighbors.includes(toRegionId)) return { allowed: false, reason: 'Hedef bölge komşu değil.' };

        const totalAvailableUnits = from.units.infantry + from.units.armor + from.units.air;
        // Must leave at least 1 unit as garrison in origin
        if (totalAvailableUnits <= 1) {
            return { allowed: false, reason: 'Saldırmak için bölgede en az 2 birim bulunmalı (1 birim garnizon kalmalı).' };
        }

        return { allowed: true };
    }

    /**
     * Executes Ground Combat between two regions
     */
    executeAttack(fromRegionId, toRegionId, attackingUnits) {
        const from = this.regions[fromRegionId];
        const to = this.regions[toRegionId];
        const attackerFaction = this.factions[from.owner];
        const defenderFaction = this.factions[to.owner];

        const check = this.canAttack(fromRegionId, toRegionId, from.owner);
        if (!check.allowed) return { success: false, reason: check.reason };

        const inf = Math.max(0, parseInt(attackingUnits.infantry, 10) || 0);
        const arm = Math.max(0, parseInt(attackingUnits.armor, 10) || 0);
        const air = Math.max(0, parseInt(attackingUnits.air, 10) || 0);
        const commitTotal = inf + arm + air;

        if (commitTotal <= 0) {
            return { success: false, reason: 'Taarruz için en az 1 birim tahsis etmelisiniz!' };
        }
        if (inf > from.units.infantry || arm > from.units.armor || air > from.units.air) {
            return { success: false, reason: 'Bölgede seçilen miktarda taarruz birimi bulunmuyor!' };
        }

        // Ensure origin region retains at least 1 unit
        const currentFromTotal = from.units.infantry + from.units.armor + from.units.air;
        if (commitTotal >= currentFromTotal) {
            return { success: false, reason: 'Köken bölgede en az 1 birim garnizon kalmalıdır!' };
        }

        const validUnits = { infantry: inf, armor: arm, air: air };

        // Deduct committed units from origin region temporarily
        from.units.infantry -= inf;
        from.units.armor -= arm;
        from.units.air -= air;

        // Run battle simulation with difficulty & capital occupation debuffs
        const attName = this.getFactionDisplayName(attackerFaction.id);
        const defName = this.getFactionDisplayName(defenderFaction.id);
        const fromName = this.getRegionDisplayName(from.id);
        const toName = this.getRegionDisplayName(to.id);

        const report = CombatEngine.resolveBattle(
            { 
                faction: attackerFaction.id, 
                name: attName, 
                regionName: fromName, 
                isAI: attackerFaction.isAI, 
                difficulty: this.aiDifficulty 
            },
            { 
                faction: defenderFaction.id, 
                name: defName, 
                regionName: toName, 
                terrain: to.terrain, 
                isAI: defenderFaction.isAI, 
                difficulty: this.aiDifficulty,
                capitalOccupied: defenderFaction.capitalOccupiedTurns >= 1
            },
            validUnits,
            to.units
        );

        this.lastCombatReport = report;

        if (report.attackerVictorious) {
            // Defender wiped out: target region captured!
            to.owner = attackerFaction.id;
            to.units = { ...report.survivingAttackerUnits };
            this.addLog(`FETİH: ${attName}, ${toName} bölgesini ele geçirdi!`);

            // Friction / hostility penalty on attack
            this.changeRelation(attackerFaction.id, defenderFaction.id, -25);
        } else {
            // Attack repelled
            if ((report.survivingDefenderUnits.infantry + report.survivingDefenderUnits.armor + report.survivingDefenderUnits.air) <= 0) {
                report.survivingDefenderUnits.infantry = 1;
            }
            to.units = { ...report.survivingDefenderUnits };
            from.units.infantry += report.survivingAttackerUnits.infantry;
            from.units.armor += report.survivingAttackerUnits.armor;
            from.units.air += report.survivingAttackerUnits.air;
            this.addLog(`PÜSKÜRTÜLDÜ: ${defName}, ${toName} savunmasını başarıyla korudu.`);
            this.changeRelation(attackerFaction.id, defenderFaction.id, -15);
        }

        this.updateFactionStats();
        const victory = this.checkVictoryConditions();

        return {
            success: true,
            report,
            conquered: report.attackerVictorious,
            winner: victory
        };
    }

    /**
     * Executes Tactical Air Strike
     */
    executeAirStrike(fromRegionId, toRegionId, airCount) {
        const from = this.regions[fromRegionId];
        const to = this.regions[toRegionId];
        const attackerFaction = this.factions[from.owner];
        const defenderFaction = this.factions[to.owner];

        if (from.owner !== this.getCurrentFaction().id) {
            return { success: false, reason: 'Yalnızca kendi hava üslerinizden sorti düzenleyebilirsiniz.' };
        }
        if (this.isAllied(from.owner, to.owner)) {
            return { success: false, reason: 'Dost veya müttefik bölgeye hava saldırısı yapılamaz.' };
        }
        if (this.hasNonAggressionPact(from.owner, to.owner)) {
            return { success: false, reason: 'Bu devletle aktif Saldırmazlık Paktı bulunuyor.' };
        }
        if (!from.neighbors.includes(toRegionId)) {
            return { success: false, reason: 'Hedef hava sahası menzil dışı (komşu olmalı).' };
        }
        if (from.units.air < airCount || airCount <= 0) {
            return { success: false, reason: 'Bölgede yeterli hava filosu bulunmuyor.' };
        }

        const airResult = CombatEngine.resolveAirStrike(airCount, to);
        to.units = airResult.newUnits;

        const attAirName = this.getFactionDisplayName(attackerFaction.id);
        const toAirName = this.getRegionDisplayName(to.id);
        this.addLog(`HAVA HAREKATI: ${attAirName}, ${toAirName} mevzilerini bombaladı! (${airResult.hits} isabet).`);
        this.changeRelation(attackerFaction.id, defenderFaction.id, -20);
        this.updateFactionStats();

        return {
            success: true,
            airResult
        };
    }

    /**
     * Tactical movement of units between two friendly or allied adjacent regions
     */
    executeMove(fromRegionId, toRegionId, unitsToMove) {
        const from = this.regions[fromRegionId];
        const to = this.regions[toRegionId];
        const faction = this.getCurrentFaction();

        if (!this.isAllied(from.owner, faction.id) || !this.isAllied(to.owner, faction.id)) {
            return { success: false, reason: 'İntikal sadece kendi veya müttefik bölgeleriniz arasında yapılabilir.' };
        }
        if (!from.neighbors.includes(toRegionId)) {
            return { success: false, reason: 'Bölgeler birbirine komşu değil.' };
        }

        const inf = Math.max(0, parseInt(unitsToMove.infantry, 10) || 0);
        const arm = Math.max(0, parseInt(unitsToMove.armor, 10) || 0);
        const air = Math.max(0, parseInt(unitsToMove.air, 10) || 0);

        const totalMove = inf + arm + air;
        const totalFrom = from.units.infantry + from.units.armor + from.units.air;

        if (totalMove <= 0) {
            return { success: false, reason: 'Taşınacak birim seçiniz.' };
        }
        if (totalMove >= totalFrom) {
            return { success: false, reason: 'Bölgede en az 1 garnizon birimi kalmalıdır.' };
        }
        if (inf > from.units.infantry || arm > from.units.armor || air > from.units.air) {
            return { success: false, reason: 'Yetersiz birim.' };
        }

        from.units.infantry -= inf;
        from.units.armor -= arm;
        from.units.air -= air;

        to.units.infantry += inf;
        to.units.armor += arm;
        to.units.air += air;

        const moveFacName = this.getFactionDisplayName(faction.id);
        const moveFromName = this.getRegionDisplayName(from.id);
        const moveToName = this.getRegionDisplayName(to.id);
        this.addLog(`${moveFacName}, ${moveFromName} -> ${moveToName} hattına intikal gerçekleştirdi.`);
        return { success: true };
    }

    /**
     * Progresses phase or advances turn
     */
    nextPhase() {
        if (this.currentPhase === TURN_PHASES.PRODUCTION) {
            this.currentPhase = TURN_PHASES.COMBAT;
            const curFacName = this.getFactionDisplayName(this.getCurrentFaction().id);
            this.addLog(`${curFacName} Askeri Harekat & Saldırı Aşamasına geçti.`);
            return this.currentPhase;
        } else if (this.currentPhase === TURN_PHASES.COMBAT) {
            return this.endTurn();
        }
        return this.currentPhase;
    }

    /**
     * Ends turn and gives control to next player/AI
     */
    endTurn() {
        let attempts = 0;
        do {
            this.currentTurnIndex = (this.currentTurnIndex + 1) % this.turnOrder.length;
            if (this.currentTurnIndex === 0) {
                this.turnNumber++;
                this.addLog(`=== YENİ TUR: ${this.turnNumber} ===`);

                // Decrement non-aggression pact turns
                this.pacts = this.pacts.map(p => ({ ...p, turnsRemaining: p.turnsRemaining - 1 })).filter(p => p.turnsRemaining > 0);
            }
            attempts++;
        } while (this.getCurrentFaction().isEliminated && attempts < this.turnOrder.length);

        if (attempts >= this.turnOrder.length) {
            return this.checkVictoryConditions();
        }

        const nextFaction = this.getCurrentFaction();
        this.currentPhase = TURN_PHASES.PRODUCTION;

        // Check Capital Occupation & Emergency Relocation Mechanics
        if (nextFaction.id !== 'neutral' && nextFaction.capitalRegionId && this.regions[nextFaction.capitalRegionId]) {
            const capReg = this.regions[nextFaction.capitalRegionId];
            if (capReg.owner !== nextFaction.id) {
                nextFaction.capitalOccupiedTurns++;
                const capName = this.getRegionDisplayName(capReg.id);
                const facName = this.getFactionDisplayName(nextFaction.id);
                this.addLog(`⚠️ DİKKAT: ${facName} başkenti (${capName}) DÜŞMAN İŞGALİ ALTINDA (${nextFaction.capitalOccupiedTurns}. Tur)! Savunmada 2x hasar debuff'ı devrede.`);

                // 5 Turns occupation threshold: Relocate capital if >= 3 territories remain
                if (nextFaction.capitalOccupiedTurns >= 5) {
                    const owned = Object.values(this.regions).filter(r => r.owner === nextFaction.id);
                    if (owned.length >= 3) {
                        // Relocate capital to safest high-industry interior province
                        owned.sort((a, b) => (b.industry || 1) - (a.industry || 1));
                        const newCap = owned[0];
                        capReg.capital = false;
                        newCap.capital = true;
                        nextFaction.capitalRegionId = newCap.id;
                        nextFaction.capitalOccupiedTurns = 0;
                        const newCapName = this.getRegionDisplayName(newCap.id);
                        this.addLog(`🏛️ HÜKÜMET VE GENELKURMAY TAHLİYE EDİLDİ: ${facName}, yeni stratejik başkentini ${newCapName} ilan etti! Savunma morali yeniden sağlandı.`);
                    } else {
                        nextFaction.isEliminated = true;
                        this.addLog(`💀 ÇÖKÜŞ & TESLİMİYET: ${facName}, başkentin 5 tur işgali ve topraklarının tükenmesi sonucu teslim oldu.`);
                    }
                }
            } else if (nextFaction.capitalOccupiedTurns > 0) {
                nextFaction.capitalOccupiedTurns = 0;
                const facName = this.getFactionDisplayName(nextFaction.id);
                const capName = this.getRegionDisplayName(capReg.id);
                this.addLog(`🎖️ BAŞKENT KURTARILDI: ${facName}, ${capName} başkentini kurtardı. Savunma morali normale döndü.`);
            }
        }

        // Award income (adjusted for AI difficulty)
        const income = this.calculateIncome(nextFaction.id);
        nextFaction.industryPoints += income;

        const nextFacName = this.getFactionDisplayName(nextFaction.id);
        this.addLog(`Sıra: ${nextFacName} (${nextFaction.flagEmoji}) - Gelir: +${income} IP (Toplam: ${nextFaction.industryPoints} IP).`);

        return this.currentPhase;
    }

    /**
     * Checks if victory conditions are met based on dynamic alliance blocks & dominance
     */
    checkVictoryConditions() {
        const allianceIP = {};
        const allianceMembers = {};
        let totalMapIP = 0;

        for (const r of Object.values(this.regions)) {
            if (r.owner === 'neutral') continue;
            const ip = r.industry || 1;
            totalMapIP += ip;

            const f = this.factions[r.owner];
            const aId = f?.allianceId || r.owner;
            allianceIP[aId] = (allianceIP[aId] || 0) + ip;
            if (!allianceMembers[aId]) allianceMembers[aId] = new Set();
            allianceMembers[aId].add(r.owner);
        }

        // Condition 1: 65% Industrial Hegemony
        for (const [aId, ip] of Object.entries(allianceIP)) {
            if (totalMapIP > 0 && ip / totalMapIP >= 0.65) {
                const memberNames = Array.from(allianceMembers[aId]).map(fId => this.getFactionDisplayName(fId)).join(' & ');
                this.winner = {
                    allianceId: aId,
                    name: memberNames,
                    reason: `Avrupa sanayisinin %${Math.round((ip / totalMapIP) * 100)}'ine hakim olarak mutlak zafer kazanıldı!`
                };
                this.addLog(`🏆 KESİN ZAFER: ${this.winner.name}! ${this.winner.reason}`);
                return this.winner;
            }
        }

        // Condition 2: Elimination of all rival alliances
        const activeAlliances = new Set();
        for (const fId of this.turnOrder) {
            const f = this.factions[fId];
            if (f && !f.isEliminated && fId !== 'neutral') {
                activeAlliances.add(f.allianceId || fId);
            }
        }
        if (activeAlliances.size === 1) {
            const survivingAId = Array.from(activeAlliances)[0];
            const memberNames = Array.from(allianceMembers[survivingAId] || [survivingAId]).map(fId => this.getFactionDisplayName(fId)).join(' & ');
            this.winner = {
                allianceId: survivingAId,
                name: memberNames,
                reason: 'Tüm düşman devletler teslim alındı!'
            };
            this.addLog(`🏆 KESİN ZAFER: ${this.winner.name}! ${this.winner.reason}`);
            return this.winner;
        }

        return null;
    }

    // -------------------------------------------------------------------------
    // DIPLOMACY & ALLIANCE SYSTEM
    // -------------------------------------------------------------------------

    getRelation(f1, f2) {
        if (!f1 || !f2) return 50;
        if (f1 === f2) return 100;
        return this.relations[f1]?.[f2] ?? 50;
    }

    setRelation(f1, f2, score) {
        const clamped = Math.max(-100, Math.min(100, score));
        if (!this.relations[f1]) this.relations[f1] = {};
        if (!this.relations[f2]) this.relations[f2] = {};
        this.relations[f1][f2] = clamped;
        this.relations[f2][f1] = clamped;
    }

    changeRelation(f1, f2, delta) {
        this.setRelation(f1, f2, this.getRelation(f1, f2) + delta);
    }

    isAllied(f1, f2) {
        if (!f1 || !f2) return false;
        if (f1 === f2) return true;
        const a1 = this.factions[f1]?.allianceId || f1;
        const a2 = this.factions[f2]?.allianceId || f2;
        return a1 === a2;
    }

    hasNonAggressionPact(f1, f2) {
        return this.pacts.some(p => 
            ((p.f1 === f1 && p.f2 === f2) || (p.f1 === f2 && p.f2 === f1)) && p.turnsRemaining > 0
        );
    }

    getAllianceAcceptanceChance(fromFId, toFId) {
        if (this.isAllied(fromFId, toFId)) return 100;
        const relation = this.getRelation(fromFId, toFId);
        let chance = relation; // 0-100 base

        const f1 = this.factions[fromFId];
        const f2 = this.factions[toFId];
        if (f1 && f2) {
            if (this.hasNonAggressionPact(fromFId, toFId)) chance += 15;
            if (f2.capitalOccupiedTurns >= 1) chance += 20; // Under duress, seeks allies
        }
        return Math.max(5, Math.min(95, Math.round(chance)));
    }

    proposeAlliance(fromFId, toFId) {
        const fromName = this.getFactionDisplayName(fromFId);
        const toName = this.getFactionDisplayName(toFId);

        if (this.isAllied(fromFId, toFId)) {
            return { success: false, reason: 'Zaten bu devletle ittifak halindesiniz.' };
        }

        const chance = this.getAllianceAcceptanceChance(fromFId, toFId);
        const roll = Math.floor(Math.random() * 100) + 1;

        if (roll <= chance) {
            const targetAllianceId = this.factions[fromFId].allianceId || fromFId;
            this.factions[toFId].allianceId = targetAllianceId;
            this.changeRelation(fromFId, toFId, +25);
            this.addLog(`🤝 DİPLOMATİK İTTİFAK: ${fromName} ve ${toName} ortak askeri savunma paktı imzaladı!`);
            return { success: true, message: `${toName} ittifak teklifinizi kabul etti!` };
        } else {
            this.changeRelation(fromFId, toFId, -5);
            this.addLog(`❌ DİPLOMATİK RED: ${toName}, ${fromName} tarafından iletilen ittifak teklifini reddetti (Kabul Şansı: %${chance}).`);
            return { success: false, reason: `${toName} ittifak teklifini reddetti (Kabul şansı: %${chance}).` };
        }
    }

    leaveAlliance(fId) {
        const f = this.factions[fId];
        if (!f) return { success: false };
        const oldAllianceId = f.allianceId;
        f.allianceId = fId; // Reset to independent

        for (const other of Object.values(this.factions)) {
            if (other.id !== fId && other.allianceId === oldAllianceId) {
                this.changeRelation(fId, other.id, -30);
            }
        }
        const facName = this.getFactionDisplayName(fId);
        this.addLog(`⚡ İTTİFAKTAN AYRILMA: ${facName} ittifaktan tek taraflı olarak ayrıldığını ve bağımsızlığını ilan etti.`);
        return { success: true, message: 'İttifaktan ayrıldınız.' };
    }

    sendDiplomaticAid(fromFId, toFId, amount = 10) {
        const f1 = this.factions[fromFId];
        const f2 = this.factions[toFId];
        if (!f1 || !f2) return { success: false, reason: 'Geçersiz devlet.' };
        if (f1.industryPoints < amount) {
            return { success: false, reason: `Yetersiz Sanayi Puanı! Gereken: ${amount} IP, Mevcut: ${f1.industryPoints} IP.` };
        }
        f1.industryPoints -= amount;
        f2.industryPoints += amount;
        this.changeRelation(fromFId, toFId, +20);

        const f1Name = this.getFactionDisplayName(fromFId);
        const f2Name = this.getFactionDisplayName(toFId);
        this.addLog(`📦 DİPLOMATİK YARDIM: ${f1Name}, ${f2Name} devletine ${amount} IP hibe gönderdi. İlişkiler güçlendi (+20).`);
        return { success: true, message: `${f2Name} devletine ${amount} IP yardım yollandı. İlişki düzeyi arttı!` };
    }

    signNonAggressionPact(fromFId, toFId, duration = 5) {
        if (this.hasNonAggressionPact(fromFId, toFId)) {
            return { success: false, reason: 'Zaten aktif bir Saldırmazlık Paktı bulunuyor.' };
        }
        const chance = this.getAllianceAcceptanceChance(fromFId, toFId) + 15;
        const roll = Math.floor(Math.random() * 100) + 1;

        const f1Name = this.getFactionDisplayName(fromFId);
        const f2Name = this.getFactionDisplayName(toFId);

        if (roll <= chance) {
            this.pacts.push({ f1: fromFId, f2: toFId, turnsRemaining: duration });
            this.changeRelation(fromFId, toFId, +15);
            this.addLog(`📜 SALDIRMAZLIK PAKTI: ${f1Name} ve ${f2Name} ${duration} tur süreli saldırmazlık antlaşması imzaladı.`);
            return { success: true, message: `${f2Name} ile ${duration} turluk Saldırmazlık Paktı imzalandı!` };
        } else {
            return { success: false, reason: `${f2Name} saldırmazlık teklifini geri çevirdi.` };
        }
    }

    addLog(message) {
        const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.actionHistory.unshift(`[${time}] ${message}`);
        if (this.actionHistory.length > 50) {
            this.actionHistory.pop();
        }
    }

    /**
     * Serializes complete state for network synchronization and Save Game
     * Uses compact region state (owner + units) to guarantee high-performance,
     * low-latency WebRTC synchronization without sending static SVG geometry.
     */
    serialize() {
        const compactRegions = {};
        for (const [id, r] of Object.entries(this.regions)) {
            compactRegions[id] = {
                owner: r.owner,
                units: {
                    infantry: r.units?.infantry || 0,
                    armor: r.units?.armor || 0,
                    air: r.units?.air || 0
                }
            };
        }

        return {
            regions: compactRegions,
            factions: this.factions,
            turnOrder: this.turnOrder,
            currentTurnIndex: this.currentTurnIndex,
            currentPhase: this.currentPhase,
            turnNumber: this.turnNumber,
            actionHistory: (this.actionHistory || []).slice(-15),
            winner: this.winner,
            lastCombatReport: this.lastCombatReport
        };
    }

    /**
     * Deserializes received state snapshot
     * Safely updates dynamic properties while keeping static geometry (path, path2d, polygon, neighbors).
     */
    deserialize(data) {
        if (!data || !data.regions || !data.factions) return false;

        // Ensure base regions exist with geometry
        if (!this.regions || Object.keys(this.regions).length === 0) {
            this.initRegions();
        }

        // Merge dynamic region data
        for (const [id, rData] of Object.entries(data.regions)) {
            if (this.regions[id]) {
                if (rData.owner) this.regions[id].owner = rData.owner;
                if (rData.units) {
                    this.regions[id].units = {
                        infantry: rData.units.infantry || 0,
                        armor: rData.units.armor || 0,
                        air: rData.units.air || 0
                    };
                }
            } else {
                this.regions[id] = rData;
            }
        }

        this.factions = data.factions;
        this.turnOrder = data.turnOrder;
        this.currentTurnIndex = data.currentTurnIndex;
        this.currentPhase = data.currentPhase;
        this.turnNumber = data.turnNumber;
        this.actionHistory = data.actionHistory || [];
        this.winner = data.winner;
        this.lastCombatReport = data.lastCombatReport;
        this.updateFactionStats();
        return true;
    }

    /**
     * Save game to browser localStorage
     */
    saveToLocalStorage(slot = 'ww2_grand_strategy_save') {
        try {
            const data = this.serialize();
            localStorage.setItem(slot, JSON.stringify(data));
            this.addLog('Oyun yerel hafızaya (localStorage) kaydedildi.');
            return true;
        } catch (err) {
            console.error('Save failed', err);
            return false;
        }
    }

    /**
     * Load game from browser localStorage
     */
    loadFromLocalStorage(slot = 'ww2_grand_strategy_save') {
        try {
            const saved = localStorage.getItem(slot);
            if (!saved) return false;
            const data = JSON.parse(saved);
            const success = this.deserialize(data);
            if (success) {
                this.addLog('Kayıtlı oyun başarıyla yüklendi.');
            }
            return success;
        } catch (err) {
            console.error('Load failed', err);
            return false;
        }
    }
}
