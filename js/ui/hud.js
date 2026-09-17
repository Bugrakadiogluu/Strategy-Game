/**
 * hud.js - Military Command Center Head-Up Display (HUD)
 * Manages side command tabs (Production, Combat, Maneuver, Intelligence, Radio/Log),
 * combat resolution modals, lobby interfaces, notifications, and game stats.
 */

import { FACTIONS, UNIT_TYPES, TERRAIN_TYPES, TURN_PHASES } from '../network/protocol.js';
import { i18n } from '../i18n/translations.js';

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
            factionNameElem.innerHTML = `${curFaction.flagEmoji} ${i18n.getFactionName(curFaction.id)}`;
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
                nextPhaseBtn.textContent = i18n.t('btn_next_to_combat');
            } else if (this.gameState.currentPhase === TURN_PHASES.COMBAT) {
                phaseElem.textContent = i18n.t('phase_2_name');
                nextPhaseBtn.textContent = i18n.t('btn_end_turn');
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
                    btnDeploy.innerHTML = isMine ? i18n.t('btn_deploy_units') : i18n.t('btn_deploy_disabled');
                }
            } else {
                prodRegionTitle.textContent = i18n.t('select_region_prompt');
                if (btnDeploy) {
                    btnDeploy.disabled = false;
                    btnDeploy.style.opacity = '1.0';
                    btnDeploy.innerHTML = i18n.t('btn_deploy_units');
                }
            }
        }

        // 2. Combat Tab
        const combatFromElem = document.getElementById('combat-origin-info');
        const combatToElem = document.getElementById('combat-target-info');

        if (combatFromElem) {
            if (origin) {
                const originFac = FACTIONS[origin.owner.toUpperCase()] || FACTIONS.NEUTRAL;
                const oName = i18n.getRegionName(origin.id);
                const oFac = i18n.getFactionName(originFac.id);
                combatFromElem.innerHTML = `<strong>${oName}</strong> <span style="color:${originFac.accentColor}">[${oFac}]</span><br><small>(🪖 ${origin.units.infantry} | 🚜 ${origin.units.armor} | ✈️ ${origin.units.air}) | ${i18n.t('industry_points')}: ${origin.industry} IP</small>`;
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
                combatToElem.innerHTML = `<strong>${tName}</strong> <span style="color:${targetFac.accentColor}">[${tFac}]</span><br><small>(🪖 ${target.units.infantry} | 🚜 ${target.units.armor} | ✈️ ${target.units.air})<br>${i18n.t('terrain_label')} ${terrainName} (${terrain.icon}) ${i18n.t('defense_bonus_label')} +%${Math.round(terrain.defenseBonus*100)}</small>`;
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
                oddsElem.innerHTML = `Kuvvet Oranı: <span style="color:#f87171">Birlik Tahsis Edilmedi</span>`;
                return;
            }

            const ratio = defPower === 0 ? 99 : (attPower / defPower).toFixed(1);
            let rating = 'Dengeli';
            let color = '#facc15';

            if (ratio >= 2.0) { rating = 'Ezici Üstünlük'; color = '#4ade80'; }
            else if (ratio >= 1.3) { rating = 'Taarruz Avantajı'; color = '#86efac'; }
            else if (ratio < 0.8) { rating = 'Yüksek Risk / Savunma Üstün'; color = '#f87171'; }

            oddsElem.innerHTML = `Kuvvet Oranı: <strong>${ratio}x</strong> (<span style="color:${color}">${rating}</span>)`;
        } else {
            oddsElem.innerHTML = `Kuvvet Oranı: <strong>Seçim Yapılmadı</strong>`;
        }
    }

    _updateIntelligenceTab() {
        // Axis vs Allies Dominance
        let totalIP = 0;
        let axisIP = 0;
        let alliesIP = 0;

        for (const r of Object.values(this.gameState.regions)) {
            const ip = r.industry || 1;
            totalIP += ip;
            if (r.owner === 'germany' || r.owner === 'italy') axisIP += ip;
            else if (r.owner === 'uk' || r.owner === 'ussr') alliesIP += ip;
        }

        const axisPct = Math.round((axisIP / totalIP) * 100);
        const alliesPct = Math.round((alliesIP / totalIP) * 100);

        const axisBar = document.getElementById('intel-axis-bar');
        const alliesBar = document.getElementById('intel-allies-bar');
        const axisText = document.getElementById('intel-axis-pct');
        const alliesText = document.getElementById('intel-allies-pct');

        if (axisBar) axisBar.style.width = `${axisPct}%`;
        if (alliesBar) alliesBar.style.width = `${alliesPct}%`;
        if (axisText) axisText.textContent = `Mihver: %${axisPct} (${axisIP} IP)`;
        if (alliesText) alliesText.textContent = `Müttefikler: %${alliesPct} (${alliesIP} IP)`;

        // Capitals status
        const capitals = [
            { id: 'berlin', name: 'Berlin', owner: this.gameState.regions['berlin']?.owner },
            { id: 'rome', name: 'Roma', owner: this.gameState.regions['rome']?.owner },
            { id: 'london', name: 'Londra', owner: this.gameState.regions['london']?.owner },
            { id: 'moscow', name: 'Moskova', owner: this.gameState.regions['moscow']?.owner }
        ];

        const capsContainer = document.getElementById('intel-capitals-list');
        if (capsContainer) {
            capsContainer.innerHTML = capitals.map(c => {
                const fac = FACTIONS[c.owner?.toUpperCase()] || FACTIONS.NEUTRAL;
                return `<div class="capital-item"><span>⭐ ${c.name}</span> <span style="color:${fac.accentColor}">${fac.flagEmoji} ${fac.nameTr}</span></div>`;
            }).join('');
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
                        <p><small>(🪖 ${report.attackerLosses.infantry} | 🚜 ${report.attackerLosses.armor} | ✈️ ${report.attackerLosses.air})</small></p>
                    </div>
                    <div class="combat-vs">VS</div>
                    <div class="combat-box">
                        <h4>${defenderFactionName} (${i18n.t('combat_defender')})</h4>
                        <p>${i18n.t('combat_losses')}: <strong>${defLosses}</strong></p>
                        <p><small>(🪖 ${report.defenderLosses.infantry} | 🚜 ${report.defenderLosses.armor} | ✈️ ${report.defenderLosses.air})</small></p>
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
            title.textContent = `🏆 ${winnerName.toUpperCase()} ${i18n.t('game_over_victory')}`;
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
