/**
 * analytics.js - WAR ROOM 1942 User Behavior Analytics
 * 
 * Google Analytics 4 (GA4) Custom Event Tracker
 * Kullanici tiklamalarini, oyun ici davranislarini ve oturum bilgilerini toplar.
 * Tum veriler GA4 dashboard uzerinden "Events" sekmesinde gorunur.
 *
 * Tracked Events:
 *   - game_start          : Oyun baslatildi (faction, mode)
 *   - faction_selected    : Ülke secimi yapildi
 *   - turn_completed      : Tur tamamlandi (tur numarasi, faction)
 *   - region_clicked      : Haritada bolge tiklandi
 *   - unit_produced       : Birim uretildi (tip, miktar)
 *   - combat_initiated    : Taarruz basladi (saldiran, savunan)
 *   - combat_result       : Muharebe sonucu (zafer/yenilgi)
 *   - movement_executed   : Birlik intikali yapildi
 *   - button_clicked      : UI butonu tiklandi (buton ID)
 *   - tab_switched        : Panel sekme degisimi
 *   - language_changed    : Dil degistirildi
 *   - game_over           : Oyun bitti (kazanan, tur)
 *   - session_duration    : Oturum suresi (her 60 saniyede)
 *   - briefing_viewed     : Brifing goruntulendi
 *   - map_zoom            : Harita zoom seviyesi
 */

const GA_MEASUREMENT_ID = 'G-H7W84PTFC0';

class GameAnalytics {
    constructor() {
        this._sessionStart = Date.now();
        this._turnCount = 0;
        this._combatCount = 0;
        this._clickLog = [];
        this._isAvailable = typeof window.gtag === 'function';

        if (!this._isAvailable) {
            console.warn('[Analytics] gtag not found - analytics disabled (adblocker or local)');
        }

        // Session heartbeat - her 60 saniyede oturum suresi gonder
        this._heartbeatInterval = setInterval(() => {
            this._sendEvent('session_heartbeat', {
                session_seconds: Math.floor((Date.now() - this._sessionStart) / 1000),
                turns_played: this._turnCount,
                combats_fought: this._combatCount
            });
        }, 60000);

        // Sayfa kapanirken son raporu gonder
        window.addEventListener('beforeunload', () => {
            this._sendEvent('session_end', {
                total_seconds: Math.floor((Date.now() - this._sessionStart) / 1000),
                total_turns: this._turnCount,
                total_combats: this._combatCount
            });
        });

        this._setupGlobalClickTracker();
    }

    // ---- Core GA4 Event Sender ----

    _sendEvent(eventName, params = {}) {
        if (!this._isAvailable) return;
        try {
            gtag('event', eventName, params);
        } catch (e) {
            // Sessizce yut - analytics asla oyunu bozmasin
        }
    }

    // ---- Global Click Tracker ----
    // Tum butonlara, sekmelere ve onemli elemanlara otomatik listener ekler

    _setupGlobalClickTracker() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, .lobby-choice-card, .slot-card, .cmd-tab-btn, .btn-lang, .btn-lang-mini, a');
            if (!target) return;

            const id = target.id || target.dataset?.tab || target.textContent?.trim().substring(0, 30) || 'unknown';
            const tagName = target.tagName.toLowerCase();
            const classList = Array.from(target.classList).join(' ');

            this._sendEvent('button_clicked', {
                button_id: id,
                button_tag: tagName,
                button_class: classList.substring(0, 100)
            });
        }, { passive: true });
    }

    // ---- Game Lifecycle Events ----

    trackGameStart(factionId, mode = 'singleplayer') {
        this._sendEvent('game_start', {
            faction: factionId,
            game_mode: mode,
            screen_width: window.innerWidth,
            screen_height: window.innerHeight,
            user_agent_short: navigator.userAgent.substring(0, 100)
        });
    }

    trackFactionSelected(factionId) {
        this._sendEvent('faction_selected', {
            faction: factionId
        });
    }

    trackTurnCompleted(turnNumber, factionId) {
        this._turnCount = turnNumber;
        this._sendEvent('turn_completed', {
            turn_number: turnNumber,
            faction: factionId
        });
    }

    trackRegionClicked(regionId, regionName, owner) {
        this._sendEvent('region_clicked', {
            region_id: regionId,
            region_name: regionName?.substring(0, 50),
            region_owner: owner
        });
    }

    trackUnitProduced(unitType, quantity, cost, regionId) {
        this._sendEvent('unit_produced', {
            unit_type: unitType,
            quantity: quantity,
            total_cost: cost,
            region: regionId
        });
    }

    trackCombatInitiated(attackerFaction, defenderFaction, attackerRegion, defenderRegion) {
        this._combatCount++;
        this._sendEvent('combat_initiated', {
            attacker: attackerFaction,
            defender: defenderFaction,
            from_region: attackerRegion,
            to_region: defenderRegion
        });
    }

    trackCombatResult(result, attackerFaction, defenderFaction, attackerLosses, defenderLosses) {
        this._sendEvent('combat_result', {
            result: result, // 'victory', 'defeat', 'draw'
            attacker: attackerFaction,
            defender: defenderFaction,
            attacker_losses: attackerLosses,
            defender_losses: defenderLosses
        });
    }

    trackMovement(fromRegion, toRegion, unitCount) {
        this._sendEvent('movement_executed', {
            from_region: fromRegion,
            to_region: toRegion,
            units_moved: unitCount
        });
    }

    trackTabSwitch(tabId) {
        this._sendEvent('tab_switched', {
            tab_id: tabId
        });
    }

    trackLanguageChange(langCode) {
        this._sendEvent('language_changed', {
            language: langCode
        });
    }

    trackGameOver(winnerFaction, totalTurns, victoryType) {
        this._sendEvent('game_over', {
            winner: winnerFaction,
            total_turns: totalTurns,
            victory_type: victoryType, // 'industry_dominance', 'capital_capture'
            session_seconds: Math.floor((Date.now() - this._sessionStart) / 1000)
        });
    }

    trackBriefingViewed(factionId) {
        this._sendEvent('briefing_viewed', {
            faction: factionId
        });
    }

    trackMapZoom(zoomLevel, action) {
        this._sendEvent('map_zoom', {
            zoom_level: Math.round(zoomLevel * 100) / 100,
            zoom_action: action // 'in', 'out', 'reset', 'scroll'
        });
    }

    trackPhaseChange(phaseId, phaseName) {
        this._sendEvent('phase_changed', {
            phase_id: phaseId,
            phase_name: phaseName
        });
    }

    // ---- Cleanup ----

    destroy() {
        if (this._heartbeatInterval) {
            clearInterval(this._heartbeatInterval);
        }
    }
}

// Singleton export
export const analytics = new GameAnalytics();
