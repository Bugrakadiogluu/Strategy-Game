/**
 * combat.js - Deterministic & Probabilistic WW2 Combat Engine
 * Simulates tactical battles with dice rolls, terrain defense bonuses,
 * armor blitzkrieg advantages/penalties, air strikes, and casualty calculations.
 */

import { UNIT_TYPES, TERRAIN_TYPES } from '../network/protocol.js';

export class CombatEngine {
    /**
     * Executes a tactical air strike against an enemy region before ground assault.
     * Air strikes bypass terrain ground defense, inflicting precision damage.
     */
    static resolveAirStrike(airCount, targetRegion) {
        if (!airCount || airCount <= 0) {
            return { hits: 0, casualties: { infantry: 0, armor: 0, air: 0 }, log: [] };
        }

        const log = [];
        let hits = 0;
        const diceRolls = [];

        for (let i = 0; i < airCount; i++) {
            const roll = Math.floor(Math.random() * 6) + 1;
            diceRolls.push(roll);
            // Air strikes score a hit on 4, 5, 6
            if (roll >= 4) {
                hits++;
            }
        }

        log.push(`${airCount} Hava Filosu bombardıman sortisi yaptı (Zarlar: [${diceRolls.join(', ')}]) - Toplam İsabet: ${hits}`);

        // Apply hits to target region units
        const casualties = { infantry: 0, armor: 0, air: 0 };
        let remainingHits = hits;

        const currentUnits = { ...targetRegion.units };

        // Infantry absorbs air blast first, then armor, then parked aircraft
        while (remainingHits > 0 && (currentUnits.infantry > 0 || currentUnits.armor > 0 || currentUnits.air > 0)) {
            if (currentUnits.infantry > 0) {
                currentUnits.infantry--;
                casualties.infantry++;
            } else if (currentUnits.armor > 0) {
                currentUnits.armor--;
                casualties.armor++;
            } else if (currentUnits.air > 0) {
                currentUnits.air--;
                casualties.air++;
            }
            remainingHits--;
        }

        if (hits > 0) {
            log.push(`Hava bombardımanı sonucu: ${casualties.infantry} Piyade, ${casualties.armor} Panzer, ${casualties.air} Uçak imha edildi.`);
        } else {
            log.push('Bombardıman hedefleri ıskaladı, savunma tahkimatı hasar almadı.');
        }

        return {
            hits,
            casualties,
            newUnits: currentUnits,
            log
        };
    }

    /**
     * Resolves a full ground battle between attacker and defender.
     *
     * @param {Object} attackerInfo { faction, name, regionName }
     * @param {Object} defenderInfo { faction, name, regionName, terrain }
     * @param {Object} attackingUnits { infantry, armor, air }
     * @param {Object} defendingUnits { infantry, armor, air }
     * @returns {Object} Combat report with battle rounds, total losses, and victor.
     */
    static resolveBattle(attackerInfo, defenderInfo, attackingUnits, defendingUnits) {
        const terrain = TERRAIN_TYPES[defenderInfo.terrain.toUpperCase()] || TERRAIN_TYPES.PLAINS;
        
        let attUnits = { ...attackingUnits };
        let defUnits = { ...defendingUnits };

        const totalAttackerInitial = (attUnits.infantry || 0) + (attUnits.armor || 0) + (attUnits.air || 0);
        const totalDefenderInitial = (defUnits.infantry || 0) + (defUnits.armor || 0) + (defUnits.air || 0);

        const rounds = [];
        const battleLog = [];

        battleLog.push(`=== MUHAREBE RAPORU: ${defenderInfo.regionName.toUpperCase()} ===`);
        battleLog.push(`Taarruz: ${attackerInfo.name} (${totalAttackerInitial} birlik)`);
        battleLog.push(`Savunma: ${defenderInfo.name} (${totalDefenderInitial} birlik) | Arazi: ${terrain.name}`);

        let roundNumber = 1;
        const maxRounds = 8; // prevent infinite loops, though battle terminates naturally

        while (roundNumber <= maxRounds) {
            const attCount = attUnits.infantry + attUnits.armor + attUnits.air;
            const defCount = defUnits.infantry + defUnits.armor + defUnits.air;

            if (attCount <= 0 || defCount <= 0) break;

            // --- ATTACKER FIRE ---
            let attHits = 0;
            const attRolls = [];

            // Infantry: hits on 4+ (50% chance)
            for (let i = 0; i < attUnits.infantry; i++) {
                const roll = Math.floor(Math.random() * 6) + 1;
                attRolls.push({ unit: 'infantry', roll });
                if (roll >= 4) attHits++;
            }

            // Armor: hits on 3+ (66% chance) + terrain modifier
            for (let i = 0; i < attUnits.armor; i++) {
                const roll = Math.floor(Math.random() * 6) + 1;
                attRolls.push({ unit: 'armor', roll });
                // If terrain is mountains, armor is hindered (needs 4+)
                // If terrain is desert, armor excels (needs 2+)
                let threshold = 3;
                if (terrain.armorAttackBonus < 0) threshold = 4;
                if (terrain.armorAttackBonus > 0.15) threshold = 2;

                if (roll >= threshold) attHits++;
            }

            // Air support: hits on 3+
            for (let i = 0; i < attUnits.air; i++) {
                const roll = Math.floor(Math.random() * 6) + 1;
                attRolls.push({ unit: 'air', roll });
                if (roll >= 3) attHits++;
            }

            // --- DEFENDER RETURN FIRE ---
            let defHits = 0;
            const defRolls = [];

            // Defender infantry: fortified, hits on 3+ (city/mountain hits on 2+)
            let infDefThreshold = 3;
            if (terrain.defenseBonus >= 0.25) infDefThreshold = 2;

            for (let i = 0; i < defUnits.infantry; i++) {
                const roll = Math.floor(Math.random() * 6) + 1;
                defRolls.push({ unit: 'infantry', roll });
                if (roll >= infDefThreshold) defHits++;
            }

            // Defender armor: hits on 3+
            for (let i = 0; i < defUnits.armor; i++) {
                const roll = Math.floor(Math.random() * 6) + 1;
                defRolls.push({ unit: 'armor', roll });
                if (roll >= 3) defHits++;
            }

            // Defender air: hits on 4+
            for (let i = 0; i < defUnits.air; i++) {
                const roll = Math.floor(Math.random() * 6) + 1;
                defRolls.push({ unit: 'air', roll });
                if (roll >= 4) defHits++;
            }

            // Casualties applied simultaneously
            const roundAttLosses = this._distributeCasualties(attUnits, defHits);
            const roundDefLosses = this._distributeCasualties(defUnits, attHits);

            rounds.push({
                round: roundNumber,
                attackerHits: attHits,
                defenderHits: defHits,
                attackerLosses: roundAttLosses,
                defenderLosses: roundDefLosses,
                attackerRemaining: { ...attUnits },
                defenderRemaining: { ...defUnits }
            });

            battleLog.push(`[Tur ${roundNumber}] Taarruz İsabeti: ${attHits} (Kayıp verdirildi: ${roundDefLosses.infantry + roundDefLosses.armor + roundDefLosses.air}) | Karşı Ateş: ${defHits} (Taarruz Kaybı: ${roundAttLosses.infantry + roundAttLosses.armor + roundAttLosses.air})`);

            roundNumber++;
        }

        const defenderWipedOut = (defUnits.infantry + defUnits.armor + defUnits.air) === 0;
        const attackerVictorious = defenderWipedOut && (attUnits.infantry + attUnits.armor + attUnits.air) > 0;

        const totalAttLosses = {
            infantry: attackingUnits.infantry - attUnits.infantry,
            armor: attackingUnits.armor - attUnits.armor,
            air: attackingUnits.air - attUnits.air
        };

        const totalDefLosses = {
            infantry: defendingUnits.infantry - defUnits.infantry,
            armor: defendingUnits.armor - defUnits.armor,
            air: defendingUnits.air - defUnits.air
        };

        if (attackerVictorious) {
            battleLog.push(`>>> ZAFER! ${defenderInfo.regionName} bölgesi ${attackerInfo.name} orduları tarafından ele geçirildi!`);
        } else {
            battleLog.push(`>>> TAARRUZ PÜSKÜRTÜLDÜ! Savunan kuvvetler mevzilerini korudu.`);
        }

        return {
            attackerVictorious,
            attackerInfo,
            defenderInfo,
            terrain,
            rounds,
            battleLog,
            survivingAttackerUnits: attUnits,
            survivingDefenderUnits: defUnits,
            attackerLosses: totalAttLosses,
            defenderLosses: totalDefLosses
        };
    }

    /**
     * Helper to allocate incoming casualties to a unit pool.
     * Infantry takes hits first, followed by armor, then air support.
     */
    static _distributeCasualties(unitPool, incomingHits) {
        const losses = { infantry: 0, armor: 0, air: 0 };
        let hits = incomingHits;

        while (hits > 0 && (unitPool.infantry > 0 || unitPool.armor > 0 || unitPool.air > 0)) {
            if (unitPool.infantry > 0) {
                unitPool.infantry--;
                losses.infantry++;
            } else if (unitPool.armor > 0) {
                unitPool.armor--;
                losses.armor++;
            } else if (unitPool.air > 0) {
                unitPool.air--;
                losses.air++;
            }
            hits--;
        }

        return losses;
    }
}
