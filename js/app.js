/**
 * app.js - Master Application Orchestrator
 * Integrates Game Engine, WebRTC P2P Networking, Canvas 2D Renderer,
 * Procedural Audio Synthesizer, Strategic Command Engine, and User Interface HUD.
 */

import { GameState } from './engine/gameState.js';
import { StrategicAI } from './engine/ai.js';
import { NetworkManager } from './network/p2p.js';
import { MSG_TYPES, TURN_PHASES, FACTIONS } from './network/protocol.js';
import { MapRenderer } from './ui/renderer.js';
import { SoundEngine } from './ui/sound.js';
import { HUD } from './ui/hud.js';
import { i18n } from './i18n/translations.js';
import { getFactionInsignia } from './ui/icons.js';
import { analytics } from './analytics.js';

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
        this.isGameStarted = false;
        this.lobbySlots = null;

        // Apply localization
        i18n.applyToDOM();
        i18n.addListener(() => {
            this._updateFactionOptionsI18n();
            this.hud.update(this.selectedOriginId, this.selectedTargetId);
            if (this.lobbySlots) {
                this.renderWaitingRoomUI();
            }
        });

        this._initMapInteractions();
        this._initNetworkCallbacks();
        this._initHudCallbacks();
        this._initLobbyModal();
        this._initWaitingRoomListeners();
        this._initDeveloperModalListeners();
        this._initZoomButtons();
        this._initBriefingModalListeners();
        this._initExitGameListeners();
        this._updateFactionOptionsI18n();

        // Initial HUD render & viewport fit
        this.hud.updatePlayerFaction(this.userFactionId);
        this.renderer.setPlayerFaction(this.userFactionId);
        this.hud.update(null, null);
        setTimeout(() => this.renderer.fitToScreen(), 100);
        setTimeout(() => this.renderer.fitToScreen(), 400);
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

            // If lobby modal is active, clicking map selects that country
            const lobbyModal = document.getElementById('modal-lobby');
            if (lobbyModal && lobbyModal.classList.contains('visible')) {
                if (clickedRegionId) {
                    const region = this.gameState.regions[clickedRegionId];
                    if (region && region.owner && region.owner !== 'neutral') {
                        this.selectLobbyFaction(region.owner);
                        return;
                    }
                }
            }

            this.handleRegionClick(clickedRegionId);
        });

        // Also allow clicking directly on the lobby modal backdrop outside the dialog box
        const lobbyModal = document.getElementById('modal-lobby');
        if (lobbyModal) {
            lobbyModal.addEventListener('click', (e) => {
                if (e.target === lobbyModal) {
                    const rect = this.canvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    const world = this.renderer.screenToWorld(mouseX, mouseY);
                    const clickedRegionId = this.renderer.getRegionAt(world.x, world.y);
                    if (clickedRegionId) {
                        const region = this.gameState.regions[clickedRegionId];
                        if (region && region.owner && region.owner !== 'neutral') {
                            this.selectLobbyFaction(region.owner);
                        }
                    }
                }
            });
        }
    }

    selectLobbyFaction(factionId) {
        if (!factionId || factionId === 'neutral') return;
        this.userFactionId = factionId;
        this.sound.playClick();
        analytics.trackFactionSelected(factionId);

        const factionSelect = document.getElementById('lobby-faction-select');
        if (factionSelect) factionSelect.value = factionId;

        document.querySelectorAll('.faction-pill-card').forEach(p => {
            p.classList.toggle('selected', p.dataset.faction === factionId);
        });

        this.renderer.setPlayerFaction(factionId);
        this.hud.updatePlayerFaction(factionId);

        const capitals = {
            germany: 'berlin',
            uk: 'london',
            ussr: 'moscow',
            italy: 'rome',
            france: 'paris',
            spain: 'madrid',
            turkey: 'ankara'
        };
        const capId = capitals[factionId];
        if (capId && this.gameState.regions[capId]) {
            this.renderer.setSelectedRegion(capId);
            this.renderer.focusOnRegion(capId, 0.78);
        }

        const facName = i18n.getFactionName(factionId);
        this.hud.showToast(`${facName} seçildi!`, 'info');
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
        analytics.trackRegionClicked(regionId, clickedRegion?.name, clickedRegion?.owner);

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
            const logEntry = `[${senderName}]: ${text}`;
            this.gameState.addLog(logEntry);
            this.hud.update(this.selectedOriginId, this.selectedTargetId);

            if (this.network.isHost) {
                this.network.broadcast(MSG_TYPES.CHAT_MESSAGE, { text: logEntry });
            } else {
                this.network.sendToHost(MSG_TYPES.CHAT_MESSAGE, { text: logEntry });
            }
        };

        // Dynamic Diplomacy Actions
        this.hud.onProposeAlliance = (fromFId, toFId) => {
            const res = this.gameState.proposeAlliance(fromFId, toFId);
            if (res.success) {
                this.sound.playDeploy();
                this.hud.showToast(res.message, 'success');
            } else {
                this.sound.playClick();
                this.hud.showToast(res.reason, 'warning');
            }
            this.hud.update(this.selectedOriginId, this.selectedTargetId);
            this.syncNetworkState();
        };

        this.hud.onLeaveAlliance = (fId) => {
            const res = this.gameState.leaveAlliance(fId);
            if (res.success) {
                this.sound.playClick();
                this.hud.showToast(res.message, 'info');
            }
            this.hud.update(this.selectedOriginId, this.selectedTargetId);
            this.syncNetworkState();
        };

        this.hud.onSignPact = (fromFId, toFId) => {
            const f = this.gameState.factions[fromFId];
            if (!f || f.industryPoints < 5) {
                this.hud.showToast(i18n.t('toast_not_enough_ip'), 'warning');
                return;
            }
            f.industryPoints -= 5;
            const res = this.gameState.signNonAggressionPact(fromFId, toFId, 5);
            if (res.success) {
                this.sound.playDeploy();
                this.hud.showToast(res.message, 'success');
            } else {
                this.sound.playClick();
                this.hud.showToast(res.reason, 'warning');
            }
            this.hud.update(this.selectedOriginId, this.selectedTargetId);
            this.syncNetworkState();
        };

        this.hud.onSendAid = (fromFId, toFId) => {
            const res = this.gameState.sendDiplomaticAid(fromFId, toFId, 10);
            if (res.success) {
                this.sound.playDeploy();
                this.hud.showToast(res.message, 'success');
            } else {
                this.sound.playClick();
                this.hud.showToast(res.reason, 'warning');
            }
            this.hud.update(this.selectedOriginId, this.selectedTargetId);
            this.syncNetworkState();
        };
    }

    _validateTurnAuthorization() {
        const curFaction = this.gameState.getCurrentFaction();
        if (curFaction.id !== this.userFactionId) {
            this.hud.showToast(`Sıra sizde değil! Şu an ${i18n.getFactionName(curFaction.id)} sırası.`, 'warning');
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
        const fromR = this.gameState.regions[fromId];
        const toR = this.gameState.regions[toId];
        analytics.trackCombatInitiated(fromR?.owner, toR?.owner, fromId, toId);

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

            if (this.network.isHost) {
                this.network.broadcast(MSG_TYPES.COMBAT_EVENT, {
                    fromRegionId: fromId,
                    toRegionId: toId,
                    isAirStrike: false,
                    report: result.report
                });
            }

            analytics.trackCombatResult(
                result.conquered ? 'victory' : 'defeat',
                fromR?.owner, toR?.owner,
                result.report?.attackerLosses || 0,
                result.report?.defenderLosses || 0
            );

            if (result.winner) {
                this.sound.playVictory();
                this.hud.showGameOverModal(result.winner);
                analytics.trackGameOver(result.winner, this.gameState.turnNumber, 'combat_victory');
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

                if (this.network.isHost) {
                    this.network.broadcast(MSG_TYPES.COMBAT_EVENT, {
                        fromRegionId: fromId,
                        toRegionId: toId,
                        isAirStrike: true,
                        airResult: result.airResult
                    });
                }
            } else {
                this.hud.showToast(result.reason, 'danger');
            }
        }, 800);
    }

    advancePhaseOnHost() {
        const next = this.gameState.nextPhase();
        analytics.trackTurnCompleted(this.gameState.turnNumber, this.gameState.getCurrentFaction()?.id);
        analytics.trackPhaseChange(this.gameState.currentPhase, next);
        this.selectedOriginId = null;
        this.selectedTargetId = null;
        this.renderer.clearSelection();

        // Switch HUD tab automatically based on current phase
        if (this.gameState.currentPhase === TURN_PHASES.PRODUCTION) {
            this.hud.switchTab('tab-production');
        } else {
            this.hud.switchTab('tab-combat');
        }

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
        this.hud.showToast(`${i18n.getFactionName(currentFaction.id)} (Stratejik Komuta) harekatını planlıyor...`, 'info');

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
            analytics.trackGameOver(winner, this.gameState.turnNumber, 'ai_victory');
            return;
        }

        // If next faction is also AI, chain-execute
        if (this.gameState.getCurrentFaction().isAI) {
            this.checkAndRunAI();
        } else {
            this.sound.playRadioBeep();
            this.hud.showToast(`${i18n.t('toast_turn_yours')} ${i18n.getFactionName(this.gameState.getCurrentFaction().id)}`, 'success');
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
            if (this.network.isHost) {
                if (this.lobbySlots) {
                    for (const [fId, slot] of Object.entries(this.lobbySlots)) {
                        if (slot.playerId === peerId) {
                            this.lobbySlots[fId] = { playerId: null, name: 'Yapay Zeka (Bot)', isHost: false, isAI: true };
                            if (this.gameState.factions[fId]) {
                                this.gameState.factions[fId].isAI = true;
                                this.gameState.factions[fId].playerId = null;
                            }
                            this.hud.showToast(`${slot.name} ayrıldı, ${i18n.getFactionName(fId)} bota devredildi.`, 'warning');
                        }
                    }
                }
                if (!this.isGameStarted) {
                    this.renderWaitingRoomUI();
                    this.network.broadcast(MSG_TYPES.LOBBY_UPDATE, { lobbySlots: this.lobbySlots });
                } else {
                    this.syncNetworkState();
                    this.checkAndRunAI();
                }
            } else {
                this.gameState.addLog(`[AĞ] Sunucu bağlantısı kesildi.`);
                this.hud.showToast('Sunucu ile bağlantı koptu.', 'warning');
            }
        };
    }

    handleNetworkPacket(msg, senderId) {
        switch (msg.type) {
            case MSG_TYPES.LOBBY_JOIN:
                if (this.network.isHost) {
                    if (!this.isGameStarted) {
                        const claimedFaction = this._assignSlotToClient(senderId, msg.payload.playerName, msg.payload.requestedFaction);
                        this.network.sendTo(senderId, MSG_TYPES.LOBBY_ACCEPTED, {
                            assignedFaction: claimedFaction,
                            roomCode: this.network.roomCode,
                            lobbySlots: this.lobbySlots,
                            isGameStarted: false
                        });
                        this.network.broadcast(MSG_TYPES.LOBBY_UPDATE, {
                            lobbySlots: this.lobbySlots
                        });
                        this.renderWaitingRoomUI();
                        this.hud.showToast(`${msg.payload.playerName} odaya katıldı! (${i18n.getFactionName(claimedFaction)})`, 'info');
                    } else {
                        // Game already running: trigger Hot-Join prompt for Host!
                        this.promptHotJoin(senderId, msg.payload.playerName);
                    }
                }
                break;

            case MSG_TYPES.LOBBY_ACCEPTED:
                this.userFactionId = msg.payload.assignedFaction;
                if (!msg.payload.isGameStarted) {
                    this.lobbySlots = msg.payload.lobbySlots;
                    document.getElementById('modal-lobby')?.classList.remove('visible');
                    document.getElementById('modal-waiting-room')?.classList.add('visible');
                    this.renderWaitingRoomUI();
                    this.hud.showToast(`Odaya katıldınız! Ülkeniz: ${i18n.getFactionName(this.userFactionId)}`, 'success');
                } else {
                    this.gameState.deserialize(msg.payload.gameState);
                    this.hud.update(null, null);
                }
                break;

            case MSG_TYPES.LOBBY_UPDATE:
                if (!this.isGameStarted && msg.payload.lobbySlots) {
                    this.lobbySlots = msg.payload.lobbySlots;
                    this.renderWaitingRoomUI();
                }
                break;

            case MSG_TYPES.GAME_START:
                this.isGameStarted = true;
                document.getElementById('modal-waiting-room')?.classList.remove('visible');
                document.getElementById('modal-lobby')?.classList.remove('visible');
                if (msg.payload.gameState) {
                    this.gameState.deserialize(msg.payload.gameState);
                }
                this.sound.playVictory();
                this.hud.updatePlayerFaction(this.userFactionId);
                this.renderer.setPlayerFaction(this.userFactionId);
                this.hud.showToast(`Harekat Başladı! ${i18n.getFactionName(this.userFactionId)}`, 'success');
                this.hud.update(null, null);
                this._showStrategicBriefing();
                break;

            case MSG_TYPES.HOTJOIN_REQUEST:
                if (this.network.isHost) {
                    this.promptHotJoin(senderId, msg.payload.playerName);
                }
                break;

            case MSG_TYPES.HOTJOIN_APPROVED:
                if (msg.payload.gameState) {
                    this.gameState.deserialize(msg.payload.gameState);
                }
                this._openHotJoinModal(msg.payload.availableFactions);
                break;

            case MSG_TYPES.HOTJOIN_REJECTED:
                this.hud.showToast(msg.payload.reason || i18n.t('toast_hotjoin_rejected'), 'danger');
                document.getElementById('modal-lobby')?.classList.add('visible');
                break;

            case MSG_TYPES.HOTJOIN_CLAIM:
                if (this.network.isHost) {
                    const fId = msg.payload.claimedFaction;
                    const pName = msg.payload.playerName || 'Komutan';
                    if (this.gameState.factions[fId]) {
                        this.gameState.factions[fId].isAI = false;
                        this.gameState.factions[fId].playerId = senderId;
                        this.gameState.factions[fId].playerName = pName;

                        const fName = i18n.getFactionName(fId);
                        const announcement = `${pName}, ${fName} komutasını devralarak savaşa girdi!`;
                        this.gameState.addLog(announcement);
                        this.hud.showToast(announcement, 'success');
                        this.sound.playDeploy();

                        this.syncNetworkState();
                    }
                }
                break;

            case MSG_TYPES.STATE_SYNC:
                const prevPhase = this.gameState.currentPhase;
                const prevFaction = this.gameState.getCurrentFaction()?.id;
                this.gameState.deserialize(msg.payload.gameState);
                const newFaction = this.gameState.getCurrentFaction()?.id;
                const newPhase = this.gameState.currentPhase;

                // If phase changed, auto-switch tab
                if (newPhase !== prevPhase) {
                    if (newPhase === TURN_PHASES.PRODUCTION) {
                        this.hud.switchTab('tab-production');
                    } else {
                        this.hud.switchTab('tab-combat');
                    }
                }

                // If turn just arrived for client, notify with radio beep and toast
                if (newFaction === this.userFactionId && newFaction !== prevFaction) {
                    this.sound.playRadioBeep();
                    this.hud.showToast(`${i18n.t('toast_turn_yours')} ${i18n.getFactionName(this.gameState.getCurrentFaction().id)}`, 'success');
                }

                this.hud.update(this.selectedOriginId, this.selectedTargetId);
                if (this.gameState.winner) {
                    this.hud.showGameOverModal(this.gameState.winner);
                }
                break;

            case MSG_TYPES.COMBAT_EVENT:
                if (msg.payload.isAirStrike) {
                    this.renderer.addCombatAnimation(msg.payload.fromRegionId, msg.payload.toRegionId, true);
                    this.sound.playAirRaid();
                    if (msg.payload.airResult) {
                        this.hud.showToast(`Hava sortisi: ${msg.payload.airResult.hits} isabet kaydedildi!`, 'info');
                    }
                } else {
                    this.renderer.addCombatAnimation(msg.payload.fromRegionId, msg.payload.toRegionId, false);
                    this.sound.playArtillery();
                    setTimeout(() => {
                        if (msg.payload.report) {
                            if (msg.payload.report.attackerVictorious) {
                                this.sound.playVictory();
                            } else {
                                this.sound.playDefeat();
                            }
                            this.hud.showCombatModal(msg.payload.report);
                        }
                    }, 500);
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

    _initLobbySlots() {
        this.lobbySlots = {
            germany: { playerId: null, name: 'Yapay Zeka (Bot)', isHost: false, isAI: true },
            uk: { playerId: null, name: 'Yapay Zeka (Bot)', isHost: false, isAI: true },
            ussr: { playerId: null, name: 'Yapay Zeka (Bot)', isHost: false, isAI: true },
            italy: { playerId: null, name: 'Yapay Zeka (Bot)', isHost: false, isAI: true },
            france: { playerId: null, name: 'Yapay Zeka (Bot)', isHost: false, isAI: true },
            spain: { playerId: null, name: 'Yapay Zeka (Bot)', isHost: false, isAI: true },
            turkey: { playerId: null, name: 'Yapay Zeka (Bot)', isHost: false, isAI: true }
        };
    }

    _assignSlotToClient(peerId, playerName, requestedFaction = null) {
        if (!this.lobbySlots) {
            this._initLobbySlots();
        }
        const available = ['germany', 'uk', 'ussr', 'italy', 'france', 'spain', 'turkey'].filter(fId => this.lobbySlots[fId].isAI);
        let assigned = null;
        if (requestedFaction && available.includes(requestedFaction)) {
            assigned = requestedFaction;
        } else if (available.length > 0) {
            assigned = available[0];
        } else {
            assigned = 'uk';
        }
        this.lobbySlots[assigned] = {
            playerId: peerId,
            name: playerName,
            isHost: false,
            isAI: false
        };
        return assigned;
    }

    renderWaitingRoomUI() {
        const codeDisplay = document.getElementById('waiting-room-code-display');
        if (codeDisplay) codeDisplay.textContent = this.network.roomCode || 'LOCAL';

        const factions = ['germany', 'uk', 'ussr', 'italy', 'france', 'spain', 'turkey'];
        factions.forEach(fId => {
            const slot = this.lobbySlots ? this.lobbySlots[fId] : null;
            const badgeEl = document.getElementById(`slot-badge-${fId}`);
            const nameEl = document.getElementById(`slot-name-${fId}`);
            const cardEl = document.getElementById(`slot-card-${fId}`);
            const nameLabelEl = document.getElementById(`slot-name-label-${fId}`);

            if (nameLabelEl) {
                nameLabelEl.textContent = i18n.getFactionName(fId);
            }

            if (slot && !slot.isAI) {
                if (cardEl) cardEl.classList.add('slot-active');
                if (nameEl) {
                    nameEl.textContent = slot.name;
                    nameEl.classList.remove('text-muted');
                }
                if (badgeEl) {
                    if (slot.isHost) {
                        badgeEl.className = 'slot-badge badge-host';
                        badgeEl.textContent = i18n.t('slot_host_badge');
                    } else {
                        badgeEl.className = 'slot-badge badge-player';
                        badgeEl.textContent = i18n.t('slot_player_badge');
                    }
                }
            } else {
                if (cardEl) cardEl.classList.remove('slot-active');
                if (nameEl) {
                    nameEl.textContent = i18n.t('slot_bot_name');
                    nameEl.classList.add('text-muted');
                }
                if (badgeEl) {
                    badgeEl.className = 'slot-badge badge-bot';
                    badgeEl.textContent = i18n.t('slot_bot_badge');
                }
            }
        });

        const btnStart = document.getElementById('btn-waiting-room-start');
        if (btnStart) {
            if (this.network.isHost) {
                btnStart.disabled = false;
                btnStart.innerHTML = `<span>${i18n.t('btn_start_campaign_now')}</span>`;
            } else {
                btnStart.disabled = true;
                btnStart.innerHTML = `<span>Host'un Başlatması Bekleniyor...</span>`;
            }
        }
    }

    _initWaitingRoomListeners() {
        const btnCopyCode = document.getElementById('btn-copy-room-code');
        if (btnCopyCode) {
            btnCopyCode.addEventListener('click', () => {
                this.sound.playClick();
                const code = this.network.roomCode || '';
                navigator.clipboard.writeText(code).then(() => {
                    this.hud.showToast(i18n.t('toast_code_copied'), 'success');
                }).catch(() => {
                    this.hud.showToast(`Oda Kodu: ${code}`, 'info');
                });
            });
        }

        const btnCopyLink = document.getElementById('btn-copy-room-link');
        if (btnCopyLink) {
            btnCopyLink.addEventListener('click', () => {
                this.sound.playClick();
                const code = this.network.roomCode || '';
                const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
                navigator.clipboard.writeText(url).then(() => {
                    this.hud.showToast(i18n.t('toast_link_copied'), 'success');
                }).catch(() => {
                    this.hud.showToast(`Davet Linki: ${url}`, 'info');
                });
            });
        }

        const btnLeave = document.getElementById('btn-waiting-room-leave');
        if (btnLeave) {
            btnLeave.addEventListener('click', () => {
                this.sound.playClick();
                document.getElementById('modal-waiting-room')?.classList.remove('visible');
                document.getElementById('modal-lobby')?.classList.add('visible');
                this.network.reset();
            });
        }

        const btnStart = document.getElementById('btn-waiting-room-start');
        if (btnStart) {
            btnStart.addEventListener('click', () => {
                if (!this.network.isHost) return;
                this.sound.playDeploy();

                // Apply lobby slots to gameState
                if (this.lobbySlots) {
                    for (const [fId, slot] of Object.entries(this.lobbySlots)) {
                        this.gameState.factions[fId].isAI = slot.isAI;
                        this.gameState.factions[fId].playerId = slot.playerId;
                        if (!slot.isAI) {
                            this.gameState.factions[fId].playerName = slot.name;
                        }
                    }
                }

                this.isGameStarted = true;
                this.gameState.startGame(this.userFactionId);
                document.getElementById('modal-waiting-room')?.classList.remove('visible');

                // Broadcast GAME_START to all connected clients
                this.network.broadcast(MSG_TYPES.GAME_START, {
                    gameState: this.gameState.serialize()
                });

                this.sound.playVictory();
                const fName = i18n.getFactionName(this.userFactionId);
                this.hud.showToast(`Harekat Başladı! ${i18n.t('toast_turn_yours')} ${fName}`, 'success');
                this.hud.updatePlayerFaction(this.userFactionId);
                this.renderer.setPlayerFaction(this.userFactionId);
                this.hud.update(null, null);

                this._showStrategicBriefing();

                this.checkAndRunAI();
            });
        }
    }

    promptHotJoin(senderId, playerName) {
        this.sound.playRadioBeep();
        const container = document.getElementById('hotjoin-prompt-container');
        if (!container) return;

        const existing = document.getElementById(`hotjoin-card-${senderId}`);
        if (existing) existing.remove();

        const card = document.createElement('div');
        card.className = 'hotjoin-card';
        card.id = `hotjoin-card-${senderId}`;
        card.innerHTML = `
            <div class="hotjoin-title">${i18n.t('hotjoin_prompt_title')}</div>
            <div class="hotjoin-body">
                <strong>${playerName}</strong> ${i18n.t('hotjoin_prompt_desc')}
            </div>
            <div class="hotjoin-actions">
                <button class="hotjoin-btn-accept" id="btn-accept-${senderId}">${i18n.t('btn_hotjoin_accept')}</button>
                <button class="hotjoin-btn-reject" id="btn-reject-${senderId}">${i18n.t('btn_hotjoin_reject')}</button>
            </div>
        `;
        container.appendChild(card);

        const btnReject = card.querySelector(`#btn-reject-${senderId}`);
        if (btnReject) {
            btnReject.addEventListener('click', () => {
                this.sound.playClick();
                card.remove();
                this.network.sendTo(senderId, MSG_TYPES.HOTJOIN_REJECTED, {
                    reason: i18n.t('toast_hotjoin_rejected')
                });
            });
        }

        const btnAccept = card.querySelector(`#btn-accept-${senderId}`);
        if (btnAccept) {
            btnAccept.addEventListener('click', () => {
                this.sound.playClick();
                card.remove();

                const availableBots = Object.values(this.gameState.factions).filter(f => f.isAI && !f.isEliminated);
                if (availableBots.length === 0) {
                    this.hud.showToast(i18n.t('toast_hotjoin_no_factions'), 'warning');
                    this.network.sendTo(senderId, MSG_TYPES.HOTJOIN_REJECTED, {
                        reason: i18n.t('toast_hotjoin_no_factions')
                    });
                    return;
                }

                this.network.sendTo(senderId, MSG_TYPES.HOTJOIN_APPROVED, {
                    availableFactions: availableBots.map(f => ({
                        id: f.id,
                        nameTr: f.nameTr,
                        flagEmoji: f.flagEmoji,
                        alliance: f.alliance
                    })),
                    gameState: this.gameState.serialize()
                });

                this.hud.showToast(`${playerName} için katılım onaylandı, ülke seçimi bekleniyor.`, 'info');
            });
        }
    }

    _openHotJoinModal(availableFactions) {
        const modal = document.getElementById('modal-hotjoin-select');
        const listEl = document.getElementById('hotjoin-factions-list');
        const btnConfirm = document.getElementById('btn-hotjoin-confirm-claim');
        if (!modal || !listEl) return;

        let selectedClaimFaction = null;
        listEl.innerHTML = '';

        availableFactions.forEach(f => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-hotjoin-choice';
            btn.innerHTML = `<span style="display: inline-flex; align-items: center; justify-content: center; margin-right: 8px;">${getFactionInsignia(f.id, 22)}</span> <span>${i18n.getFactionName(f.id)}</span>`;
            btn.addEventListener('click', () => {
                this.sound.playClick();
                listEl.querySelectorAll('.btn-hotjoin-choice').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedClaimFaction = f.id;
                if (btnConfirm) btnConfirm.disabled = false;
            });
            listEl.appendChild(btn);
        });

        if (availableFactions.length > 0) {
            const first = listEl.querySelector('.btn-hotjoin-choice');
            if (first) first.click();
        }

        modal.classList.add('visible');

        if (btnConfirm) {
            btnConfirm.onclick = () => {
                if (!selectedClaimFaction) return;
                this.sound.playDeploy();
                this.userFactionId = selectedClaimFaction;
                this.isGameStarted = true;
                modal.classList.remove('visible');

                this.network.sendToHost(MSG_TYPES.HOTJOIN_CLAIM, {
                    claimedFaction: selectedClaimFaction,
                    playerName: this.network.playerName || 'Komutan'
                });

                this.hud.updatePlayerFaction(this.userFactionId);
                this.renderer.setPlayerFaction(this.userFactionId);
                this.hud.showToast(`${i18n.getFactionName(selectedClaimFaction)} komutasını devraldınız!`, 'success');
                this.hud.update(null, null);
                this._showStrategicBriefing();
            };
        }
    }

    _initDeveloperModalListeners() {
        const modal = document.getElementById('modal-developer-confirm');
        const btnHeader = document.getElementById('btn-developer-credit');
        const btnLobby = document.getElementById('btn-lobby-developer-credit');
        const btnCancel = document.getElementById('btn-dev-cancel');
        const btnConfirm = document.getElementById('btn-dev-confirm');

        const openModal = () => {
            this.sound.playClick();
            if (modal) modal.classList.add('visible');
        };

        const closeModal = () => {
            this.sound.playClick();
            if (modal) modal.classList.remove('visible');
        };

        if (btnHeader) btnHeader.addEventListener('click', openModal);
        if (btnLobby) btnLobby.addEventListener('click', openModal);
        if (btnCancel) btnCancel.addEventListener('click', closeModal);

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                this.sound.playDeploy();
                window.open('https://bugrakadioglu.dev', '_blank', 'noopener,noreferrer');
                if (modal) modal.classList.remove('visible');
            });
        }
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

        // Quick Singleplayer Start & Modes
        const btnSingle = document.getElementById('btn-start-singleplayer-quick');
        const cardSingle = document.getElementById('card-mode-singleplayer');
        const cardHost = document.getElementById('card-mode-host');

        // Selected mode: 'singleplayer' | 'host'
        let selectedMode = 'singleplayer';

        const updateSelectedModeUI = () => {
            if (selectedMode === 'singleplayer') {
                if (cardSingle) cardSingle.classList.add('selected');
                if (cardHost) cardHost.classList.remove('selected');
                if (btnSingle) {
                    btnSingle.textContent = i18n.t('btn_start_singleplayer');
                    btnSingle.setAttribute('data-i18n', 'btn_start_singleplayer');
                }
            } else if (selectedMode === 'host') {
                if (cardSingle) cardSingle.classList.remove('selected');
                if (cardHost) cardHost.classList.add('selected');
                if (btnSingle) {
                    btnSingle.textContent = i18n.t('btn_start_host');
                    btnSingle.setAttribute('data-i18n', 'btn_start_host');
                }
            }
        };

        // Language Buttons in Modal
        document.querySelectorAll('.lang-selector-bar .btn-lang').forEach(btn => {
            btn.addEventListener('click', () => {
                this.sound.playClick();
                const lang = btn.getAttribute('data-lang');
                i18n.setLanguage(lang);
                analytics.trackLanguageChange(lang);
                updateSelectedModeUI();
            });
        });

        // Language Buttons in Top Header
        document.querySelectorAll('.top-header .btn-lang-mini').forEach(btn => {
            btn.addEventListener('click', () => {
                this.sound.playClick();
                const lang = btn.getAttribute('data-lang');
                i18n.setLanguage(lang);
                updateSelectedModeUI();
            });
        });

        // Clicking cards SELECTS mode without immediately starting the game
        if (cardSingle) {
            cardSingle.addEventListener('click', () => {
                this.sound.playClick();
                selectedMode = 'singleplayer';
                updateSelectedModeUI();
            });
        }

        if (cardHost) {
            cardHost.addEventListener('click', () => {
                this.sound.playClick();
                selectedMode = 'host';
                updateSelectedModeUI();
            });
        }

        // Interactive Faction Pills
        document.querySelectorAll('.faction-pill-card').forEach(pill => {
            pill.addEventListener('click', () => {
                const fId = pill.getAttribute('data-faction');
                this.selectLobbyFaction(fId);
            });
        });

        if (factionSelect) {
            factionSelect.addEventListener('change', () => {
                this.selectLobbyFaction(factionSelect.value);
            });
        }

        const launchSingleplayer = () => {
            this.sound.playClick();
            this.userFactionId = factionSelect.value;
            const playerName = nameInput.value.trim() || 'General';

            this.network.initLocalMode(playerName, this.userFactionId);

            // Configure factions: user is human, others are AI
            for (const f of Object.values(this.gameState.factions)) {
                f.isAI = f.id !== this.userFactionId;
            }

            this.isGameStarted = true;
            this.gameState.startGame(this.userFactionId);
            analytics.trackGameStart(this.userFactionId, 'singleplayer');
            modal.classList.remove('visible');

            document.getElementById('hud-room-code').textContent = 'OFFLINE';
            const fName = i18n.getFactionName(this.userFactionId);
            this.hud.showToast(`${i18n.t('toast_turn_yours')} ${fName}`, 'success');
            this.hud.updatePlayerFaction(this.userFactionId);
            this.renderer.setPlayerFaction(this.userFactionId);
            this.hud.update(null, null);

            this.renderer.focusOnFaction(this.userFactionId, 0.82);

            this._showStrategicBriefing();

            // If player chosen is not the first in turn order, let AI start
            this.checkAndRunAI();
        };

        // Host Multiplayer Room (Opens Gathering Waiting Room)
        const launchHost = (customRoomCode = null, pName = null) => {
            this.sound.playClick();
            this.userFactionId = factionSelect.value;
            const playerName = pName || nameInput.value.trim() || 'General';

            if (btnSingle) {
                btnSingle.disabled = true;
                btnSingle.textContent = '⏳ LOBİ BAŞLATILIYOR...';
            }

            this.network.initHost(playerName, customRoomCode).then(({ roomCode }) => {
                if (btnSingle) {
                    btnSingle.disabled = false;
                    btnSingle.textContent = i18n.t('btn_start_host');
                }
                modal.classList.remove('visible');

                // Initialize Gathering Room Slots
                this._initLobbySlots();
                this.lobbySlots[this.userFactionId] = {
                    playerId: this.network.myPeerId,
                    name: playerName,
                    isHost: true,
                    isAI: false
                };

                // Open Waiting Room Modal
                document.getElementById('modal-waiting-room')?.classList.add('visible');
                this.renderWaitingRoomUI();

                document.getElementById('hud-room-code').textContent = roomCode;
                this.hud.showToast(`Toplanma Odası Açıldı! Oda Kodu: ${roomCode}`, 'success');
            }).catch((err) => {
                if (btnSingle) {
                    btnSingle.disabled = false;
                    btnSingle.textContent = i18n.t('btn_start_host');
                }
                this.hud.showToast(`Host açılamadı, yerel mod başlatılıyor: ${err}`, 'warning');
                launchSingleplayer();
            });
        };

        // Main action button launches the chosen mode!
        if (btnSingle) {
            btnSingle.addEventListener('click', () => {
                if (selectedMode === 'singleplayer') {
                    launchSingleplayer();
                } else if (selectedMode === 'host') {
                    launchHost();
                }
            });
        }

        updateSelectedModeUI();

        // Join Multiplayer Room
        const btnJoin = document.getElementById('btn-lobby-join');
        const joinCodeInput = document.getElementById('lobby-join-code-input');

        const launchJoin = (code, pName = null) => {
            if (!code) {
                this.hud.showToast('Lütfen 6 haneli oda kodunu girin.', 'warning');
                return;
            }
            const desiredFaction = factionSelect ? factionSelect.value : null;
            const playerName = pName || nameInput.value.trim() || 'Komutan';
            if (btnJoin) btnJoin.textContent = 'BAĞLANILIYOR...';

            this.network.initClient(playerName, code, desiredFaction).then(() => {
                if (btnJoin) btnJoin.textContent = 'BAĞLAN';
                modal.classList.remove('visible');
                document.getElementById('hud-room-code').textContent = code.toUpperCase();
                this.hud.showToast('Sunucuya bağlanıldı. Lobi durumu bekleniyor...', 'info');
            }).catch((err) => {
                if (btnJoin) btnJoin.textContent = 'BAĞLAN';
                this.hud.showToast(`Bağlantı hatası: ${err}`, 'danger');
            });
        };

        if (btnJoin && joinCodeInput) {
            btnJoin.addEventListener('click', () => {
                const code = joinCodeInput.value.trim();
                launchJoin(code);
            });
        }

        // AI Bot Difficulty Selection (Sync between Lobby and Waiting Room)
        const bindDiffPills = (containerId) => {
            const cont = document.getElementById(containerId);
            if (!cont) return;
            cont.querySelectorAll('.diff-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    this.sound.playClick();
                    const diff = pill.getAttribute('data-difficulty');
                    this.gameState.aiDifficulty = diff;
                    cont.querySelectorAll('.diff-pill').forEach(p => {
                        p.classList.toggle('active', p.getAttribute('data-difficulty') === diff);
                    });
                    const descElem = document.getElementById('lobby-difficulty-desc');
                    if (descElem) {
                        descElem.textContent = i18n.t(`diff_${diff}_desc`);
                    }
                    const otherId = containerId === 'lobby-difficulty-pills' ? 'waiting-room-difficulty-pills' : 'lobby-difficulty-pills';
                    document.querySelectorAll(`#${otherId} .diff-pill`).forEach(p => {
                        p.classList.toggle('active', p.getAttribute('data-difficulty') === diff);
                    });
                });
            });
        };
        bindDiffPills('lobby-difficulty-pills');
        bindDiffPills('waiting-room-difficulty-pills');

        // Prefill room code from URL parameters (?room=W2XXXX or ?join=W2XXXX)
        const urlParams = new URLSearchParams(window.location.search);
        const prefillRoom = urlParams.get('room') || urlParams.get('join');
        if (prefillRoom && joinCodeInput) {
            joinCodeInput.value = prefillRoom.trim().toUpperCase();
        }
        if (urlParams.get('autostart') === 'singleplayer') {
            setTimeout(() => {
                const fac = urlParams.get('faction');
                if (fac && factionSelect) factionSelect.value = fac;
                launchSingleplayer();
                if (urlParams.get('overview') === '1') {
                    this.renderer.resetOverview();
                }
                const sel = urlParams.get('select');
                if (sel) {
                    this.handleRegionClick(sel);
                }
            }, 150);
        } else if (urlParams.get('autostart') === 'host') {
            setTimeout(() => {
                const fac = urlParams.get('faction');
                if (fac && factionSelect) factionSelect.value = fac;
                const room = urlParams.get('room');
                const name = urlParams.get('name') || 'HostCommander';
                launchHost(room, name);
            }, 150);
        } else if (urlParams.get('autostart') === 'join') {
            setTimeout(() => {
                const fac = urlParams.get('faction');
                if (fac && factionSelect) factionSelect.value = fac;
                const room = urlParams.get('room');
                const name = urlParams.get('name') || 'ClientCommander';
                launchJoin(room, name);
            }, 350);
        }
    }

    _updateFactionOptionsI18n() {
        const optGer = document.getElementById('opt-faction-germany');
        const optUK = document.getElementById('opt-faction-uk');
        const optUSSR = document.getElementById('opt-faction-ussr');
        const optIta = document.getElementById('opt-faction-italy');
        const optFra = document.getElementById('opt-faction-france');
        const optSpa = document.getElementById('opt-faction-spain');
        const optTur = document.getElementById('opt-faction-turkey');

        const facs = i18n.t('factions');
        if (facs) {
            if (optGer && facs.germany) optGer.textContent = facs.germany.desc;
            if (optUK && facs.uk) optUK.textContent = facs.uk.desc;
            if (optUSSR && facs.ussr) optUSSR.textContent = facs.ussr.desc;
            if (optIta && facs.italy) optIta.textContent = facs.italy.desc;
            if (optFra && facs.france) optFra.textContent = facs.france.desc;
            if (optSpa && facs.spain) optSpa.textContent = facs.spain.desc;
            if (optTur && facs.turkey) optTur.textContent = facs.turkey.desc;
        }

        document.querySelectorAll('.faction-pill-card').forEach(pill => {
            const fId = pill.getAttribute('data-faction');
            const nameEl = pill.querySelector('.faction-pill-name');
            if (nameEl) nameEl.textContent = i18n.getFactionName(fId);
            const subEl = pill.querySelector('.faction-pill-sub');
            if (subEl) {
                const subKey = `faction_${fId}_sub`;
                const subText = i18n.t(subKey);
                if (subText && subText !== subKey) {
                    subEl.textContent = subText;
                }
            }
        });
    }

    _initZoomButtons() {
        const btnIn = document.getElementById('btn-zoom-in');
        const btnOut = document.getElementById('btn-zoom-out');
        const btnReset = document.getElementById('btn-zoom-reset');
        const btnHomeland = document.getElementById('btn-zoom-homeland');

        if (btnIn) {
            btnIn.onclick = () => {
                this.sound.playClick();
                this.renderer.zoomIn(1.25);
            };
        }
        if (btnOut) {
            btnOut.onclick = () => {
                this.sound.playClick();
                this.renderer.zoomOut(0.80);
            };
        }
        if (btnHomeland) {
            btnHomeland.onclick = () => {
                this.sound.playClick();
                this.renderer.focusOnFaction(this.userFactionId, 0.82);
                this.hud.showToast(i18n.t('zoom_homeland_title') || 'Başkente odaklanıldı', 'info');
            };
        }
        if (btnReset) {
            btnReset.onclick = () => {
                this.sound.playClick();
                this.renderer.resetOverview();
                this.hud.showToast(i18n.t('toast_map_centered'), 'info');
            };
        }
    }

    _initBriefingModalListeners() {
        // Mini language buttons inside briefing modal
        document.querySelectorAll('#modal-briefing .btn-lang-mini').forEach(btn => {
            btn.addEventListener('click', () => {
                this.sound.playClick();
                const lang = btn.getAttribute('data-lang');
                i18n.setLanguage(lang);
                document.querySelectorAll('#modal-briefing .btn-lang-mini').forEach(b => {
                    b.classList.toggle('active', b.getAttribute('data-lang') === lang);
                });
                this._populateBriefingContent();
            });
        });

        // Faction change updates the player command badge in the top bar
        const factionSelect = document.getElementById('lobby-faction-select');
        if (factionSelect) {
            factionSelect.addEventListener('change', () => {
                this.userFactionId = factionSelect.value;
                this.hud.updatePlayerFaction(this.userFactionId);
                this.renderer.setPlayerFaction(this.userFactionId);
            });
        }

        // Back button to choose another country
        const btnBack = document.getElementById('btn-briefing-back');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.sound.playClick();
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
                const modal = document.getElementById('modal-briefing');
                if (modal) modal.classList.remove('visible');
                const lobbyModal = document.getElementById('modal-lobby');
                if (lobbyModal) lobbyModal.classList.add('visible');
                this.isGameStarted = false;
            });
        }
    }

    /* ======================================================================
       EXIT GAME AND LOBBY RESET
       ====================================================================== */
    _initExitGameListeners() {
        const btnExit = document.getElementById('btn-exit-game');
        const modalExit = document.getElementById('modal-exit-confirm');
        const btnCancel = document.getElementById('btn-exit-cancel');
        const btnConfirm = document.getElementById('btn-exit-confirm');

        if (btnExit) {
            btnExit.addEventListener('click', () => {
                this.sound.playClick();
                if (modalExit) modalExit.classList.add('visible');
            });
        }

        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                this.sound.playClick();
                if (modalExit) modalExit.classList.remove('visible');
            });
        }

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                this.sound.playDeploy();
                if (modalExit) modalExit.classList.remove('visible');
                this._exitToLobby();
            });
        }
    }

    _exitToLobby() {
        if (this.network) {
            try { this.network.leave(); } catch (e) {}
        }

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        // Close active modals
        document.getElementById('modal-briefing')?.classList.remove('visible');
        document.getElementById('modal-combat-report')?.classList.remove('visible');
        document.getElementById('modal-game-over')?.classList.remove('visible');
        document.getElementById('modal-waiting-room')?.classList.remove('visible');
        document.getElementById('modal-hotjoin-select')?.classList.remove('visible');

        // Re-initialize GameState
        this.gameState = new GameState();
        this.renderer.gameState = this.gameState;
        this.hud.gameState = this.gameState;
        this.selectedOriginId = null;
        this.selectedTargetId = null;
        this.isGameStarted = false;
        this.isAiRunning = false;

        this.renderer.clearSelection();
        this.renderer.resetOverview();
        this.hud.update(null, null);

        const roomEl = document.getElementById('hud-room-code');
        if (roomEl) roomEl.textContent = 'LOCAL';

        const lobbyModal = document.getElementById('modal-lobby');
        if (lobbyModal) lobbyModal.classList.add('visible');
        this.hud.showToast('Sefer sonlandırıldı. Komuta merkezine dönüldü.', 'info');
    }

    _showStrategicBriefing() {
        const modal = document.getElementById('modal-briefing');
        const capitalMap = {
            germany: 'de',
            uk: 'gb',
            ussr: 'ru',
            italy: 'it',
            france: 'fr',
            spain: 'es',
            turkey: 'tr'
        };
        const capitalId = capitalMap[this.userFactionId] || 'de';

        // Audio announcement with Web Speech API
        this._announcePlayerFactionVoice();

        // Check if user set "Do not show again" or URL param
        const urlParams = new URLSearchParams(window.location.search);
        const dontShow = localStorage.getItem('warroom_hide_briefing') === 'true' || urlParams.get('skipbriefing') === '1';
        if (dontShow || !modal) {
            if (urlParams.get('skipbriefing') !== '1') {
                this.renderer.playCinematicIntro(capitalId);
            }
            return;
        }

        this._populateBriefingContent();
        modal.classList.add('visible');

        const btnEnter = document.getElementById('btn-briefing-start');
        const checkDontShow = document.getElementById('briefing-dont-show-checkbox');

        if (btnEnter) {
            btnEnter.onclick = () => {
                this.sound.playDeploy();
                if (checkDontShow && checkDontShow.checked) {
                    localStorage.setItem('warroom_hide_briefing', 'true');
                }
                modal.classList.remove('visible');

                // Smooth satellite zoom-out from player's capital
                this.renderer.playCinematicIntro(capitalId);
            };
        }
    }

    _populateBriefingContent() {
        const fId = this.userFactionId;
        const fac = FACTIONS[fId?.toUpperCase()] || FACTIONS.GERMANY;
        const fData = i18n.t(`factions.${fId}`) || {};

        const heroCard = document.getElementById('briefing-hero-card');
        const insBox = document.getElementById('briefing-insignia-box');
        const allianceTag = document.getElementById('briefing-alliance-tag');
        const nationName = document.getElementById('briefing-nation-name');
        const directiveDesc = document.getElementById('briefing-directive-desc');
        const directiveTitle = document.getElementById('briefing-directive-title-text');

        if (heroCard) {
            heroCard.style.setProperty('--briefing-accent-color', fac.accentColor || '#38bdf8');
        }
        if (insBox) {
            insBox.innerHTML = getFactionInsignia(fId, 44);
            insBox.style.borderColor = fac.accentColor || '#38bdf8';
            insBox.style.boxShadow = `0 0 16px ${fac.accentColor || 'rgba(56, 189, 248, 0.4)'}`;
        }
        if (allianceTag) {
            allianceTag.textContent = fData.allianceName || (fac.alliance === 'axis' ? 'MİHVER DEVLETLERİ' : 'MÜTTEFİK DEVLETLER');
        }
        if (nationName) {
            nationName.textContent = (fData.name || fac.nameTr).toUpperCase();
            nationName.style.color = fac.accentColor || '#ffffff';
        }
        if (directiveTitle) {
            directiveTitle.textContent = fData.directiveTitle || i18n.t('briefing_nation_directive_title');
        }
        if (directiveDesc) {
            directiveDesc.textContent = fData.directiveDesc || fac.desc;
        }

        // Apply active language to data-i18n elements inside modal
        document.querySelectorAll('#modal-briefing [data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = i18n.t(key);
        });
    }

    _announcePlayerFactionVoice() {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                const lang = i18n.currentLang || 'tr';
                const fData = i18n.t(`factions.${this.userFactionId}`);
                const nationName = fData ? fData.name : this.userFactionId;
                const alliance = fData ? fData.allianceName : '';

                let text = '';
                let voiceLang = 'tr-TR';

                if (lang === 'tr') {
                    text = `Komuta Edilen Ülke: ${nationName}. ${alliance}.`;
                    voiceLang = 'tr-TR';
                } else if (lang === 'ja') {
                    text = `指揮担当国: ${nationName}。${alliance}。`;
                    voiceLang = 'ja-JP';
                } else {
                    text = `Commanding nation: ${nationName}. ${alliance}.`;
                    voiceLang = 'en-US';
                }

                const utter = new SpeechSynthesisUtterance(text);
                utter.lang = voiceLang;
                utter.rate = 1.0;
                utter.pitch = 0.95;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utter);
            } catch (e) {
                // Ignore speech synthesis errors if blocked by browser autoplay policy
            }
        }
    }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new WW2GameApp();
});
