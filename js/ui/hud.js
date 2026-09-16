/**
 * hud.js - Military Command Center Head-Up Display (HUD)
 * Manages side command tabs (Production, Combat, Maneuver, Intelligence, Radio/Log),
 * combat resolution modals, lobby interfaces, notifications, and game stats.
 */

import { FACTIONS, UNIT_TYPES, TERRAIN_TYPES, TURN_PHASES } from '../network/protocol.js';

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
                btnSoundToggle.innerHTML = muted ? '🔇 Ses: Kapalı' : '🔊 Ses: Açık';
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
                    this.showToast(`Oda Kodu Kopyalandı: ${code}`, 'success');
                }).catch(() => {
                    this.showToast(`Oda Kodu: ${code}`, 'info');
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
        if (turnNumElem) turnNumElem.textContent = `TUR ${this.gameState.turnNumber}`;

        const factionNameElem = document.getElementById('hud-active-faction-name');
        if (factionNameElem) {
            factionNameElem.innerHTML = `${curFaction.flagEmoji} ${curFaction.nameTr}`;
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
                phaseElem.textContent = 'AŞAMA 1: ÜRETİM & TAKVİYE';
                nextPhaseBtn.textContent = '⚔️ HAREKAT AŞAMASINA GEÇ';
            } else if (this.gameState.currentPhase === TURN_PHASES.COMBAT) {
                phaseElem.textContent = 'AŞAMA 2: ASKERİ TAARRUZ';
                nextPhaseBtn.textContent = '⏭️ TURU BİTİR';
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
                prodRegionTitle.innerHTML = `${origin.name} <small style="color:${fac.accentColor}">(${fac.nameTr})</small>`;

                if (btnDeploy) {
                    btnDeploy.disabled = !isMine;
                    btnDeploy.style.opacity = isMine ? '1.0' : '0.45';
                    btnDeploy.innerHTML = isMine ? '🎖️ BİRLİKLERİ BÖLGEYE KONUŞLANDIR' : '⚠️ YALNIZCA DOST BÖLGEYE TAKVİYE YAPILABİLİR';
                }
            } else {
                prodRegionTitle.textContent = 'Bölge Seçiniz';
                if (btnDeploy) {
                    btnDeploy.disabled = false;
                    btnDeploy.style.opacity = '1.0';
                    btnDeploy.innerHTML = '🎖️ BİRLİKLERİ BÖLGEYE KONUŞLANDIR';
                }
            }
        }

        // 2. Combat Tab
        const combatFromElem = document.getElementById('combat-origin-info');
        const combatToElem = document.getElementById('combat-target-info');
        const oddsElem = document.getElementById('combat-odds-ratio');

        if (combatFromElem) {
            if (origin) {
                const originFac = FACTIONS[origin.owner.toUpperCase()] || FACTIONS.NEUTRAL;
                combatFromElem.innerHTML = `<strong>${origin.name}</strong> <span style="color:${originFac.accentColor}">[${originFac.nameTr}]</span><br><small>(🪖 ${origin.units.infantry} | 🚜 ${origin.units.armor} | ✈️ ${origin.units.air}) | Sanayi: ${origin.industry} IP</small>`;
            } else {
                combatFromElem.textContent = 'Haritadan çıkış bölgesi seçin';
            }
        }

        if (combatToElem) {
            if (target) {
                const targetFac = FACTIONS[target.owner.toUpperCase()] || FACTIONS.NEUTRAL;
                const terrain = TERRAIN_TYPES[target.terrain.toUpperCase()] || TERRAIN_TYPES.PLAINS;
                combatToElem.innerHTML = `<strong>${target.name}</strong> <span style="color:${targetFac.accentColor}">[${targetFac.nameTr}]</span><br><small>(🪖 ${target.units.infantry} | 🚜 ${target.units.armor} | ✈️ ${target.units.air})<br>Arazi: ${terrain.name} (${terrain.icon}) Savunma Bonusu: +%${Math.round(terrain.defenseBonus*100)}</small>`;
            } else {
                combatToElem.textContent = 'Haritadan komşu hedef bölge seçin';
            }
        }

        // Set max values on commit sliders if origin exists
        if (origin) {
            const infCommit = document.getElementById('combat-inf-commit');
            const armCommit = document.getElementById('combat-arm-commit');
            const airCommit = document.getElementById('combat-air-commit');

            if (infCommit) {
                infCommit.max = Math.max(0, origin.units.infantry);
                if (parseInt(infCommit.value, 10) > origin.units.infantry) infCommit.value = origin.units.infantry;
            }
            if (armCommit) {
                armCommit.max = Math.max(0, origin.units.armor);
                if (parseInt(armCommit.value, 10) > origin.units.armor) armCommit.value = origin.units.armor;
            }
            if (airCommit) {
                airCommit.max = Math.max(0, origin.units.air);
                if (parseInt(airCommit.value, 10) > origin.units.air) airCommit.value = origin.units.air;
            }
        }

        // Calculate odds
        if (origin && target && oddsElem) {
            const attInf = parseInt(document.getElementById('combat-inf-commit')?.value, 10) || origin.units.infantry;
            const attArm = parseInt(document.getElementById('combat-arm-commit')?.value, 10) || origin.units.armor;
            const attAir = parseInt(document.getElementById('combat-air-commit')?.value, 10) || origin.units.air;

            const attPower = (attInf * 2) + (attArm * 5) + (attAir * 4);
            const terrain = TERRAIN_TYPES[target.terrain.toUpperCase()] || TERRAIN_TYPES.PLAINS;
            const defPower = ((target.units.infantry * 3) + (target.units.armor * 3) + (target.units.air * 2)) * (1 + terrain.defenseBonus);

            const ratio = defPower === 0 ? 99 : (attPower / defPower).toFixed(1);
            let rating = 'Dengeli';
            let color = '#facc15';

            if (ratio >= 2.0) { rating = 'Ezici Üstünlük'; color = '#4ade80'; }
            else if (ratio >= 1.3) { rating = 'Taarruz Avantajı'; color = '#86efac'; }
            else if (ratio < 0.8) { rating = 'Yüksek Risk / Savunma Üstün'; color = '#f87171'; }

            oddsElem.innerHTML = `Kuvvet Oranı: <strong>${ratio}x</strong> (<span style="color:${color}">${rating}</span>)`;
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
            title.textContent = report.attackerVictorious ? '🚩 TAARRUZ BAŞARILI - BÖLGE ELE GEÇİRİLDİ' : '🛡️ TAARRUZ PÜSKÜRTÜLDÜ';
            title.style.color = report.attackerVictorious ? '#4ade80' : '#ef4444';
        }

        if (content) {
            const attLosses = report.attackerLosses.infantry + report.attackerLosses.armor + report.attackerLosses.air;
            const defLosses = report.defenderLosses.infantry + report.defenderLosses.armor + report.defenderLosses.air;

            content.innerHTML = `
                <div class="combat-summary-grid">
                    <div class="combat-box">
                        <h4>${report.attackerInfo.name} (Taarruz)</h4>
                        <p>Kayıplar: <strong>${attLosses}</strong> birim</p>
                        <p><small>(🪖 ${report.attackerLosses.infantry} | 🚜 ${report.attackerLosses.armor} | ✈️ ${report.attackerLosses.air})</small></p>
                    </div>
                    <div class="combat-vs">VS</div>
                    <div class="combat-box">
                        <h4>${report.defenderInfo.name} (Savunma)</h4>
                        <p>Kayıplar: <strong>${defLosses}</strong> birim</p>
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

        if (title) {
            title.textContent = `🏆 ${winner.name.toUpperCase()} KAZANDI!`;
        }
        if (desc) {
            desc.textContent = winner.reason;
        }

        modal.classList.add('visible');

        const btnRestart = document.getElementById('btn-restart-game');
        if (btnRestart) {
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
