/**
 * renderer.js - HTML5 Canvas 2D Tactical Map Renderer
 * Renders European/North African theater regions, unit counters, capitals,
 * industrial assets, Pan/Zoom transformations, combat animations, and tactical overlays.
 */

import { FACTIONS } from '../network/protocol.js';
import { i18n } from '../i18n/translations.js';

export class MapRenderer {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;

        // Viewport Transform (Pan & Zoom)
        this.scale = 0.82;
        this.minScale = 0.26;
        this.maxScale = 3.2;
        this.offsetX = 0;
        this.offsetY = 0;
        this._hasUserView = false;

        // Interactive States
        this.hoveredRegionId = null;
        this.selectedRegionId = null;
        this.highlightedTargetIds = []; // Valid neighbors for attack or move
        this.playerFactionId = 'germany';

        // Cinematic intro state
        this.isCinematicActive = false;
        this.cinematicCapital = null;

        // Active visual animations (projectiles, explosions, air runs)
        this.animations = [];
        this.lastFrameTime = performance.now();
        this.pulseTime = 0;

        // Mouse Drag Tracking
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragDistance = 0;

        // Setup event listeners
        this._setupEvents();

        // Start render loop
        this._renderLoop = this._renderLoop.bind(this);
        requestAnimationFrame(this._renderLoop);

        this.fitToScreen();
    }

    fitToScreen(forceReset = false) {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const displayW = Math.round(rect.width) > 50 ? Math.round(rect.width) : Math.max(800, window.innerWidth - 420);
        const displayH = Math.round(rect.height) > 50 ? Math.round(rect.height) : Math.max(600, window.innerHeight - 60);

        const oldW = this.canvas.width;
        const oldH = this.canvas.height;
        this.canvas.width = displayW;
        this.canvas.height = displayH;

        if (!this._hasUserView || forceReset) {
            const mapW = this.gameState?.dimensions?.width || 2400;
            const mapH = this.gameState?.dimensions?.height || 1600;
            const scaleX = displayW / mapW;
            const scaleY = displayH / mapH;
            this.scale = Math.max(this.minScale, Math.min(scaleX, scaleY) * 0.94);
            this.offsetX = (displayW - mapW * this.scale) / 2;
            this.offsetY = (displayH - mapH * this.scale) / 2;
            this._hasUserView = true;
        } else if (oldW > 0 && oldH > 0 && (oldW !== displayW || oldH !== displayH)) {
            this.offsetX += (displayW - oldW) / 2;
            this.offsetY += (displayH - oldH) / 2;
        }
    }

    focusOnRegion(regionId, targetScale = null) {
        this.isCinematicActive = false;
        const r = this.gameState.regions[regionId];
        if (!r || !this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        if (rect.width > 50 && rect.height > 50) {
            this.canvas.width = Math.round(rect.width);
            this.canvas.height = Math.round(rect.height);
        }
        const displayW = this.canvas.width || 1200;
        const displayH = this.canvas.height || 800;

        const desiredScale = targetScale !== null ? targetScale : 0.82;
        this.scale = Math.max(this.minScale, Math.min(desiredScale, this.maxScale));
        this.offsetX = (displayW / 2) - r.x * this.scale;
        this.offsetY = (displayH / 2) - r.y * this.scale;
        this._hasUserView = true;
    }

    focusOnFaction(factionId, targetScale = null) {
        this.isCinematicActive = false;
        const fac = this.gameState.factions[factionId?.toLowerCase()];
        const capId = fac?.capitalRegionId || {
            germany: 'de_berlin',
            uk: 'gb_london',
            ussr: 'ru_moscow',
            italy: 'it_rome',
            france: 'fr_paris',
            spain: 'es_madrid',
            turkey: 'tr_ankara'
        }[factionId?.toLowerCase()] || 'de_berlin';
        this.focusOnRegion(capId, targetScale !== null ? targetScale : 0.82);
    }

    zoomIn(delta = 1.25) {
        this.isCinematicActive = false;
        this._zoomAtCenter(delta);
    }

    zoomOut(delta = 0.80) {
        this.isCinematicActive = false;
        this._zoomAtCenter(delta);
    }

    _zoomAtCenter(factor) {
        this.isCinematicActive = false;
        if (!this.canvas) return;
        const oldScale = this.scale;
        const newScale = Math.max(this.minScale, Math.min(this.scale * factor, this.maxScale));
        if (newScale === oldScale) return;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.offsetX = centerX - (centerX - this.offsetX) * (newScale / oldScale);
        this.offsetY = centerY - (centerY - this.offsetY) * (newScale / oldScale);
        this.scale = newScale;
        this._hasUserView = true;
    }

    resetOverview() {
        this.isCinematicActive = false;
        this.fitToScreen(true);
    }

    setPlayerFaction(factionId) {
        this.playerFactionId = factionId;
    }

    /**
     * Cinematic Satellite Zoom-Out on game launch
     * Starts focused closely on player's capital, then smoothly decelerates to tactical operational view.
     */
    playCinematicIntro(capitalRegionId, onComplete) {
        const capital = this.gameState.regions[capitalRegionId] || 
                        this.gameState.regions['de'] || 
                        this.gameState.regions['berlin'] || 
                        Object.values(this.gameState.regions)[0];
        if (!capital || !this.canvas) {
            if (onComplete) onComplete();
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const displayW = Math.round(rect.width) > 50 ? Math.round(rect.width) : Math.max(800, window.innerWidth - 420);
        const displayH = Math.round(rect.height) > 50 ? Math.round(rect.height) : Math.max(600, window.innerHeight - 60);

        this.canvas.width = displayW;
        this.canvas.height = displayH;

        // Tactical operational zoom centered on the player's capital
        const targetScale = 0.82;
        const targetOffsetX = (displayW / 2) - capital.x * targetScale;
        const targetOffsetY = (displayH / 2) - capital.y * targetScale;

        // Initial zoomed-in coordinates focused on the capital
        const startScale = Math.min(this.maxScale, targetScale * 1.6);
        const startOffsetX = (displayW / 2) - capital.x * startScale;
        const startOffsetY = (displayH / 2) - capital.y * startScale;

        const duration = 1800; // 1.8 seconds
        const startTime = performance.now();
        this.isCinematicActive = true;
        this.cinematicCapital = { 
            x: capital.x, 
            y: capital.y, 
            color: FACTIONS[capital.owner?.toUpperCase()]?.accentColor || '#38bdf8' 
        };

        const animate = (now) => {
            if (!this.isCinematicActive) return;
            const elapsed = now - startTime;
            const progress = Math.min(1.0, elapsed / duration);
            // Ease-out cubic for realistic military camera deceleration
            const ease = 1 - Math.pow(1 - progress, 3);

            this.scale = startScale + (targetScale - startScale) * ease;
            this.offsetX = startOffsetX + (targetOffsetX - startOffsetX) * ease;
            this.offsetY = startOffsetY + (targetOffsetY - startOffsetY) * ease;

            if (progress < 1.0) {
                requestAnimationFrame(animate);
            } else {
                this.isCinematicActive = false;
                this.cinematicCapital = null;
                this.scale = targetScale;
                this.offsetX = targetOffsetX;
                this.offsetY = targetOffsetY;
                this._hasUserView = true;
                if (onComplete) onComplete();
            }
        };

        requestAnimationFrame(animate);
    }

    getCanvasMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width > 0 ? (this.canvas.width / rect.width) : 1;
        const scaleY = rect.height > 0 ? (this.canvas.height / rect.height) : 1;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    _setupEvents() {
        const c = this.canvas;

        // Resize observer
        window.addEventListener('resize', () => this.fitToScreen());
        if (typeof ResizeObserver !== 'undefined' && this.canvas) {
            this._resizeObserver = new ResizeObserver(() => {
                this.fitToScreen();
            });
            this._resizeObserver.observe(this.canvas);
        }

        // Mouse Pan & Drag
        c.addEventListener('mousedown', (e) => {
            if (e.button === 0 || e.button === 1) { // Left or middle click
                this.isDragging = true;
                const pos = this.getCanvasMousePos(e);
                this.dragStartX = pos.x - this.offsetX;
                this.dragStartY = pos.y - this.offsetY;
                this.dragDistance = 0;
            }
        });

        window.addEventListener('mousemove', (e) => {
            const pos = this.getCanvasMousePos(e);
            if (this.isDragging) {
                const newX = pos.x - this.dragStartX;
                const newY = pos.y - this.dragStartY;
                this.dragDistance += Math.abs(newX - this.offsetX) + Math.abs(newY - this.offsetY);
                this.offsetX = newX;
                this.offsetY = newY;
            } else {
                // Update hovered region
                const worldPos = this.screenToWorld(pos.x, pos.y);
                this.hoveredRegionId = this.getRegionAt(worldPos.x, worldPos.y);
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Mouse Wheel Zoom
        c.addEventListener('wheel', (e) => {
            e.preventDefault();
            const pos = this.getCanvasMousePos(e);
            const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
            const newScale = Math.max(this.minScale, Math.min(this.scale * zoomFactor, this.maxScale));

            // Zoom towards mouse position
            this.offsetX = pos.x - (pos.x - this.offsetX) * (newScale / this.scale);
            this.offsetY = pos.y - (pos.y - this.offsetY) * (newScale / this.scale);
            this.scale = newScale;
        }, { passive: false });

        // Touch Pan & Pinch Zoom support
        let touchStartDist = 0;
        let touchStartScale = 1;
        let lastTouchX = 0;
        let lastTouchY = 0;

        c.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.isDragging = true;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
                this.dragDistance = 0;
            } else if (e.touches.length === 2) {
                this.isDragging = false;
                touchStartDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                touchStartScale = this.scale;
            }
        }, { passive: true });

        c.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.isDragging) {
                const dx = e.touches[0].clientX - lastTouchX;
                const dy = e.touches[0].clientY - lastTouchY;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
                this.offsetX += dx;
                this.offsetY += dy;
                this.dragDistance += Math.hypot(dx, dy);
            } else if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                if (touchStartDist > 0) {
                    const ratio = dist / touchStartDist;
                    this.scale = Math.max(this.minScale, Math.min(touchStartScale * ratio, this.maxScale));
                }
            }
        }, { passive: true });

        c.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    screenToWorld(sx, sy) {
        return {
            x: (sx - this.offsetX) / this.scale,
            y: (sy - this.offsetY) / this.scale
        };
    }

    worldToScreen(wx, wy) {
        return {
            x: wx * this.scale + this.offsetX,
            y: wy * this.scale + this.offsetY
        };
    }

    getRegionAt(worldX, worldY) {
        if (!this._scratchCtx) {
            this._scratchCtx = document.createElement('canvas').getContext('2d');
        }

        const regions = Object.values(this.gameState.regions);

        // 1. Native Path2D point-in-path test (accurate curves, bays, natural peninsulas & islands)
        for (let i = regions.length - 1; i >= 0; i--) {
            const r = regions[i];
            if (!r.path2d && (r.svgPath || r.path)) {
                try { r.path2d = new Path2D(r.svgPath || r.path); } catch (e) { /* ignore */ }
            }
            if (r.path2d && this._scratchCtx.isPointInPath(r.path2d, worldX, worldY)) {
                return r.id;
            }
        }

        // 1b. Fallback: Ray-casting point-in-polygon for projectedPolygons
        for (let i = regions.length - 1; i >= 0; i--) {
            const r = regions[i];
            if (r.projectedPolygons) {
                for (const poly of r.projectedPolygons) {
                    for (const ring of poly) {
                        if (ring && ring.length >= 3 && this._isPointInPolygon(worldX, worldY, ring)) {
                            return r.id;
                        }
                    }
                }
            } else if (r.polygon && r.polygon.length >= 3) {
                if (this._isPointInPolygon(worldX, worldY, r.polygon)) {
                    return r.id;
                }
            }
        }

        // 2. Region badge / label box hit test (around r.x, r.y)
        for (let i = regions.length - 1; i >= 0; i--) {
            const r = regions[i];
            if (Math.abs(worldX - r.x) <= 60 && Math.abs(worldY - r.y) <= 32) {
                return r.id;
            }
        }

        // 3. Proximity hit test: if clicked within 55px radius of region center
        let closestRegionId = null;
        let minDistance = 55;
        for (const r of regions) {
            const dist = Math.hypot(worldX - r.x, worldY - r.y);
            if (dist < minDistance) {
                minDistance = dist;
                closestRegionId = r.id;
            }
        }

        return closestRegionId;
    }

    _isPointInPolygon(x, y, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    setSelectedRegion(regionId) {
        this.selectedRegionId = regionId;
        this.highlightedTargetIds = [];

        if (regionId) {
            const r = this.gameState.regions[regionId];
            if (r) {
                this.highlightedTargetIds = [...r.neighbors];
            }
        }
    }

    clearSelection() {
        this.selectedRegionId = null;
        this.highlightedTargetIds = [];
    }

    /**
     * Triggers visual artillery projectile animation from one region to another
     */
    addCombatAnimation(fromRegionId, toRegionId, isAirStrike = false) {
        const from = this.gameState.regions[fromRegionId];
        const to = this.gameState.regions[toRegionId];
        if (!from || !to) return;

        this.animations.push({
            type: isAirStrike ? 'air_strike' : 'artillery',
            startX: from.x,
            startY: from.y,
            targetX: to.x,
            targetY: to.y,
            progress: 0,
            duration: isAirStrike ? 1200 : 800,
            startTime: performance.now(),
            toRegionId
        });
    }

    /**
     * Triggers explosion shockwave animation on region
     */
    addExplosion(toRegionId) {
        const r = this.gameState.regions[toRegionId];
        if (!r) return;

        this.animations.push({
            type: 'explosion',
            x: r.x,
            y: r.y,
            radius: 10,
            maxRadius: 45,
            progress: 0,
            duration: 650,
            startTime: performance.now()
        });
    }

    _renderLoop(timestamp) {
        const dt = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        this.pulseTime += dt * 3.5;

        try {
            this._render();
            this._updateAnimations(timestamp);
        } catch (err) {
            console.error('MapRenderer render error:', err);
            try {
                fetch('/api/test-result', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ context: 'MapRenderer._render', message: err.message, stack: err.stack })
                });
            } catch (_) {}
        }

        requestAnimationFrame(this._renderLoop);
    }

    _render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.save();
        ctx.clearRect(0, 0, w, h);

        // 1. Tactical Holographic Grid Background (Ocean & Seas)
        this._renderTacticalOcean(ctx, w, h);

        // 2. Apply World Transform
        ctx.save();
        ctx.translate(this.offsetX, this.offsetY);
        ctx.scale(this.scale, this.scale);

        // 2b. Render Historical Sea and Ocean Names
        this._renderSeaNames(ctx);

        // 3. Render Regional Boundaries & Territory Fills
        this._renderRegions(ctx);

        // 4. Render Frontlines & Connections
        this._renderFrontlines(ctx);

        // 5. Render Combat Animations (Shells, explosions)
        this._renderAnimations(ctx);

        // 6. Render Regional Units, Industry, and Labels
        this._renderRegionBadges(ctx);

        ctx.restore();

        // 7. Mini Compass / Radar Scanline Overlay
        this._renderOverlayHUD(ctx, w, h);

        ctx.restore();
    }

    _renderSeaNames(ctx) {
        const seas = [
            { id: 'atlantic_ocean', x: 120, y: 920, angle: -0.15 },
            { id: 'north_sea', x: 700, y: 760, angle: 0 },
            { id: 'baltic_sea', x: 1240, y: 680, angle: 0.2 },
            { id: 'west_med', x: 720, y: 1360, angle: 0 },
            { id: 'east_med', x: 1480, y: 1520, angle: 0 },
            { id: 'black_sea', x: 1720, y: 1260, angle: 0 },
            { id: 'caspian_sea', x: 2340, y: 1180, angle: 0.1 }
        ];

        ctx.save();
        ctx.font = 'bold 14px "Orbitron", "Hiragino Sans", "Meiryo", monospace, sans-serif';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const s of seas) {
            const seaName = i18n.getSeaName ? i18n.getSeaName(s.id) : s.id;
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.angle || 0);
            ctx.fillText(seaName, 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    _renderTacticalOcean(ctx, w, h) {
        // Deep naval war-room gradient (cached to prevent 60 allocations/sec)
        if (!this._bgGrad || this._lastW !== w || this._lastH !== h) {
            this._lastW = w;
            this._lastH = h;
            this._bgGrad = ctx.createLinearGradient(0, 0, w, h);
            this._bgGrad.addColorStop(0, '#0a0e17');
            this._bgGrad.addColorStop(0.5, '#0f172a');
            this._bgGrad.addColorStop(1, '#080d1a');
        }
        ctx.fillStyle = this._bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Coordinate grid lines
        ctx.strokeStyle = 'rgba(30, 58, 138, 0.15)';
        ctx.lineWidth = 1;
        const gridSize = 50 * this.scale;
        const startX = this.offsetX % gridSize;
        const startY = this.offsetY % gridSize;

        ctx.beginPath();
        for (let x = startX; x < w; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        for (let y = startY; y < h; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }
        ctx.stroke();

        // Subtle topographic / radar scan arc (cached gradient)
        const radarAngle = (this.pulseTime * 0.4) % (Math.PI * 2);
        const maxDim = Math.max(w, h);
        if (!this._radarGrad || this._radarDim !== maxDim) {
            this._radarDim = maxDim;
            this._radarGrad = ctx.createRadialGradient(0, 0, 50, 0, 0, maxDim);
            this._radarGrad.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
            this._radarGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
        }

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(radarAngle);
        ctx.fillStyle = this._radarGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, maxDim, 0, Math.PI / 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    _renderRegions(ctx) {
        const regions = Object.values(this.gameState.regions);
        const selectedId = this.selectedRegionId;
        const hoveredId = this.hoveredRegionId;
        const pulse = (Math.sin(this.pulseTime) + 1) * 0.5; // 0 to 1

        for (const r of regions) {
            if (!r.path2d && r.path) {
                try { r.path2d = new Path2D(r.path); } catch (e) { /* ignore */ }
            }

            const faction = FACTIONS[r.owner.toUpperCase()] || FACTIONS.NEUTRAL;
            const isSelected = r.id === selectedId;
            const isHovered = r.id === hoveredId;
            const isTarget = this.highlightedTargetIds.includes(r.id);

            if (r.path2d) {
                // High-performance Path2D rendering
                ctx.fillStyle = faction.color;
                ctx.globalAlpha = isSelected ? 0.95 : (isHovered ? 0.90 : 0.78);
                ctx.fill(r.path2d);

                ctx.globalAlpha = 1.0;
                if (isSelected) {
                    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
                    ctx.lineWidth = 7 + pulse * 2;
                    ctx.stroke(r.path2d);

                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 3.0;
                    ctx.stroke(r.path2d);
                } else if (isTarget) {
                    const isFriendly = selectedId && this.gameState.isAllied(this.gameState.regions[selectedId]?.owner, r.owner);
                    const glowCol = isFriendly ? 'rgba(56, 189, 248, 0.45)' : 'rgba(239, 68, 68, 0.45)';
                    const coreCol = isFriendly ? '#38bdf8' : '#ef4444';

                    ctx.strokeStyle = glowCol;
                    ctx.lineWidth = 6 + pulse * 2;
                    ctx.stroke(r.path2d);

                    ctx.strokeStyle = coreCol;
                    ctx.lineWidth = 2.5;
                    ctx.stroke(r.path2d);
                } else if (isHovered) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.lineWidth = 4.5;
                    ctx.stroke(r.path2d);

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.0;
                    ctx.stroke(r.path2d);
                } else if (this.playerFactionId && r.owner === this.playerFactionId) {
                    ctx.strokeStyle = faction.accentColor || '#38bdf8';
                    ctx.lineWidth = 2.2 + pulse * 0.8;
                    ctx.stroke(r.path2d);
                } else {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
                    ctx.lineWidth = 1.2;
                    ctx.stroke(r.path2d);
                }
            } else if (r.projectedPolygons && r.projectedPolygons.length > 0) {
                // Direct Canvas path rendering for MultiPolygons
                ctx.beginPath();
                for (const poly of r.projectedPolygons) {
                    for (const ring of poly) {
                        if (!ring || ring.length < 3) continue;
                        ctx.moveTo(ring[0][0], ring[0][1]);
                        for (let i = 1; i < ring.length; i++) {
                            ctx.lineTo(ring[i][0], ring[i][1]);
                        }
                        ctx.closePath();
                    }
                }

                ctx.fillStyle = faction.color;
                ctx.globalAlpha = isSelected ? 0.95 : (isHovered ? 0.90 : 0.78);
                ctx.fill();

                ctx.globalAlpha = 1.0;
                if (isSelected) {
                    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
                    ctx.lineWidth = 7 + pulse * 2;
                    ctx.stroke();

                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 3.0;
                    ctx.stroke();
                } else if (isTarget) {
                    const isFriendly = selectedId && this.gameState.isAllied(this.gameState.regions[selectedId]?.owner, r.owner);
                    ctx.strokeStyle = isFriendly ? 'rgba(56, 189, 248, 0.45)' : 'rgba(239, 68, 68, 0.45)';
                    ctx.lineWidth = 6 + pulse * 2;
                    ctx.stroke();

                    ctx.strokeStyle = isFriendly ? '#38bdf8' : '#ef4444';
                    ctx.lineWidth = 2.5;
                    ctx.stroke();
                } else if (isHovered) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.lineWidth = 4.5;
                    ctx.stroke();

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.0;
                    ctx.stroke();
                } else if (this.playerFactionId && r.owner === this.playerFactionId) {
                    ctx.strokeStyle = faction.accentColor || '#38bdf8';
                    ctx.lineWidth = 2.2 + pulse * 0.8;
                    ctx.stroke();
                } else {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                }
            } else if (r.polygon && r.polygon.length >= 3) {
                // Fallback for simple polygon arrays
                ctx.beginPath();
                ctx.moveTo(r.polygon[0][0], r.polygon[0][1]);
                for (let i = 1; i < r.polygon.length; i++) {
                    ctx.lineTo(r.polygon[i][0], r.polygon[i][1]);
                }
                ctx.closePath();

                ctx.fillStyle = faction.color;
                ctx.globalAlpha = isSelected ? 0.95 : (isHovered ? 0.90 : 0.78);
                ctx.fill();

                ctx.globalAlpha = 1.0;
                if (isSelected) {
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 3.0;
                    ctx.stroke();
                } else if (isHovered) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.0;
                    ctx.stroke();
                } else {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                }
            }
        }
    }

    _renderFrontlines(ctx) {
        // Draw connection lines to active targets or subtle hostile frontlines
        const regions = Object.values(this.gameState.regions);
        const selectedId = this.selectedRegionId;
        const targetIds = this.highlightedTargetIds;

        ctx.save();
        ctx.setLineDash([4, 6]);

        for (const r of regions) {
            for (const nId of r.neighbors) {
                const neighbor = this.gameState.regions[nId];
                if (!neighbor) continue;

                // Priority: Draw active target lines from selected region
                if (selectedId && r.id === selectedId && targetIds.includes(nId)) {
                    const isFriendly = r.owner === neighbor.owner;
                    ctx.strokeStyle = isFriendly ? '#38bdf8' : '#ef4444';
                    ctx.lineWidth = 2.4;
                    ctx.lineDashOffset = -this.pulseTime * 4;
                    ctx.beginPath();
                    ctx.moveTo(r.x, r.y);
                    ctx.lineTo(neighbor.x, neighbor.y);
                    ctx.stroke();
                } else if (!selectedId && r.id < neighbor.id) {
                    // Idle state: only very subtle hostile frontlines to prevent clutter
                    if (r.owner !== neighbor.owner && r.owner !== 'neutral' && neighbor.owner !== 'neutral') {
                        ctx.strokeStyle = 'rgba(239, 68, 68, 0.16)';
                        ctx.lineWidth = 1;
                        ctx.lineDashOffset = 0;
                        ctx.beginPath();
                        ctx.moveTo(r.x, r.y);
                        ctx.lineTo(neighbor.x, neighbor.y);
                        ctx.stroke();
                    }
                }
            }
        }
        ctx.restore();
    }

    _renderRegionBadges(ctx) {
        const regions = Object.values(this.gameState.regions);
        const isFarOverview = this.scale < 0.48;

        for (const r of regions) {
            const faction = FACTIONS[r.owner.toUpperCase()] || FACTIONS.NEUTRAL;
            const cx = r.x;
            const cy = r.y;

            ctx.save();

            const localizedName = (i18n.getRegionName(r.id) || r.name).toUpperCase();
            if (!r._cachedNameWidths) r._cachedNameWidths = {};
            const lang = i18n.currentLang || 'tr';
            if (r._cachedNameWidths[lang] === undefined) {
                r._cachedNameWidths[lang] = ctx.measureText(localizedName).width;
            }

            if (isFarOverview) {
                // Sleek, minimal overview pill for far-out camera (no clutter, zero collision)
                ctx.font = 'bold 11px "Rajdhani", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const textW = Math.max(48, ctx.measureText(localizedName).width + 12);

                ctx.fillStyle = 'rgba(10, 15, 26, 0.88)';
                ctx.strokeStyle = faction.accentColor || 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(cx - textW / 2, cy - 8, textW, 16, 3);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = '#f8fafc';
                ctx.fillText(localizedName, cx, cy);

                // If capital, draw small gold star on left
                if (r.capital) {
                    this._drawVectorStar(ctx, cx - textW / 2 - 8, cy, 5, 5, 2.5, '#fbbf24');
                }
            } else {
                // Full tactical military badge with infantry, tank, aircraft counters
                ctx.font = 'bold 12px "Rajdhani", "Hiragino Sans", "Meiryo", "Roboto", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const textWidth = ctx.measureText(localizedName).width;

                // Name Tag Badge Background
                ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 1;
                ctx.fillRect(cx - textWidth / 2 - 8, cy - 26, textWidth + 16, 18);
                ctx.strokeRect(cx - textWidth / 2 - 8, cy - 26, textWidth + 16, 18);

                ctx.fillStyle = '#f8fafc';
                ctx.fillText(localizedName, cx, cy - 17);

                // Capital Star or Factory Icon
                if (r.capital) {
                    this._drawVectorStar(ctx, cx - textWidth / 2 - 12, cy - 17, 5, 6, 3, '#fbbf24');
                } else if (r.industry >= 4) {
                    this._drawVectorFactory(ctx, cx - textWidth / 2 - 12, cy - 17, '#38bdf8');
                }

                // 2. Unit Counters Badge (Military Stack Plate with Vector Silhouettes)
                const inf = r.units.infantry || 0;
                const arm = r.units.armor || 0;
                const air = r.units.air || 0;

                const badgeW = 92;
                const badgeH = 22;
                const badgeX = cx - badgeW / 2;
                const badgeY = cy + 2;

                // Plate Backdrop with faction accent
                ctx.fillStyle = 'rgba(10, 15, 26, 0.94)';
                ctx.strokeStyle = faction.accentColor || '#38bdf8';
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
                ctx.fill();
                ctx.stroke();

                // Inner divider lines between unit types
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(badgeX + 31, badgeY + 3);
                ctx.lineTo(badgeX + 31, badgeY + badgeH - 3);
                ctx.moveTo(badgeX + 62, badgeY + 3);
                ctx.lineTo(badgeX + 62, badgeY + badgeH - 3);
                ctx.stroke();

                ctx.font = 'bold 11px "Rajdhani", sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';

                // 1. Infantry Cell (Vector Soldier Helmet + Count)
                this._drawVectorInfantry(ctx, badgeX + 7, badgeY + 11, '#93c5fd');
                ctx.fillStyle = '#93c5fd';
                ctx.fillText(`${inf}`, badgeX + 15, badgeY + 11.5);

                // 2. Armor Cell (Vector WW2 Tank + Count)
                const armCol = arm > 0 ? '#facc15' : '#64748b';
                this._drawVectorArmor(ctx, badgeX + 38, badgeY + 11, armCol);
                ctx.fillStyle = armCol;
                ctx.fillText(`${arm}`, badgeX + 47, badgeY + 11.5);

                // 3. Air Cell (Vector Warplane + Count)
                const airCol = air > 0 ? '#f43f5e' : '#64748b';
                this._drawVectorAir(ctx, badgeX + 69, badgeY + 11, airCol);
                ctx.fillStyle = airCol;
                ctx.fillText(`${air}`, badgeX + 77, badgeY + 11.5);
            }

            ctx.restore();
        }
    }

    _drawVectorInfantry(ctx, x, y, color = '#93c5fd') {
        ctx.save();
        ctx.fillStyle = color;
        // Military combat helmet silhouette
        ctx.beginPath();
        ctx.arc(x, y - 1, 3.5, Math.PI, 0, false);
        ctx.lineTo(x + 5, y + 2);
        ctx.lineTo(x - 5, y + 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    _drawVectorArmor(ctx, x, y, color = '#facc15') {
        ctx.save();
        ctx.fillStyle = color;
        // WW2 Battle tank silhouette
        ctx.fillRect(x - 5, y - 2, 4, 1.2); // Gun barrel
        ctx.beginPath();
        ctx.arc(x, y - 1.5, 2.2, 0, Math.PI * 2); // Turret
        ctx.fill();
        ctx.fillRect(x - 4.5, y + 0.5, 9, 3); // Hull & tracks
        ctx.restore();
    }

    _drawVectorAir(ctx, x, y, color = '#f43f5e') {
        ctx.save();
        ctx.fillStyle = color;
        // Warplane fighter silhouette
        ctx.beginPath();
        ctx.moveTo(x, y - 4.5);
        ctx.lineTo(x + 4.5, y + 1);
        ctx.lineTo(x + 1, y);
        ctx.lineTo(x + 1, y + 3.5);
        ctx.lineTo(x + 2, y + 4.5);
        ctx.lineTo(x - 2, y + 4.5);
        ctx.lineTo(x - 1, y + 3.5);
        ctx.lineTo(x - 1, y);
        ctx.lineTo(x - 4.5, y + 1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    _drawVectorStar(ctx, cx, cy, spikes = 5, outerRadius = 6, innerRadius = 3, color = '#fbbf24') {
        ctx.save();
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
    }

    _drawVectorFactory(ctx, cx, cy, color = '#38bdf8') {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(cx - 5, cy + 4);
        ctx.lineTo(cx + 5, cy + 4);
        ctx.lineTo(cx + 5, cy - 1);
        ctx.lineTo(cx + 2, cy + 1);
        ctx.lineTo(cx + 2, cy - 2);
        ctx.lineTo(cx - 1, cy);
        ctx.lineTo(cx - 1, cy - 4);
        ctx.lineTo(cx - 5, cy - 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    _updateAnimations(timestamp) {
        for (let i = this.animations.length - 1; i >= 0; i--) {
            const anim = this.animations[i];
            const elapsed = timestamp - anim.startTime;
            anim.progress = Math.min(1.0, elapsed / anim.duration);

            if (anim.progress >= 1.0) {
                if (anim.type === 'artillery' || anim.type === 'air_strike') {
                    // Trigger explosion at target when projectile lands
                    this.addExplosion(anim.toRegionId);
                }
                this.animations.splice(i, 1);
            }
        }
    }

    _renderAnimations(ctx) {
        for (const anim of this.animations) {
            if (anim.type === 'artillery') {
                const t = anim.progress;
                // Parabolic trajectory
                const curX = anim.startX + (anim.targetX - anim.startX) * t;
                const curY = anim.startY + (anim.targetY - anim.startY) * t - Math.sin(t * Math.PI) * 60;

                ctx.save();
                // Outer glow disc
                ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
                ctx.beginPath();
                ctx.arc(curX, curY, 8, 0, Math.PI * 2);
                ctx.fill();

                // Tracer projectile core
                ctx.fillStyle = '#fbbf24';
                ctx.beginPath();
                ctx.arc(curX, curY, 4, 0, Math.PI * 2);
                ctx.fill();

                // Tracer Tail
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(anim.startX, anim.startY);
                ctx.lineTo(curX, curY);
                ctx.stroke();
                ctx.restore();
            } else if (anim.type === 'air_strike') {
                const t = anim.progress;
                const curX = anim.startX + (anim.targetX - anim.startX) * t;
                const curY = anim.startY + (anim.targetY - anim.startY) * t;
                const angle = Math.atan2(anim.targetY - anim.startY, anim.targetX - anim.startX);

                ctx.save();
                ctx.translate(curX, curY);
                ctx.rotate(angle + Math.PI / 2);
                ctx.fillStyle = '#38bdf8';
                ctx.strokeStyle = '#0284c7';
                ctx.lineWidth = 1.5;

                // Sleek tactical fighter silhouette
                ctx.beginPath();
                ctx.moveTo(0, -12);
                ctx.lineTo(2.5, -2);
                ctx.lineTo(13, 3);
                ctx.lineTo(13, 6);
                ctx.lineTo(2.5, 4);
                ctx.lineTo(2.5, 10);
                ctx.lineTo(6, 13);
                ctx.lineTo(6, 15);
                ctx.lineTo(0, 13);
                ctx.lineTo(-6, 15);
                ctx.lineTo(-6, 13);
                ctx.lineTo(-2.5, 10);
                ctx.lineTo(-2.5, 4);
                ctx.lineTo(-13, 6);
                ctx.lineTo(-13, 3);
                ctx.lineTo(-2.5, -2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            } else if (anim.type === 'explosion') {
                const t = anim.progress;
                const radius = anim.radius + (anim.maxRadius - anim.radius) * t;
                const alpha = 1.0 - t;

                ctx.save();
                ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
                ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 0.45})`;
                ctx.lineWidth = 3;

                ctx.beginPath();
                ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    _renderOverlayHUD(ctx, w, h) {
        // Subtle corner crosshairs
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;

        const size = 16;
        // Top Left
        ctx.strokeRect(15, 15, size, size);
        // Top Right
        ctx.strokeRect(w - 15 - size, 15, size, size);
        // Bottom Left
        ctx.strokeRect(15, h - 15 - size, size, size);
        // Bottom Right
        ctx.strokeRect(w - 15 - size, h - 15 - size, size, size);

        ctx.restore();
    }
}
