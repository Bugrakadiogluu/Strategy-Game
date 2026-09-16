/**
 * app.js - Master Application Orchestrator
 * Integrates Game Engine, WebRTC P2P Networking, Canvas 2D Renderer,
 * Procedural Audio Synthesizer, Strategic Command Engine, and User Interface HUD.
 */

import { GameState } from './engine/gameState.js';
import { StrategicAI } from './engine/ai.js';
import { NetworkManager } from './network/p2p.js';
import { MSG_TYPES, TURN_PHASES } from './network/protocol.js';
import { MapRenderer } from './ui/renderer.js';
import { SoundEngine } from './ui/sound.js';
import { HUD } from './ui/hud.js';

class WW2GameApp {
    constructor() {
        this.gameState = new GameState();
        this.sound = new SoundEngine();
        this.network = new NetworkManager();

        this.canvas = document.getElementById('map-canvas');
        this.renderer = new MapRenderer(this.canvas, this.gameState);
        this.hud = new HUD(this.gameState, this.sound);

        this.selectedOriginId = null;
        this.selectedTargetId = null;
        this.userFactionId = 'germany'; // Default human player faction
        this.isAiRunning = false;

        this._initMapInteractions();
        this._initNetworkCallbacks();
        this._initHudCallbacks();
        this._initLobbyModal();
        this._initZoomButtons();

        // Initial HUD render
        this.hud.update(null, null);
    }

    /* ======================================================================
       MAP CANVAS CLICK & SELECTION LOGIC
       ====================================================================== */
    _initMapInteractions() {
        this.canvas.addEventListener('click', (e) => {
            // If user was dragging map, don't count as click selection
            if (this.renderer.dragDistance > 10) return;

            const pos = this.renderer.getCanvasMousePos(e);
            const world = this.renderer.screenToWorld(pos.x, pos.y);
            const clickedRegionId = this.renderer.getRegionAt(world.x, world.y);

            this.handleRegionClick(clickedRegionId);
        });
    }

    handleRegionClick(regionId) {
        if (!regionId) {
            // Clicked empty ocean: clear selection
            this.selectedOriginId = null;
            this.selectedTargetId = null;
            this.renderer.clearSelection();
            this.hud.update(null, null);
            return;
        }

        const currentTurnFaction = this.gameState.getCurrentFaction();
        const clickedRegion = this.gameState.regions[regionId];
        this.sound.playClick();

        // 1. If no origin selected yet:
        if (!this.selectedOriginId) {
            this.selectedOriginId = regionId;
            this.selectedTargetId = null;
            this.renderer.setSelectedRegion(regionId);

            if (clickedRegion.owner === this.userFactionId) {
                // Friendly region
                if (this.gameState.currentPhase === TURN_PHASES.PRODUCTION) {
                    this.hud.switchTab('tab-production');
                } else {
                    this.hud.switchTab('tab-combat');
                }
            } else {
                // Inspected enemy or neutral region
                this.hud.switchTab('tab-combat');
            }
            this.hud.update(this.selectedOriginId, this.selectedTargetId);
            return;
        }

        // 2. If origin is already selected:
        if (this.selectedOriginId === regionId) {
            // Clicked same region again: deselect
            this.selectedOriginId = null;
            this.selectedTargetId = null;
            this.renderer.clearSelection();
            this.hud.update(null, null);
            return;
        }

        const originRegion = this.gameState.regions[this.selectedOriginId];
        const isNeighbor = originRegion.neighbors.includes(regionId);

        if (originRegion.owner === this.userFactionId) {
            if (isNeighbor) {
                this.selectedTargetId = regionId;
                if (clickedRegion.owner === this.userFactionId) {
                    // Friendly neighbor: switch to Movement tab
                    this.hud.switchTab('tab-movement');
                } else {
                    // Hostile neighbor: switch to Combat tab
                    this.hud.switchTab('tab-combat');
                }
            } else if (clickedRegion.owner === this.userFactionId) {
                // Clicked another friendly non-neighbor: make it the new origin
                this.selectedOriginId = regionId;
                this.selectedTargetId = null;
                this.renderer.setSelectedRegion(regionId);
            } else {
                // Clicked un-adjacent enemy: inspect it
                this.selectedOriginId = regionId;
                this.selectedTargetId = null;
                this.renderer.setSelectedRegion(regionId);
                this.hud.switchTab('tab-combat');
            }
        } else {
            // Origin was enemy/inspected: switch inspection to clicked region
            this.selectedOriginId = regionId;
            this.selectedTargetId = null;
            this.renderer.setSelectedRegion(regionId);
            if (clickedRegion.owner === this.userFactionId) {
                if (this.gameState.currentPhase === TURN_PHASES.PRODUCTION) {
                    this.hud.switchTab('tab-production');
                } else {
                    this.hud.switchTab('tab-combat');
                }
            }
        }

        this.hud.update(this.selectedOriginId, this.selectedTargetId);
    }

    /* ======================================================================
       HUD & ACTION CALLBACKS
       ====================================================================== */
    _initHudCallbacks() {
        // Deploy Action
        this.hud.onDeployRequested = (regionId, units) => {
            if (!this._validateTurnAuthorization()) return;

            if (this.network.isHost || this.network.isLocalOnly) {
                const res = this.gameState.buyAndDeployUnits(this.userFactionId, regionId, units);
                if (res.success) {
                    this.sound.playDeploy();
                    this.hud.showToast('Birlikler başarıyla konuşlandırıldı.', 'success');
                    this.hud.resetProductionInputs();
                    this.hud.update(this.selectedOriginId, this.selectedTargetId);
                    this.syncNetworkState();
                } else {
                    this.hud.showToast(res.reason, 'danger');
                }
            } else {
                // Client sends deploy action to host
                this.network.sendToHost(MSG_TYPES.ACTION_DEPLOY, {
                    faction: this.userFactionId,
                    regionId,
                    units
                });
            }
        };

        // Ground Attack Action
        this.hud.onAttackRequested = (fromId, toId, units) => {
            if (!this._validateTurnAuthorization()) return;

            if (this.network.isHost || this.network.isLocalOnly) {
                this.executeCombatOnHost(fromId, toId, units);
            } else {
                // Client sends attack order to host
                this.network.sendToHost(MSG_TYPES.ACTION_ATTACK, {
                    faction: this.userFactionId,
                    fromRegionId: fromId,
                    toRegionId: toId,
                    units
                });
            }
        };

        // Tactical Air Strike Action
        this.hud.onAirStrikeRequested = (fromId, toId, airCount) => {
            if (!this._validateTurnAuthorization()) return;

            if (this.network.isHost || this.network.isLocalOnly) {
                this.executeAirStrikeOnHost(fromId, toId, airCount);
            } else {
                this.network.sendToHost(MSG_TYPES.ACTION_AIR_STRIKE, {
                    faction: this.userFactionId,
                    fromRegionId: fromId,
                    toRegionId: toId,
                    airCount
                });
            }
        };

        // Tactical Movement Action
        this.hud.onMoveRequested = (fromId, toId, units) => {
            if (!this._validateTurnAuthorization()) return;

            if (this.network.isHost || this.network.isLocalOnly) {
                const res = this.gameState.executeMove(fromId, toId, units);
                if (res.success) {
                    this.sound.playDeploy();
                    this.hud.showToast('İntikal başarıyla tamamlandı.', 'success');
                    this.hud.update(this.selectedOriginId, this.selectedTargetId);
                    this.syncNetworkState();
                } else {
                    this.hud.showToast(res.reason, 'danger');
                }
            } else {
                this.network.sendToHost(MSG_TYPES.ACTION_MOVE, {
                    faction: this.userFactionId,
                    fromRegionId: fromId,
                    toRegionId: toId,
                    units
                });
            }
        };

        // Advance Phase or End Turn
        this.hud.onPhaseAdvanceRequested = () => {
            if (!this._validateTurnAuthorization()) return;

            if (this.network.isHost || this.network.isLocalOnly) {
                this.advancePhaseOnHost();
            } else {
                this.network.sendToHost(MSG_TYPES.ACTION_END_TURN, {
                    faction: this.userFactionId
                });
            }
        };

        // Save & Load Game
        this.hud.onSaveGameRequested = () => {
            const ok = this.gameState.saveToLocalStorage();
            if (ok) this.hud.showToast('Oyun tarayıcı hafızasına kaydedildi.', 'success');
            else this.hud.showToast('Kayıt başarısız!', 'danger');
        };

        this.hud.onLoadGameRequested = () => {
            const ok = this.gameState.loadFromLocalStorage();
            if (ok) {
                this.hud.showToast('Kayıtlı oyun başarıyla yüklendi.', 'success');
                this.selectedOriginId = null;
                this.selectedTargetId = null;
                this.renderer.clearSelection();
                this.hud.update(null, null);
                this.syncNetworkState();
            } else {
                this.hud.showToast('Kayıtlı oyun bulunamadı.', 'warning');
            }
        };

        // Chat Message
        this.hud.onSendChatRequested = (text) => {
            const senderName = this.network.playerName || 'Komutan';
            const logEntry = `💬 [${senderName}]: ${text}`;
            this.gameState.addLog(logEntry);
            this.hud.update(this.selectedOriginId, this.selectedTargetId);

            if (this.network.isHost) {
                this.network.broadcast(MSG_TYPES.CHAT_MESSAGE, { text: logEntry });
            } else {
                this.network.sendToHost(MSG_TYPES.CHAT_MESSAGE, { text: logEntry });
            }
        };
    }

    _validateTurnAuthorization() {
        const curFaction = this.gameState.getCurrentFaction();
        if (curFaction.id !== this.userFactionId) {
            this.hud.showToast(`Sıra sizde değil! Şu an ${curFaction.nameTr} sırası.`, 'warning');
            return false;
        }
        if (this.isAiRunning) {
            this.hud.showToast('Düşman komutanlığı harekat icra ediyor, lütfen bekleyin.', 'warning');
            return false;
        }
        return true;
    }

    executeCombatOnHost(fromId, toId, units) {
        // Trigger visual artillery animation
        this.renderer.addCombatAnimation(fromId, toId, false);
        this.sound.playArtillery();

        // Brief delay so projectile flies before battle modal pops up
        setTimeout(() => {
            const result = this.gameState.executeAttack(fromId, toId, units);
            if (!result.success) {
                this.hud.showToast(result.reason, 'danger');
                return;
            }

            if (result.conquered) {
                this.sound.playVictory();
            } else {
                this.sound.playDefeat();
            }

            this.hud.showCombatModal(result.report);
            this.hud.update(this.selectedOriginId, this.selectedTargetId);
            this.syncNetworkState();

            if (result.winner) {
                this.sound.playVictory();
                this.hud.showGameOverModal(result.winner);
            }
        }, 500);
    }

    executeAirStrikeOnHost(fromId, toId, airCount) {
        this.renderer.addCombatAnimation(fromId, toId, true);
        this.sound.playAirRaid();

        setTimeout(() => {
            const result = this.gameState.executeAirStrike(fromId, toId, airCount);
            if (result.success) {
                this.hud.showToast(`Hava sortisi başarılı: ${result.airResult.hits} isabet!`, 'success');
                this.hud.update(this.selectedOriginId, this.selectedTargetId);
                this.syncNetworkState();
            } else {
                this.hud.showToast(result.reason, 'danger');
            }
        }, 800);
    }

    advancePhaseOnHost() {
        const next = this.gameState.nextPhase();
        this.selectedOriginId = null;
        this.selectedTargetId = null;
        this.renderer.clearSelection();
        this.hud.update(null, null);
        this.syncNetworkState();

        this.checkAndRunAI();
    }

    /* ======================================================================
       ARTIFICIAL INTELLIGENCE ORCHESTRATION
       ====================================================================== */
    async checkAndRunAI() {
        const currentFaction = this.gameState.getCurrentFaction();
        if (!currentFaction || !currentFaction.isAI || currentFaction.isEliminated) {
            this.isAiRunning = false;
            return;
        }

        this.isAiRunning = true;
        this.hud.showToast(`🎖️ ${currentFaction.nameTr} (Stratejik Komuta) harekatını planlıyor...`, 'info');

        await StrategicAI.playTurn(this.gameState, (step) => {
            if (step.type === 'AI_DEPLOY') {
                this.sound.playDeploy();
            } else if (step.type === 'AI_AIR_STRIKE') {
                this.renderer.addCombatAnimation(step.from, step.to, true);
                this.sound.playAirRaid();
            } else if (step.type === 'AI_ATTACK') {
                this.renderer.addCombatAnimation(step.from, step.to, false);
                this.sound.playArtillery();
                if (step.conquered) {
                    this.sound.playVictory();
                }
            }

            this.hud.update(null, null);
            this.syncNetworkState();
        }, 800);

        this.isAiRunning = false;
        this.hud.update(null, null);
        this.syncNetworkState();

        // Check if victory condition met during AI turn
        const winner = this.gameState.checkVictoryConditions();
        if (winner) {
            this.hud.showGameOverModal(winner);
            return;
        }

        // If next faction is also AI, chain-execute
        if (this.gameState.getCurrentFaction().isAI) {
            this.checkAndRunAI();
        } else {
            this.sound.playRadioBeep();
            this.hud.showToast(`🚩 Sıra Sizde! Komutan: ${this.gameState.getCurrentFaction().nameTr}`, 'success');
        }
    }

    /* ======================================================================
       WEBRTC P2P NETWORKING
       ====================================================================== */
    _initNetworkCallbacks() {
        this.network.onStatusUpdate = (status) => {
            this.gameState.addLog(`[AĞ] ${status}`);
            this.hud.update(this.selectedOriginId, this.selectedTargetId);
        };

        this.network.onError = (err) => {
            this.hud.showToast(`Ağ Hatası: ${err}`, 'warning');
        };

        this.network.onMessageReceived = (msg, senderId) => {
            this.handleNetworkPacket(msg, senderId);
        };

        this.network.onPlayerDisconnected = (peerId) => {
            this.gameState.addLog(`[AĞ] Oyuncu ayrıldı (${peerId}). Ülkesi otomatik komutaya devredildi.`);
            this.hud.update(this.selectedOriginId, this.selectedTargetId);
        };
    }

    handleNetworkPacket(msg, senderId) {
        switch (msg.type) {
            case MSG_TYPES.LOBBY_JOIN:
                if (this.network.isHost) {
                    const claimedFaction = this._assignSlotToClient(senderId, msg.payload.playerName);
                    this.network.sendTo(senderId, MSG_TYPES.LOBBY_ACCEPTED, {
                        assignedFaction: claimedFaction,
                        gameState: this.gameState.serialize()
                    });
                    this.syncNetworkState();
                    this.hud.showToast(`${msg.payload.playerName} odaya katıldı! (${claimedFaction.toUpperCase()})`, 'info');
                }
                break;

            case MSG_TYPES.LOBBY_ACCEPTED:
                this.userFactionId = msg.payload.assignedFaction;
                this.gameState.deserialize(msg.payload.gameState);
                this.hud.showToast(`Lobiye katıldınız! Ülkeniz: ${this.userFactionId.toUpperCase()}`, 'success');
                this.hud.update(null, null);
                break;

            case MSG_TYPES.STATE_SYNC:
                this.gameState.deserialize(msg.payload.gameState);
                this.hud.update(this.selectedOriginId, this.selectedTargetId);
                if (this.gameState.winner) {
                    this.hud.showGameOverModal(this.gameState.winner);
                }
                break;

            case MSG_TYPES.ACTION_DEPLOY:
                if (this.network.isHost) {
                    this.gameState.buyAndDeployUnits(msg.payload.faction, msg.payload.regionId, msg.payload.units);
                    this.syncNetworkState();
                }
                break;

            case MSG_TYPES.ACTION_ATTACK:
                if (this.network.isHost) {
                    this.executeCombatOnHost(msg.payload.fromRegionId, msg.payload.toRegionId, msg.payload.units);
                }
                break;

            case MSG_TYPES.ACTION_AIR_STRIKE:
                if (this.network.isHost) {
                    this.executeAirStrikeOnHost(msg.payload.fromRegionId, msg.payload.toRegionId, msg.payload.airCount);
                }
                break;

            case MSG_TYPES.ACTION_MOVE:
                if (this.network.isHost) {
                    this.gameState.executeMove(msg.payload.fromRegionId, msg.payload.toRegionId, msg.payload.units);
                    this.syncNetworkState();
                }
                break;

            case MSG_TYPES.ACTION_END_TURN:
                if (this.network.isHost) {
                    this.advancePhaseOnHost();
                }
                break;

            case MSG_TYPES.CHAT_MESSAGE:
                this.sound.playRadioBeep();
                this.gameState.addLog(msg.payload.text);
                this.hud.update(this.selectedOriginId, this.selectedTargetId);
                break;
        }
    }

    _assignSlotToClient(peerId, playerName) {
        const available = ['uk', 'ussr', 'italy'].filter(fId => fId !== this.userFactionId && this.gameState.factions[fId].isAI);
        const assigned = available.length > 0 ? available[0] : 'uk';
        this.gameState.factions[assigned].isAI = false;
        this.gameState.factions[assigned].playerId = peerId;
        return assigned;
    }

    syncNetworkState() {
        if (this.network.isHost) {
            this.network.broadcast(MSG_TYPES.STATE_SYNC, {
                gameState: this.gameState.serialize()
            });
        }
    }

    /* ======================================================================
       LOBBY MODAL & GAME INITIALIZATION
       ====================================================================== */
    _initLobbyModal() {
        const modal = document.getElementById('modal-lobby');
        const factionSelect = document.getElementById('lobby-faction-select');
        const nameInput = document.getElementById('lobby-player-name');

        // Quick Singleplayer Start
        const btnSingle = document.getElementById('btn-start-singleplayer-quick');
        const cardSingle = document.getElementById('card-mode-singleplayer');

        const launchSingleplayer = () => {
            this.sound.playClick();
            this.userFactionId = factionSelect.value;
            const playerName = nameInput.value.trim() || 'General';

            this.network.initLocalMode(playerName, this.userFactionId);

            // Configure factions: user is human, others are AI
            for (const f of Object.values(this.gameState.factions)) {
                f.isAI = f.id !== this.userFactionId;
            }

            this.gameState.startGame();
            modal.classList.remove('visible');

            document.getElementById('hud-room-code').textContent = 'OFFLINE';
            this.hud.showToast(`Harekat Başladı! Komuta: ${this.gameState.factions[this.userFactionId].nameTr}`, 'success');
            this.hud.update(null, null);

            // If player chosen is not the first in turn order, let AI start
            this.checkAndRunAI();
        };

        if (btnSingle) btnSingle.addEventListener('click', launchSingleplayer);
        if (cardSingle) cardSingle.addEventListener('click', launchSingleplayer);

        // Automated Testing / Direct Launch support
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('autostart') === 'singleplayer') {
            setTimeout(() => {
                launchSingleplayer();
                const sel = urlParams.get('select');
                if (sel) {
                    setTimeout(() => this.handleRegionClick(sel), 200);
                }
            }, 150);
        }

        // Host Multiplayer Room
        const cardHost = document.getElementById('card-mode-host');
        if (cardHost) {
            cardHost.addEventListener('click', () => {
                this.sound.playClick();
                this.userFactionId = factionSelect.value;
                const playerName = nameInput.value.trim() || 'General';

                cardHost.innerHTML = `<h3>🌐 LOBİ BAŞLATILIYOR...</h3><p>PeerJS sunucusuna bağlanılıyor...</p>`;

                this.network.initHost(playerName).then(({ roomCode }) => {
                    for (const f of Object.values(this.gameState.factions)) {
                        f.isAI = f.id !== this.userFactionId;
                    }
                    this.gameState.startGame();
                    modal.classList.remove('visible');

                    document.getElementById('hud-room-code').textContent = roomCode;
                    this.hud.showToast(`Oda Açıldı! Arkadaşlarınızla paylaşın: ${roomCode}`, 'success');
                    this.hud.update(null, null);
                }).catch((err) => {
                    this.hud.showToast(`Host açılamadı, yerel mod başlatılıyor: ${err}`, 'warning');
                    launchSingleplayer();
                });
            });
        }

        // Join Multiplayer Room
        const btnJoin = document.getElementById('btn-lobby-join');
        const joinCodeInput = document.getElementById('lobby-join-code-input');
        if (btnJoin && joinCodeInput) {
            btnJoin.addEventListener('click', () => {
                const code = joinCodeInput.value.trim();
                if (!code) {
                    this.hud.showToast('Lütfen 6 haneli oda kodunu girin.', 'warning');
                    return;
                }
                const playerName = nameInput.value.trim() || 'Komutan';
                btnJoin.textContent = 'BAĞLANILIYOR...';

                this.network.initClient(playerName, code).then(() => {
                    modal.classList.remove('visible');
                    document.getElementById('hud-room-code').textContent = code.toUpperCase();
                }).catch((err) => {
                    btnJoin.textContent = 'BAĞLAN';
                    this.hud.showToast(`Bağlantı hatası: ${err}`, 'danger');
                });
            });
        }
    }

    _initZoomButtons() {
        const btnIn = document.getElementById('btn-zoom-in');
        const btnOut = document.getElementById('btn-zoom-out');
        const btnReset = document.getElementById('btn-zoom-reset');

        if (btnIn) {
            btnIn.onclick = () => {
                this.renderer.scale = Math.min(this.renderer.maxScale, this.renderer.scale * 1.2);
            };
        }
        if (btnOut) {
            btnOut.onclick = () => {
                this.renderer.scale = Math.max(this.renderer.minScale, this.renderer.scale * 0.8);
            };
        }
        if (btnReset) {
            btnReset.onclick = () => {
                this.renderer.fitToScreen();
            };
        }
    }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new WW2GameApp();
});
