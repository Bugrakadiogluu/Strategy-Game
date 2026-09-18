/**
 * hud.js - Military Command Center Head-Up Display (HUD)
 * Manages side command tabs (Production, Combat, Maneuver, Intelligence, Radio/Log),
 * combat resolution modals, lobby interfaces, notifications, and game stats.
 */

import { FACTIONS, UNIT_TYPES, TERRAIN_TYPES, TURN_PHASES } from '../network/protocol.js';
import { i18n } from '../i18n/translations.js';
import { ICONS, getFactionInsignia } from './icons.js';

export class HUD {
    constructor(gameState, soundEngine) {
        this.gameState = gameState;
        this.sound = soundEngine;

        // HUD Callback hooks connected by app.js
        this.onDeployRequested = () => {};
        this.onAttackRequested = () => {};
        this.onAirStrikeRequested = () => {};
        this.onMoveRequested = () => {};
        this.onPhaseAdvanceRequested = () => {};
        this.onSaveGameRequested = () => {};
        this.onLoadGameRequested = () => {};
        this.onSendChatRequested = () => {};
        this.onProposeAlliance = () => {};
        this.onLeaveAlliance = () => {};
        this.onSignPact = () => {};
        this.onSendAid = () => {};

        this.activeTab = 'tab-production';
        this.selectedOriginId = null;
        this.selectedTargetId = null;

        this._bindUI();
    }

    _bindUI() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.cmd-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.sound.playClick();
                const tabId = btn.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Top Bar Buttons
        const btnNextPhase = document.getElementById('btn-next-phase');
        if (btnNextPhase) {
            btnNextPhase.addEventListener('click', () => {
                this.sound.playClick();
                this.onPhaseAdvanceRequested();
            });
        }

        const btnSoundToggle = document.getElementById('btn-sound-toggle');
        if (btnSoundToggle) {
            btnSoundToggle.addEventListener('click', () => {
                const muted = this.sound.toggleMute();
                btnSoundToggle.innerHTML = muted ? i18n.t('btn_sound_off') : i18n.t('btn_sound_on');
                btnSoundToggle.classList.toggle('active', !muted);
            });
        }

        const btnSaveGame = document.getElementById('btn-save-game');
        if (btnSaveGame) {
            btnSaveGame.addEventListener('click', () => {
                this.sound.playClick();
                this.onSaveGameRequested();
            });
        }

        const btnLoadGame = document.getElementById('btn-load-game');
        if (btnLoadGame) {
            btnLoadGame.addEventListener('click', () => {
                this.sound.playClick();
                this.onLoadGameRequested();
            });
        }

        const btnCopyCode = document.getElementById('btn-copy-room-code');
        if (btnCopyCode) {
            btnCopyCode.addEventListener('click', () => {
                this.sound.playClick();
                const code = document.getElementById('hud-room-code')?.textContent || '';
                navigator.clipboard.writeText(code).then(() => {
                    this.showToast(`${i18n.t('room_copied')} ${code}`, 'success');
                }).catch(() => {
                    this.showToast(`${i18n.t('btn_room_prefix')} ${code}`, 'info');
                });
            });
        }

        // Production Buttons
        this._bindProductionControls();

        // Combat Controls
        this._bindCombatControls();

        // Movement Controls
        this._bindMovementControls();

        // Chat Input
        const chatInput = document.getElementById('chat-input');
        const chatBtn = document.getElementById('btn-send-chat');
        if (chatBtn && chatInput) {
            const sendChat = () => {
                const text = chatInput.value.trim();
                if (text) {
                    this.sound.playRadioBeep();
                    this.onSendChatRequested(text);
                    chatInput.value = '';
                }
            };
            chatBtn.addEventListener('click', sendChat);
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') sendChat();
            });
        }
    }

    switchTab(tabId) {
        this.activeTab = tabId;
        document.querySelectorAll('.cmd-tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === tabId);
        });
        document.querySelectorAll('.cmd-tab-content').forEach(c => {
            c.classList.toggle('active', c.id === tabId);
        });
    }

    _bindProductionControls() {
        const setupStepper = (minusId, plusId, inputId, costPerUnit) => {
            const minus = document.getElementById(minusId);
            const plus = document.getElementById(plusId);
            const input = document.getElementById(inputId);

            if (!minus || !plus || !input) return;

            minus.addEventListener('click', () => {
                this.sound.playClick();
                input.value = Math.max(0, (parseInt(input.value, 10) || 0) - 1);
                this.updateProductionCost();
            });

            plus.addEventListener('click', () => {
                this.sound.playClick();
                input.value = (parseInt(input.value, 10) || 0) + 1;
                this.updateProductionCost();
            });

            input.addEventListener('change', () => this.updateProductionCost());
        };

        setupStepper('btn-prod-inf-minus', 'btn-prod-inf-plus', 'input-prod-inf', UNIT_TYPES.INFANTRY.cost);
        setupStepper('btn-prod-arm-minus', 'btn-prod-arm-plus', 'input-prod-arm', UNIT_TYPES.ARMOR.cost);
        setupStepper('btn-prod-air-minus', 'btn-prod-air-plus', 'input-prod-air', UNIT_TYPES.AIR.cost);

        const btnDeploy = document.getElementById('btn-execute-deploy');
        if (btnDeploy) {
            btnDeploy.addEventListener('click', () => {
                if (!this.selectedOriginId) {
                    this.showToast('Lütfen önce haritadan asker yerleştirilecek bir bölgenizi seçin!', 'warning');
                    return;
                }

                const inf = parseInt(document.getElementById('input-prod-inf')?.value, 10) || 0;
                const arm = parseInt(document.getElementById('input-prod-arm')?.value, 10) || 0;
                const air = parseInt(document.getElementById('input-prod-air')?.value, 10) || 0;

                if (inf + arm + air === 0) {
                    this.showToast('En az bir birlik seçmelisiniz.', 'warning');
                    return;
                }

                this.onDeployRequested(this.selectedOriginId, { infantry: inf, armor: arm, air: air });
            });
        }
    }

    updateProductionCost() {
        const inf = parseInt(document.getElementById('input-prod-inf')?.value, 10) || 0;
        const arm = parseInt(document.getElementById('input-prod-arm')?.value, 10) || 0;
        const air = parseInt(document.getElementById('input-prod-air')?.value, 10) || 0;

        const totalCost = (inf * UNIT_TYPES.INFANTRY.cost) +
                          (arm * UNIT_TYPES.ARMOR.cost) +
                          (air * UNIT_TYPES.AIR.cost);

        const costDisplay = document.getElementById('prod-total-cost');
        if (costDisplay) {
            costDisplay.textContent = `${totalCost} IP`;
        }
    }

    resetProductionInputs() {
        if (document.getElementById('input-prod-inf')) document.getElementById('input-prod-inf').value = '0';
        if (document.getElementById('input-prod-arm')) document.getElementById('input-prod-arm').value = '0';
        if (document.getElementById('input-prod-air')) document.getElementById('input-prod-air').value = '0';
        this.updateProductionCost();
    }

    _bindCombatControls() {
        const infCommit = document.getElementById('combat-inf-commit');
        const armCommit = document.getElementById('combat-arm-commit');
        const airCommit = document.getElementById('combat-air-commit');
        const infLabel = document.getElementById('combat-inf-label');
        const armLabel = document.getElementById('combat-arm-label');
        const airLabel = document.getElementById('combat-air-label');

        if (infCommit && infLabel) {
            infCommit.addEventListener('input', () => {
                infLabel.textContent = infCommit.value;
                this._updateOddsRatio();
            });
        }
        if (armCommit && armLabel) {
            armCommit.addEventListener('input', () => {
                armLabel.textContent = armCommit.value;
                this._updateOddsRatio();
            });
        }
        if (airCommit && airLabel) {
            airCommit.addEventListener('input', () => {
                airLabel.textContent = airCommit.value;
                this._updateOddsRatio();
            });
        }

        const btnLaunchAssault = document.getElementById('btn-launch-assault');
        if (btnLaunchAssault) {
            btnLaunchAssault.addEventListener('click', () => {
                if (!this.selectedOriginId || !this.selectedTargetId) {
                    this.showToast('Lütfen taarruz için önce kendi bölgenizi, ardından hedef düşman bölgesini seçin.', 'warning');
                    return;
                }

                const inf = parseInt(document.getElementById('combat-inf-commit')?.value, 10) || 0;
                const arm = parseInt(document.getElementById('combat-arm-commit')?.value, 10) || 0;
                const air = parseInt(document.getElementById('combat-air-commit')?.value, 10) || 0;

                if (inf + arm + air === 0) {
                    this.showToast('En az bir taarruz birimi tahsis etmelisiniz.', 'warning');
                    return;
                }

                this.onAttackRequested(this.selectedOriginId, this.selectedTargetId, {
                    infantry: inf,
                    armor: arm,
                    air: air
                });
            });
        }

        const btnAirStrike = document.getElementById('btn-air-strike');
        if (btnAirStrike) {
            btnAirStrike.addEventListener('click', () => {
                if (!this.selectedOriginId || !this.selectedTargetId) {
                    this.showToast('Lütfen hava sortisi için önce kendi üssünüzü, ardından hedefi seçin.', 'warning');
                    return;
                }
                const origin = this.gameState.regions[this.selectedOriginId];
                if (!origin || origin.units.air <= 0) {
                    this.showToast('Bu bölgede kullanılabilir hava filosu yok.', 'warning');
                    return;
                }

                this.onAirStrikeRequested(this.selectedOriginId, this.selectedTargetId, origin.units.air);
            });
        }
    }

    _bindMovementControls() {
        const moveInf = document.getElementById('move-inf-input');
        const moveArm = document.getElementById('move-arm-input');
        const moveAir = document.getElementById('move-air-input');
        const moveInfLabel = document.getElementById('move-inf-label');
        const moveArmLabel = document.getElementById('move-arm-label');
        const moveAirLabel = document.getElementById('move-air-label');

        if (moveInf && moveInfLabel) {
            moveInf.addEventListener('input', () => {
                moveInfLabel.textContent = moveInf.value;
            });
        }
        if (moveArm && moveArmLabel) {
            moveArm.addEventListener('input', () => {
                moveArmLabel.textContent = moveArm.value;
            });
        }
        if (moveAir && moveAirLabel) {
            moveAir.addEventListener('input', () => {
                moveAirLabel.textContent = moveAir.value;
            });
        }

        const btnExecuteMove = document.getElementById('btn-execute-move');
        if (btnExecuteMove) {
            btnExecuteMove.addEventListener('click', () => {
                if (!this.selectedOriginId || !this.selectedTargetId) {
                    this.showToast('Lütfen intikal için çıkış ve varış dost bölgelerinizi seçin.', 'warning');
                    return;
                }

                const inf = parseInt(document.getElementById('move-inf-input')?.value, 10) || 0;
                const arm = parseInt(document.getElementById('move-arm-input')?.value, 10) || 0;
                const air = parseInt(document.getElementById('move-air-input')?.value, 10) || 0;

                this.onMoveRequested(this.selectedOriginId, this.selectedTargetId, {
                    infantry: inf,
                    armor: arm,
                    air: air
                });
            });
        }
    }

    /**
     * Updates the persistent player command badge in the top header
     */
    updatePlayerFaction(factionId) {
        this.playerFactionId = factionId;
        const fac = FACTIONS[factionId?.toUpperCase()] || FACTIONS.GERMANY;
        const badgeFlag = document.getElementById('hud-player-faction-flag');
        const badgeName = document.getElementById('hud-player-faction-name');
        const badgeContainer = document.getElementById('hud-player-command-container');

        if (badgeFlag) {
            badgeFlag.innerHTML = getFactionInsignia(fac.id, 20);
        }
        if (badgeName) {
            badgeName.textContent = i18n.getFactionName(fac.id);
            badgeName.style.color = fac.accentColor || '#38bdf8';
        }
        if (badgeContainer) {
            badgeContainer.style.borderColor = fac.accentColor || 'var(--accent-cyan)';
            badgeContainer.style.boxShadow = `0 0 16px ${fac.accentColor || 'rgba(56, 189, 248, 0.4)'}`;
        }
    }

    /**
     * Updates all HUD widgets with latest GameState data
     */
    update(selectedRegionId, targetRegionId) {
        this.selectedOriginId = selectedRegionId;
        this.selectedTargetId = targetRegionId;

        this._updateTopBar();
        this._updateSidePanel(selectedRegionId, targetRegionId);
        this._updateIntelligenceTab();
        this._updateLogs();
    }

    _updateTopBar() {
        const curFaction = this.gameState.getCurrentFaction();
        const turnNumElem = document.getElementById('hud-turn-number');
        if (turnNumElem) turnNumElem.textContent = `${i18n.t('status_turn')} ${this.gameState.turnNumber}`;

        const factionNameElem = document.getElementById('hud-active-faction-name');
        if (factionNameElem) {
            factionNameElem.innerHTML = `<span class="badge-flag" style="margin-right: 6px;">${getFactionInsignia(curFaction.id, 18)}</span> ${i18n.getFactionName(curFaction.id)}`;
            factionNameElem.style.color = curFaction.accentColor;
        }

        const ipElem = document.getElementById('hud-ip-balance');
        if (ipElem) {
            ipElem.textContent = `${curFaction.industryPoints} IP`;
        }

        const phaseElem = document.getElementById('hud-phase-indicator');
        const nextPhaseBtn = document.getElementById('btn-next-phase');
        if (phaseElem && nextPhaseBtn) {
            if (this.gameState.currentPhase === TURN_PHASES.PRODUCTION) {
                phaseElem.textContent = i18n.t('phase_1_name');
                nextPhaseBtn.innerHTML = `<span class="svg-icon" style="margin-right:4px;">${ICONS.swords}</span> ${i18n.t('btn_next_to_combat')}`;
            } else if (this.gameState.currentPhase === TURN_PHASES.COMBAT) {
                phaseElem.textContent = i18n.t('phase_2_name');
                nextPhaseBtn.innerHTML = `<span class="svg-icon" style="margin-right:4px;">${ICONS.blitz}</span> ${i18n.t('btn_end_turn')}`;
            }
        }
    }

    _updateSidePanel(originId, targetId) {
        const origin = originId ? this.gameState.regions[originId] : null;
        const target = targetId ? this.gameState.regions[targetId] : null;

        // 1. Production Tab
        const prodRegionTitle = document.getElementById('prod-selected-region-name');
        const btnDeploy = document.getElementById('btn-execute-deploy');
        if (prodRegionTitle) {
            if (origin) {
                const fac = FACTIONS[origin.owner.toUpperCase()] || FACTIONS.NEUTRAL;
                const isMine = origin.owner === this.gameState.getCurrentFaction().id;
                const originName = i18n.getRegionName(origin.id);
                const facName = i18n.getFactionName(fac.id);
                prodRegionTitle.innerHTML = `${originName} <small style="color:${fac.accentColor}">(${facName})</small>`;

                if (btnDeploy) {
                    btnDeploy.disabled = !isMine;
                    btnDeploy.style.opacity = isMine ? '1.0' : '0.45';
                    btnDeploy.innerHTML = isMine ? `<span class="svg-icon" style="margin-right:4px;">${ICONS.check}</span> ${i18n.t('btn_deploy_units')}` : i18n.t('btn_deploy_disabled');
                }
            } else {
                prodRegionTitle.textContent = i18n.t('select_region_prompt');
                if (btnDeploy) {
                    btnDeploy.disabled = false;
                    btnDeploy.style.opacity = '1.0';
                    btnDeploy.innerHTML = `<span class="svg-icon" style="margin-right:4px;">${ICONS.check}</span> ${i18n.t('btn_deploy_units')}`;
                }
            }
        }

        // 2. Combat Tab
        const combatFromElem = document.getElementById('combat-origin-info');
        const combatToElem = document.getElementById('combat-target-info');

        const unitPlateHtml = (inf, arm, air) => `
            <span style="display:inline-flex; align-items:center; gap:8px; margin-top:2px;">
                <span class="svg-icon" style="color:#93c5fd">${ICONS.infantry}</span> <strong>${inf}</strong>
                <span style="opacity:0.3">|</span>
                <span class="svg-icon" style="color:#facc15">${ICONS.armor}</span> <strong>${arm}</strong>
                <span style="opacity:0.3">|</span>
                <span class="svg-icon" style="color:#f43f5e">${ICONS.air}</span> <strong>${air}</strong>
            </span>
        `;

        if (combatFromElem) {
            if (origin) {
                const originFac = FACTIONS[origin.owner.toUpperCase()] || FACTIONS.NEUTRAL;
                const oName = i18n.getRegionName(origin.id);
                const oFac = i18n.getFactionName(originFac.id);
                combatFromElem.innerHTML = `
                    <div style="display:flex; align-items:center; gap:6px;">
                        ${getFactionInsignia(originFac.id, 16)} <strong>${oName}</strong> 
                        <span style="color:${originFac.accentColor}; font-size:0.8rem;">[${oFac}]</span>
                    </div>
                    <small style="color:var(--text-muted);">${unitPlateHtml(origin.units.infantry, origin.units.armor, origin.units.air)} • ${origin.industry} IP</small>
                `;
            } else {
                combatFromElem.textContent = i18n.t('hint_select_origin_first');
            }
        }

        if (combatToElem) {
            if (target) {
                const targetFac = FACTIONS[target.owner.toUpperCase()] || FACTIONS.NEUTRAL;
                const terrain = TERRAIN_TYPES[target.terrain.toUpperCase()] || TERRAIN_TYPES.PLAINS;
                const tName = i18n.getRegionName(target.id);
                const tFac = i18n.getFactionName(targetFac.id);
                const terrainName = i18n.getTerrainName(target.terrain);
                combatToElem.innerHTML = `
                    <div style="display:flex; align-items:center; gap:6px;">
                        ${getFactionInsignia(targetFac.id, 16)} <strong>${tName}</strong> 
                        <span style="color:${targetFac.accentColor}; font-size:0.8rem;">[${tFac}]</span>
                    </div>
                    <small style="color:var(--text-muted);">${unitPlateHtml(target.units.infantry, target.units.armor, target.units.air)}<br>${i18n.t('terrain_label')} ${terrainName} • ${i18n.t('defense_bonus_label')} +%${Math.round(terrain.defenseBonus*100)}</small>
                `;
            } else {
                combatToElem.textContent = i18n.t('hint_select_target_second');
            }
        }

        // Set max values and smart defaults on commit sliders
        const infCommit = document.getElementById('combat-inf-commit');
        const armCommit = document.getElementById('combat-arm-commit');
        const airCommit = document.getElementById('combat-air-commit');
        const infLabel = document.getElementById('combat-inf-label');
        const armLabel = document.getElementById('combat-arm-label');
        const airLabel = document.getElementById('combat-air-label');

        if (origin) {
            const availInf = Math.max(0, origin.units.infantry - 1);
            const availArm = origin.units.armor;
            const availAir = origin.units.air;

            if (infCommit) {
                infCommit.max = availInf;
                if (target) infCommit.value = availInf;
                else if (parseInt(infCommit.value, 10) > availInf) infCommit.value = availInf;
                if (infLabel) infLabel.textContent = infCommit.value;
            }
            if (armCommit) {
                armCommit.max = availArm;
                if (target) armCommit.value = availArm;
                else if (parseInt(armCommit.value, 10) > availArm) armCommit.value = availArm;
                if (armLabel) armLabel.textContent = armCommit.value;
            }
            if (airCommit) {
                airCommit.max = availAir;
                if (target) airCommit.value = availAir;
                else if (parseInt(airCommit.value, 10) > availAir) airCommit.value = availAir;
                if (airLabel) airLabel.textContent = airCommit.value;
            }
        } else {
            if (infCommit) { infCommit.max = 0; infCommit.value = 0; }
            if (armCommit) { armCommit.max = 0; armCommit.value = 0; }
            if (airCommit) { airCommit.max = 0; airCommit.value = 0; }
            if (infLabel) infLabel.textContent = '0';
            if (armLabel) armLabel.textContent = '0';
            if (airLabel) airLabel.textContent = '0';
        }

        // 3. Movement Tab sliders
        const moveInf = document.getElementById('move-inf-input');
        const moveArm = document.getElementById('move-arm-input');
        const moveAir = document.getElementById('move-air-input');
        const moveInfLabel = document.getElementById('move-inf-label');
        const moveArmLabel = document.getElementById('move-arm-label');
        const moveAirLabel = document.getElementById('move-air-label');

        if (origin) {
            const movableInf = Math.max(0, origin.units.infantry - 1);
            if (moveInf) {
                moveInf.max = movableInf;
                if (target && target.owner === origin.owner) moveInf.value = movableInf;
                if (moveInfLabel) moveInfLabel.textContent = moveInf.value;
            }
            if (moveArm) {
                moveArm.max = origin.units.armor;
                if (target && target.owner === origin.owner) moveArm.value = origin.units.armor;
                if (moveArmLabel) moveArmLabel.textContent = moveArm.value;
            }
            if (moveAir) {
                moveAir.max = origin.units.air;
                if (target && target.owner === origin.owner) moveAir.value = origin.units.air;
                if (moveAirLabel) moveAirLabel.textContent = moveAir.value;
            }
        }

        // Calculate and display combat odds
        this._updateOddsRatio(origin, target);
    }

    _updateOddsRatio(originParam = null, targetParam = null) {
        const origin = originParam || (this.selectedOriginId ? this.gameState.regions[this.selectedOriginId] : null);
        const target = targetParam || (this.selectedTargetId ? this.gameState.regions[this.selectedTargetId] : null);
        const oddsElem = document.getElementById('combat-odds-ratio');
        if (!oddsElem) return;

        if (origin && target && origin.owner !== target.owner) {
            const attInf = parseInt(document.getElementById('combat-inf-commit')?.value, 10) || 0;
            const attArm = parseInt(document.getElementById('combat-arm-commit')?.value, 10) || 0;
            const attAir = parseInt(document.getElementById('combat-air-commit')?.value, 10) || 0;

            const attPower = (attInf * 2) + (attArm * 5) + (attAir * 4);
            const terrain = TERRAIN_TYPES[target.terrain.toUpperCase()] || TERRAIN_TYPES.PLAINS;
            const defPower = ((target.units.infantry * 3) + (target.units.armor * 3) + (target.units.air * 2)) * (1 + terrain.defenseBonus);

            if (attPower === 0) {
                oddsElem.innerHTML = `Kuvvet Oranı: <span style="color:#f87171">${i18n.t('odds_no_units')}</span>`;
                return;
            }

            const ratio = defPower === 0 ? 99 : (attPower / defPower).toFixed(1);
            let rating = i18n.t('odds_balanced');
            let color = '#facc15';

            if (ratio >= 2.0) { rating = i18n.t('odds_overwhelming'); color = '#4ade80'; }
            else if (ratio >= 1.3) { rating = i18n.t('odds_advantage'); color = '#86efac'; }
            else if (ratio < 0.8) { rating = i18n.t('odds_risky'); color = '#f87171'; }

            oddsElem.innerHTML = `Kuvvet Oranı: <strong>${ratio}x</strong> (<span style="color:${color}">${rating}</span>)`;
        } else {
            oddsElem.innerHTML = `Kuvvet Oranı: <strong>${i18n.t('odds_no_selection')}</strong>`;
        }
    }

    _updateIntelligenceTab() {
        // Dynamic Alliances & Industrial Balance of Power
        let totalIP = 0;
        const allianceIP = {};
        const allianceMembers = {};

        for (const r of Object.values(this.gameState.regions)) {
            if (r.owner === 'neutral') continue;
            const ip = r.industry || 1;
            totalIP += ip;
            const f = this.gameState.factions[r.owner];
            const aId = f?.allianceId || r.owner;
            allianceIP[aId] = (allianceIP[aId] || 0) + ip;
            if (!allianceMembers[aId]) allianceMembers[aId] = new Set();
            allianceMembers[aId].add(r.owner);
        }

        const sortedAlliances = Object.entries(allianceIP).sort((a, b) => b[1] - a[1]);
        const top1 = sortedAlliances[0] || ['none', 0];
        const top2 = sortedAlliances[1] || ['none', 0];

        const top1Pct = totalIP > 0 ? Math.round((top1[1] / totalIP) * 100) : 50;
        const remainingPct = 100 - top1Pct;

        const axisBar = document.getElementById('intel-axis-bar');
        const alliesBar = document.getElementById('intel-allies-bar');
        const axisText = document.getElementById('intel-axis-pct');
        const alliesText = document.getElementById('intel-allies-pct');

        if (axisBar) axisBar.style.width = `${top1Pct}%`;
        if (alliesBar) alliesBar.style.width = `${remainingPct}%`;

        const top1Names = Array.from(allianceMembers[top1[0]] || [top1[0]]).map(fId => i18n.getFactionName(fId)).join(' & ');
        const top2Names = Array.from(allianceMembers[top2[0]] || [top2[0]]).map(fId => i18n.getFactionName(fId)).join(' & ');

        if (axisText) axisText.textContent = `${top1Names || '1. Güç'}: %${top1Pct} (${top1[1]} IP)`;
        if (alliesText) alliesText.textContent = `${top2Names || 'Diğer Güçler'}: %${remainingPct} (${totalIP - top1[1]} IP)`;

        // Strategic Capitals status
        const capitals = [
            { id: 'berlin', name: 'Berlin', owner: this.gameState.regions['berlin']?.owner },
            { id: 'rome', name: 'Roma', owner: this.gameState.regions['rome']?.owner },
            { id: 'madrid', name: 'Madrid', owner: this.gameState.regions['madrid']?.owner },
            { id: 'london', name: 'Londra', owner: this.gameState.regions['london']?.owner },
            { id: 'paris', name: 'Paris', owner: this.gameState.regions['paris']?.owner },
            { id: 'moscow', name: 'Moskova', owner: this.gameState.regions['moscow']?.owner },
            { id: 'ankara', name: 'Ankara', owner: this.gameState.regions['ankara']?.owner }
        ];

        const capsContainer = document.getElementById('intel-capitals-list');
        if (capsContainer) {
            capsContainer.innerHTML = capitals.map(c => {
                const fac = FACTIONS[c.owner?.toUpperCase()] || FACTIONS.NEUTRAL;
                const capName = i18n.getRegionName(c.id) || c.name;
                const facName = i18n.getFactionName(fac.id);
                return `<div class="capital-item"><span style="display:inline-flex; align-items:center; gap:6px;"><span class="svg-icon" style="color:#fbbf24;">${ICONS.star}</span> ${capName}</span> <span style="display:inline-flex; align-items:center; gap:6px; color:${fac.accentColor}">${getFactionInsignia(fac.id, 16)} ${facName}</span></div>`;
            }).join('');
        }

        // Diplomacy & Alliance Headquarters
        const dipContainer = document.getElementById('intel-diplomacy-list');
        if (dipContainer) {
            const myFactionId = this.playerFactionId || this.gameState.getCurrentFaction().id;
            const otherFactions = Object.values(this.gameState.factions).filter(f => f.id !== myFactionId && f.id !== 'neutral');

            dipContainer.innerHTML = otherFactions.map(f => {
                const facInfo = FACTIONS[f.id?.toUpperCase()] || FACTIONS.GERMANY;
                const facName = i18n.getFactionName(f.id);
                const isAllied = this.gameState.isAllied(myFactionId, f.id);
                const pact = this.gameState.pacts.find(p => ((p.f1 === myFactionId && p.f2 === f.id) || (p.f1 === f.id && p.f2 === myFactionId)) && p.turnsRemaining > 0);
                const relation = this.gameState.getRelation(myFactionId, f.id);
                const chance = this.gameState.getAllianceAcceptanceChance(myFactionId, f.id);

                let statusBadge = `<span class="dip-status-badge independent">${i18n.t('dip_status_independent')}</span>`;
                if (isAllied) {
                    statusBadge = `<span class="dip-status-badge allied">${i18n.t('dip_status_allied')}</span>`;
                } else if (pact) {
                    statusBadge = `<span class="dip-status-badge pact">${i18n.t('dip_status_pact').replace('{turns}', pact.turnsRemaining)}</span>`;
                }

                let barColor = '#f59e0b';
                if (relation >= 60) barColor = '#10b981';
                else if (relation < 40) barColor = '#ef4444';

                const allianceBtn = isAllied
                    ? `<button class="btn-tactical btn-danger btn-dip-action btn-dip-leave" data-target="${f.id}">
                        ${i18n.t('btn_leave_alliance')}
                       </button>`
                    : `<button class="btn-tactical btn-primary btn-dip-action btn-dip-propose" data-target="${f.id}">
                        ${i18n.t('btn_propose_alliance')} (%${chance})
                       </button>`;

                const pactBtn = pact
                    ? `<button class="btn-tactical btn-dip-action" disabled style="opacity:0.5;">
                        Pakt (${pact.turnsRemaining}T)
                       </button>`
                    : `<button class="btn-tactical btn-dip-action btn-dip-pact" data-target="${f.id}" title="5 IP karşılığı 5 turluk saldırmazlık paktı imzala">
                        ${i18n.t('btn_sign_pact')}
                       </button>`;

                return `
                    <div class="diplomacy-card ${isAllied ? 'is-allied' : ''}">
                        <div class="dip-header">
                            <div class="dip-faction-info">
                                ${getFactionInsignia(f.id, 20)}
                                <span class="dip-faction-name" style="color:${facInfo.accentColor}">${facName}</span>
                            </div>
                            ${statusBadge}
                        </div>
                        <div class="dip-metrics-row">
                            <span>${i18n.t('dip_relation')}: <strong style="color:${barColor};">${relation}/100</strong></span>
                            <span>${i18n.t('dip_acceptance_chance')}: <strong>%${chance}</strong></span>
                        </div>
                        <div class="dip-bar-track">
                            <div class="dip-bar-fill" style="width:${Math.max(0, relation)}%; background:${barColor};"></div>
                        </div>
                        <div class="dip-actions-row">
                            ${allianceBtn}
                            ${pactBtn}
                            <button class="btn-tactical btn-dip-action btn-dip-aid" data-target="${f.id}" title="10 IP gönder, ilişkileri 20 puan artır">
                                ${i18n.t('btn_send_aid')}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Attach listeners
            dipContainer.querySelectorAll('.btn-dip-propose').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.sound.playClick();
                    const targetFId = btn.getAttribute('data-target');
                    this.onProposeAlliance(myFactionId, targetFId);
                });
            });

            dipContainer.querySelectorAll('.btn-dip-leave').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.sound.playClick();
                    this.onLeaveAlliance(myFactionId);
                });
            });

            dipContainer.querySelectorAll('.btn-dip-pact').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.sound.playClick();
                    const targetFId = btn.getAttribute('data-target');
                    this.onSignPact(myFactionId, targetFId);
                });
            });

            dipContainer.querySelectorAll('.btn-dip-aid').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.sound.playClick();
                    const targetFId = btn.getAttribute('data-target');
                    this.onSendAid(myFactionId, targetFId);
                });
            });
        }
    }

    _updateLogs() {
        const logContainer = document.getElementById('hud-radio-logs');
        if (logContainer) {
            logContainer.innerHTML = this.gameState.actionHistory.slice(0, 25).map(entry => {
                return `<div class="radio-log-line">${entry}</div>`;
            }).join('');
        }
    }

    showCombatModal(report) {
        const modal = document.getElementById('modal-combat-report');
        if (!modal) return;

        const title = document.getElementById('combat-modal-title');
        const content = document.getElementById('combat-modal-body');

        if (title) {
            title.textContent = report.attackerVictorious ? i18n.t('combat_victory') : i18n.t('combat_defeat');
            title.style.color = report.attackerVictorious ? '#4ade80' : '#ef4444';
        }

        if (content) {
            const attLosses = report.attackerLosses.infantry + report.attackerLosses.armor + report.attackerLosses.air;
            const defLosses = report.defenderLosses.infantry + report.defenderLosses.armor + report.defenderLosses.air;
            const attackerFactionName = i18n.getFactionName(report.attackerInfo.id || report.attackerInfo.owner) || report.attackerInfo.name;
            const defenderFactionName = i18n.getFactionName(report.defenderInfo.id || report.defenderInfo.owner) || report.defenderInfo.name;

            content.innerHTML = `
                <div class="combat-summary-grid">
                    <div class="combat-box">
                        <h4>${attackerFactionName} (${i18n.t('combat_attacker')})</h4>
                        <p>${i18n.t('combat_losses')}: <strong>${attLosses}</strong></p>
                        <p><small style="display:inline-flex; align-items:center; gap:6px;">
                            <span class="svg-icon" style="color:#93c5fd">${ICONS.infantry}</span> ${report.attackerLosses.infantry} | 
                            <span class="svg-icon" style="color:#facc15">${ICONS.armor}</span> ${report.attackerLosses.armor} | 
                            <span class="svg-icon" style="color:#f43f5e">${ICONS.air}</span> ${report.attackerLosses.air}
                        </small></p>
                    </div>
                    <div class="combat-vs">VS</div>
                    <div class="combat-box">
                        <h4>${defenderFactionName} (${i18n.t('combat_defender')})</h4>
                        <p>${i18n.t('combat_losses')}: <strong>${defLosses}</strong></p>
                        <p><small style="display:inline-flex; align-items:center; gap:6px;">
                            <span class="svg-icon" style="color:#93c5fd">${ICONS.infantry}</span> ${report.defenderLosses.infantry} | 
                            <span class="svg-icon" style="color:#facc15">${ICONS.armor}</span> ${report.defenderLosses.armor} | 
                            <span class="svg-icon" style="color:#f43f5e">${ICONS.air}</span> ${report.defenderLosses.air}
                        </small></p>
                    </div>
                </div>
                <div class="combat-rounds-log">
                    ${report.battleLog.map(l => `<div class="combat-log-row">${l}</div>`).join('')}
                </div>
            `;
        }

        modal.classList.add('visible');

        const btnDismiss = document.getElementById('btn-close-combat-modal');
        if (btnDismiss) {
            btnDismiss.textContent = i18n.t('btn_close_combat_modal');
            btnDismiss.onclick = () => {
                this.sound.playClick();
                modal.classList.remove('visible');
            };
        }
    }

    showGameOverModal(winner) {
        const modal = document.getElementById('modal-game-over');
        if (!modal) return;

        const title = document.getElementById('game-over-title');
        const desc = document.getElementById('game-over-desc');
        const btnRestart = document.getElementById('btn-restart-game');

        const winnerName = i18n.getFactionName(winner.id) || winner.name;
        if (title) {
            title.innerHTML = `<span class="svg-icon" style="color:var(--accent-amber); margin-right:8px;">${ICONS.crown}</span> ${winnerName.toUpperCase()} ${i18n.t('game_over_victory')}`;
        }
        if (desc) {
            desc.textContent = winner.reason;
        }

        modal.classList.add('visible');

        if (btnRestart) {
            btnRestart.textContent = i18n.t('btn_restart');
            btnRestart.onclick = () => {
                this.sound.playClick();
                window.location.reload();
            };
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-message toast-${type}`;
        toast.textContent = message;

        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
}
