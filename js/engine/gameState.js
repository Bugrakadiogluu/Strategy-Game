/**
 * gameState.js - Central Authoritative State Management
 * Single source of truth for territories, faction economies,
 * turn cycling, player assignment, victory conditions, and serialization.
 */

import { INITIAL_REGIONS, MAP_DIMENSIONS } from './mapData.js';
import { FACTIONS, UNIT_TYPES, TURN_PHASES } from '../network/protocol.js';
import { CombatEngine } from './combat.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.regions = {};
        this.factions = {};
        this.turnOrder = ['germany', 'uk', 'ussr', 'italy'];
        this.currentTurnIndex = 0;
        this.currentPhase = TURN_PHASES.PRODUCTION;
        this.turnNumber = 1;
        this.actionHistory = [];
        this.winner = null;
        this.lastCombatReport = null;
        this.dimensions = MAP_DIMENSIONS;

        this.initFactions();
        this.initRegions();
    }

    initFactions() {
        for (const [key, f] of Object.entries(FACTIONS)) {
            this.factions[f.id] = {
                ...f,
                industryPoints: 0,
                isEliminated: false,
                isAI: true,          // Otomatik bilgisayar komutasi
                playerId: null,
                totalUnits: 0,
                totalRegions: 0
            };
        }
    }

    initRegions() {
        for (const r of INITIAL_REGIONS) {
            this.regions[r.id] = {
                id: r.id,
                name: r.name,
                owner: r.owner,
                terrain: r.terrain,
                industry: r.industry,
                capital: r.capital,
                x: r.x,
                y: r.y,
                path: r.path,
                polygon: r.polygon ? JSON.parse(JSON.stringify(r.polygon)) : null,
                neighbors: [...r.neighbors],
                units: {
                    infantry: r.initialUnits.infantry || 0,
                    armor: r.initialUnits.armor || 0,
                    air: r.initialUnits.air || 0
                }
            };
        }
        this.updateFactionStats();
    }

    getCurrentFaction() {
        const factionId = this.turnOrder[this.currentTurnIndex];
        return this.factions[factionId];
    }

    /**
     * Start of game setup: give starting factions initial income and deploy
     */
    startGame() {
        this.winner = null;
        this.turnNumber = 1;
        this.currentTurnIndex = 0;
        this.currentPhase = TURN_PHASES.PRODUCTION;

        // Calculate initial income for all factions
        for (const fId of this.turnOrder) {
            const income = this.calculateIncome(fId);
            this.factions[fId].industryPoints = income;
        }

        const active = this.getCurrentFaction();
        this.addLog(`=== 2. DÜNYA SAVAŞI STRATEJİK HAREKATI BAŞLADI ===`);
        this.addLog(`Tur 1: ${active.nameTr} (${active.flagEmoji}) komutası devraldı.`);
    }

    calculateIncome(factionId) {
        let total = 0;
        for (const r of Object.values(this.regions)) {
            if (r.owner === factionId) {
                total += (r.industry || 1);
            }
        }
        // Baseline minimum income so even battered nations can recruit basic infantry
        return Math.max(total, 3);
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
        this.addLog(`${faction.nameTr}, ${region.name} bölgesine takviye yaptı: +${infantry} Piyade, +${armor} Panzer, +${air} Filo (-${totalCost} IP).`);

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

        // Ensure origin region retains at least 1 unit
        const currentFromTotal = from.units.infantry + from.units.armor + from.units.air;
        const commitTotal = attackingUnits.infantry + attackingUnits.armor + attackingUnits.air;

        if (commitTotal >= currentFromTotal) {
            return { success: false, reason: 'Köken bölgede en az 1 birim garnizon kalmalıdır!' };
        }

        // Deduct committed units from origin region temporarily
        from.units.infantry -= attackingUnits.infantry;
        from.units.armor -= attackingUnits.armor;
        from.units.air -= attackingUnits.air;

        // Run battle simulation
        const report = CombatEngine.resolveBattle(
            { faction: attackerFaction.id, name: attackerFaction.nameTr, regionName: from.name },
            { faction: defenderFaction.id, name: defenderFaction.nameTr, regionName: to.name, terrain: to.terrain },
            attackingUnits,
            to.units
        );

        this.lastCombatReport = report;

        if (report.attackerVictorious) {
            // Defender wiped out: target region captured!
            to.owner = attackerFaction.id;
            to.units = { ...report.survivingAttackerUnits };
            this.addLog(`🚩 FETİH: ${attackerFaction.nameTr}, ${to.name} bölgesini ele geçirdi!`);
        } else {
            // Attack repelled: surviving defenders remain, surviving attackers return to origin
            to.units = { ...report.survivingDefenderUnits };
            from.units.infantry += report.survivingAttackerUnits.infantry;
            from.units.armor += report.survivingAttackerUnits.armor;
            from.units.air += report.survivingAttackerUnits.air;
            this.addLog(`🛡️ PÜSKÜRTÜLDÜ: ${defenderFaction.nameTr}, ${to.name} savunmasını başarıyla korudu.`);
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
        if (to.owner === from.owner) {
            return { success: false, reason: 'Dost bölgeye hava saldırısı yapılamaz.' };
        }
        if (!from.neighbors.includes(toRegionId)) {
            return { success: false, reason: 'Hedef hava sahası menzil dışı (komşu olmalı).' };
        }
        if (from.units.air < airCount || airCount <= 0) {
            return { success: false, reason: 'Bölgede yeterli hava filosu bulunmuyor.' };
        }

        const airResult = CombatEngine.resolveAirStrike(airCount, to);
        to.units = airResult.newUnits;

        this.addLog(`✈️ HAVA HAREKATI: ${attackerFaction.nameTr}, ${to.name} mevzilerini bombaladı! (${airResult.hits} isabet).`);
        this.updateFactionStats();

        return {
            success: true,
            airResult
        };
    }

    /**
     * Tactical movement of units between two friendly adjacent regions
     */
    executeMove(fromRegionId, toRegionId, unitsToMove) {
        const from = this.regions[fromRegionId];
        const to = this.regions[toRegionId];
        const faction = this.getCurrentFaction();

        if (from.owner !== faction.id || to.owner !== faction.id) {
            return { success: false, reason: 'İntikal sadece kendi bölgeleriniz arasında yapılabilir.' };
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

        this.addLog(`${faction.nameTr}, ${from.name} -> ${to.name} hattına intikal gerçekleştirdi.`);
        return { success: true };
    }

    /**
     * Progresses phase or advances turn
     */
    nextPhase() {
        if (this.currentPhase === TURN_PHASES.PRODUCTION) {
            this.currentPhase = TURN_PHASES.COMBAT;
            this.addLog(`${this.getCurrentFaction().nameTr} Askeri Harekat & Saldırı Aşamasına geçti.`);
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
            }
            attempts++;
        } while (this.getCurrentFaction().isEliminated && attempts < this.turnOrder.length);

        if (attempts >= this.turnOrder.length) {
            return this.checkVictoryConditions();
        }

        const nextFaction = this.getCurrentFaction();
        this.currentPhase = TURN_PHASES.PRODUCTION;

        // Award income
        const income = this.calculateIncome(nextFaction.id);
        nextFaction.industryPoints += income;

        this.addLog(`Sıra: ${nextFaction.nameTr} (${nextFaction.flagEmoji}) - Gelir: +${income} IP (Toplam: ${nextFaction.industryPoints} IP).`);

        return this.currentPhase;
    }

    /**
     * Checks if victory conditions are met
     */
    checkVictoryConditions() {
        const berlinOwner = this.regions['berlin'] ? this.regions['berlin'].owner : null;
        const romeOwner = this.regions['rome'] ? this.regions['rome'].owner : null;
        const londonOwner = this.regions['london'] ? this.regions['london'].owner : null;
        const moscowOwner = this.regions['moscow'] ? this.regions['moscow'].owner : null;

        // Condition 1: Capital Conquest
        // Allies conquer Berlin and Rome
        const alliesConqueredAxis = (berlinOwner === 'uk' || berlinOwner === 'ussr') &&
                                   (romeOwner === 'uk' || romeOwner === 'ussr');
        if (alliesConqueredAxis) {
            this.winner = {
                alliance: 'allies',
                name: 'Müttefik Devletler (Allies)',
                reason: 'Berlin ve Roma başkentleri ele geçirilerek Mihver teslim alındı!'
            };
            this.addLog(`🏆 KESİN ZAFER: ${this.winner.name} kazandı! ${this.winner.reason}`);
            return this.winner;
        }

        // Axis conquers London and Moscow
        const axisConqueredAllies = (londonOwner === 'germany' || londonOwner === 'italy') &&
                                   (moscowOwner === 'germany' || moscowOwner === 'italy');
        if (axisConqueredAllies) {
            this.winner = {
                alliance: 'axis',
                name: 'Mihver Devletleri (Axis)',
                reason: 'Londra ve Moskova başkentleri ele geçirilerek Müttefikler dize getirildi!'
            };
            this.addLog(`🏆 KESİN ZAFER: ${this.winner.name} kazandı! ${this.winner.reason}`);
            return this.winner;
        }

        // Condition 2: 70% Territorial/Industrial Dominance
        let totalMapIP = 0;
        let axisIP = 0;
        let alliesIP = 0;

        for (const r of Object.values(this.regions)) {
            const ip = r.industry || 1;
            totalMapIP += ip;
            if (r.owner === 'germany' || r.owner === 'italy') {
                axisIP += ip;
            } else if (r.owner === 'uk' || r.owner === 'ussr') {
                alliesIP += ip;
            }
        }

        if (axisIP / totalMapIP >= 0.70) {
            this.winner = {
                alliance: 'axis',
                name: 'Mihver Devletleri (Axis)',
                reason: `Avrupa sanayisinin %${Math.round((axisIP/totalMapIP)*100)}'ü kontrol altına alındı!`
            };
            this.addLog(`🏆 KESİN ZAFER: ${this.winner.name} kazandı!`);
            return this.winner;
        }

        if (alliesIP / totalMapIP >= 0.70) {
            this.winner = {
                alliance: 'allies',
                name: 'Müttefik Devletler (Allies)',
                reason: `Avrupa sanayisinin %${Math.round((alliesIP/totalMapIP)*100)}'i kontrol altına alındı!`
            };
            this.addLog(`🏆 KESİN ZAFER: ${this.winner.name} kazandı!`);
            return this.winner;
        }

        return null;
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
     */
    serialize() {
        return {
            regions: this.regions,
            factions: this.factions,
            turnOrder: this.turnOrder,
            currentTurnIndex: this.currentTurnIndex,
            currentPhase: this.currentPhase,
            turnNumber: this.turnNumber,
            actionHistory: this.actionHistory,
            winner: this.winner,
            lastCombatReport: this.lastCombatReport
        };
    }

    /**
     * Deserializes received state snapshot
     */
    deserialize(data) {
        if (!data || !data.regions || !data.factions) return false;
        this.regions = data.regions;
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
            this.addLog('💾 Oyun yerel hafızaya (localStorage) kaydedildi.');
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
                this.addLog('📂 Kayıtlı oyun başarıyla yüklendi.');
            }
            return success;
        } catch (err) {
            console.error('Load failed', err);
            return false;
        }
    }
}
