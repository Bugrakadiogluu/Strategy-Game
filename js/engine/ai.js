/**
 * ai.js - Strategic Commander Logic for Axis & Allied Factions
 * Evaluates frontline threats, economy, unit recruitment, air strikes,
 * and launches calculated spearhead assaults against weaker enemy neighbors.
 */

import { UNIT_TYPES, TURN_PHASES } from '../network/protocol.js';

export class StrategicAI {
    /**
     * Executes the turn for automated factions with realistic tactical timing.
     *
     * @param {GameState} gameState
     * @param {Function} notifyStep Callback invoked on each tactical action
     * @param {number} stepDelayMs Delay between tactical actions in milliseconds
     */
    static async playTurn(gameState, notifyStep = () => {}, stepDelayMs = 700) {
        const currentFaction = gameState.getCurrentFaction();
        if (!currentFaction || !currentFaction.isAI || currentFaction.isEliminated) {
            return;
        }

        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // ----------------------------------------------------
        // 1. REINFORCEMENT & PRODUCTION PHASE
        // ----------------------------------------------------
        await wait(stepDelayMs);
        this._executeAIProduction(gameState, currentFaction, notifyStep);

        // Transition from Production to Combat Phase
        await wait(stepDelayMs);
        gameState.nextPhase();
        notifyStep({ type: 'PHASE_CHANGE', phase: gameState.currentPhase });

        // ----------------------------------------------------
        // 2. TACTICAL COMBAT & ATTACK PHASE
        // ----------------------------------------------------
        await wait(stepDelayMs);
        await this._executeAICombat(gameState, currentFaction, notifyStep, wait, stepDelayMs);

        // ----------------------------------------------------
        // 3. END TURN PHASE
        // ----------------------------------------------------
        await wait(stepDelayMs);
        gameState.endTurn();
        notifyStep({ type: 'TURN_ENDED', faction: currentFaction });
    }

    /**
     * Spends available Industry Points (IP) on strategic frontline regions.
     */
    static _executeAIProduction(gameState, faction, notifyStep) {
        let ip = faction.industryPoints;
        if (ip < UNIT_TYPES.INFANTRY.cost) return;

        // Find all regions owned by this faction
        const ownedRegions = Object.values(gameState.regions).filter(r => r.owner === faction.id);
        if (ownedRegions.length === 0) return;

        // Categorize regions: frontline regions (adjacent to enemy or neutral) vs safe rear
        const frontlineRegions = ownedRegions.filter(r => {
            return r.neighbors.some(nId => {
                const neighbor = gameState.regions[nId];
                return neighbor && neighbor.owner !== faction.id;
            });
        });

        // Target regions: prioritize capitals and frontlines
        const priorityRegions = frontlineRegions.length > 0 ? frontlineRegions : ownedRegions;

        // Sort by strategic importance: capitals first, then lower garrisoned borders
        priorityRegions.sort((a, b) => {
            if (a.capital && !b.capital) return -1;
            if (!a.capital && b.capital) return 1;
            const aUnits = a.units.infantry + a.units.armor;
            const bUnits = b.units.infantry + b.units.armor;
            return aUnits - bUnits; // reinforce weaker borders first
        });

        let targetIndex = 0;
        while (ip >= UNIT_TYPES.INFANTRY.cost && priorityRegions.length > 0) {
            const targetRegion = priorityRegions[targetIndex % priorityRegions.length];
            let unitsToBuy = { infantry: 0, armor: 0, air: 0 };

            // If wealthy (IP >= 14) and target is capital/frontline, buy Air Wing or Armor
            if (ip >= UNIT_TYPES.AIR.cost && Math.random() > 0.6) {
                unitsToBuy.air = 1;
            } else if (ip >= UNIT_TYPES.ARMOR.cost && Math.random() > 0.4) {
                unitsToBuy.armor = 1;
            } else if (ip >= UNIT_TYPES.INFANTRY.cost) {
                // Buy 1-2 infantries
                const infCount = Math.min(2, Math.floor(ip / UNIT_TYPES.INFANTRY.cost));
                unitsToBuy.infantry = infCount;
            }

            const res = gameState.buyAndDeployUnits(faction.id, targetRegion.id, unitsToBuy);
            if (res.success) {
                ip = res.remainingIP;
                notifyStep({
                    type: 'AI_DEPLOY',
                    faction: faction.id,
                    regionId: targetRegion.id,
                    units: unitsToBuy
                });
            } else {
                break;
            }

            targetIndex++;
            if (targetIndex > 20) break; // safety break
        }
    }

    /**
     * Evaluates enemy neighbors and launches attacks where victory odds are high.
     */
    static async _executeAICombat(gameState, faction, notifyStep, wait, stepDelayMs) {
        let maxAttacks = 3; // AI limits attacks per turn to prevent overextension
        let attackCount = 0;

        while (attackCount < maxAttacks) {
            const bestOpportunity = this._findBestAttackTarget(gameState, faction);
            if (!bestOpportunity) {
                break; // No favorable attacks found
            }

            const { fromRegion, toRegion, attackingUnits, oddsRatio } = bestOpportunity;

            // Optional Air Strike: If attacker has air support, soften target before ground assault
            if (fromRegion.units.air > 0 && Math.random() > 0.3) {
                const airResult = gameState.executeAirStrike(fromRegion.id, toRegion.id, 1);
                if (airResult.success) {
                    notifyStep({
                        type: 'AI_AIR_STRIKE',
                        from: fromRegion.id,
                        to: toRegion.id,
                        hits: airResult.airResult.hits
                    });
                    await wait(stepDelayMs);
                }
            }

            // Launch Ground Assault
            const result = gameState.executeAttack(fromRegion.id, toRegion.id, attackingUnits);
            if (result.success) {
                attackCount++;
                notifyStep({
                    type: 'AI_ATTACK',
                    from: fromRegion.id,
                    to: toRegion.id,
                    attackingUnits,
                    report: result.report,
                    conquered: result.conquered
                });
                await wait(stepDelayMs);

                if (result.winner) {
                    break;
                }
            } else {
                break;
            }
        }
    }

    /**
     * Scans all AI regions and finds the most advantageous attack match-up.
     */
    static _findBestAttackTarget(gameState, faction) {
        let bestTarget = null;
        let highestScore = -Infinity;

        const ownedRegions = Object.values(gameState.regions).filter(r => r.owner === faction.id);

        for (const from of ownedRegions) {
            const totalAvailable = from.units.infantry + from.units.armor + from.units.air;
            if (totalAvailable <= 1) continue; // must leave at least 1 unit behind

            for (const neighborId of from.neighbors) {
                const to = gameState.regions[neighborId];
                if (!to || to.owner === faction.id || to.owner === 'neutral') continue; // skip friendly & neutral buffer

                // Skip attacking allies in the same coalition
                const axisFactions = ['germany', 'italy', 'spain'];
                const alliedFactions = ['uk', 'ussr', 'france', 'turkey'];
                const isSameAlliance = (axisFactions.includes(faction.id) && axisFactions.includes(to.owner)) ||
                                       (alliedFactions.includes(faction.id) && alliedFactions.includes(to.owner));
                if (isSameAlliance) continue;

                // Calculate Attacking Power
                // Reserve 1 infantry or 1 armor for home garrison
                let committableInfantry = from.units.infantry;
                let committableArmor = from.units.armor;
                let committableAir = from.units.air;

                if (committableInfantry > 0) committableInfantry--;
                else if (committableArmor > 0) committableArmor--;

                const attPower = (committableInfantry * 2) + (committableArmor * 5) + (committableAir * 4);
                if (attPower <= 0) continue;

                // Calculate Defending Power
                let defTerrainMult = 1.0;
                if (to.terrain === 'city') defTerrainMult = 1.25;
                if (to.terrain === 'mountains') defTerrainMult = 1.40;

                const defPower = ((to.units.infantry * 3) + (to.units.armor * 3) + (to.units.air * 2)) * defTerrainMult;

                // Odds Ratio
                const oddsRatio = defPower === 0 ? 99 : (attPower / defPower);

                // We only attack if odds ratio is favorable (> 1.25)
                if (oddsRatio >= 1.25) {
                    // Strategic bonus score for capitals or high industry
                    let strategicWeight = to.industry * 2;
                    if (to.capital) strategicWeight += 15;

                    const totalScore = oddsRatio * 5 + strategicWeight;
                    if (totalScore > highestScore) {
                        highestScore = totalScore;
                        bestTarget = {
                            fromRegion: from,
                            toRegion: to,
                            attackingUnits: {
                                infantry: committableInfantry,
                                armor: committableArmor,
                                air: committableAir
                            },
                            oddsRatio
                        };
                    }
                }
            }
        }

        return bestTarget;
    }
}
