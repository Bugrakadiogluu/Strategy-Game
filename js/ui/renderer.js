/**
 * renderer.js - HTML5 Canvas 2D Tactical Map Renderer
 * Renders European/North African theater regions, unit counters, capitals,
 * industrial assets, Pan/Zoom transformations, combat animations, and tactical overlays.
 */

import { FACTIONS } from '../network/protocol.js';

export class MapRenderer {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;

        // Viewport Transform (Pan & Zoom)
        this.scale = 1.0;
        this.minScale = 0.55;
        this.maxScale = 2.6;
        this.offsetX = 0;
        this.offsetY = 0;

        // Interactive States
        this.hoveredRegionId = null;
        this.selectedRegionId = null;
        this.highlightedTargetIds = []; // Valid neighbors for attack or move

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

    fitToScreen() {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        // Use exact client bounding rect of the canvas element itself (not parent)
        this.canvas.width = Math.round(rect.width) || 1000;
        this.canvas.height = Math.round(rect.height) || 750;

        // Center map
        const mapW = this.gameState.dimensions.width;
        const mapH = this.gameState.dimensions.height;

        const scaleX = this.canvas.width / mapW;
        const scaleY = this.canvas.height / mapH;
        this.scale = Math.min(scaleX, scaleY) * 0.95;
        this.scale = Math.max(this.minScale, Math.min(this.scale, this.maxScale));

        this.offsetX = (this.canvas.width - mapW * this.scale) / 2;
        this.offsetY = (this.canvas.height - mapH * this.scale) / 2;
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

        // 1. Native Path2D point-in-path test (accurate curves, bays, natural peninsulas)
        for (let i = regions.length - 1; i >= 0; i--) {
            const r = regions[i];
            if (!r.path2d && r.path) {
                try { r.path2d = new Path2D(r.path); } catch (e) { /* ignore */ }
            }
            if (r.path2d && this._scratchCtx.isPointInPath(r.path2d, worldX, worldY)) {
                return r.id;
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

        this._render();
        this._updateAnimations(timestamp);

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
            { name: 'KUZEY ATLANTİK OKYANUSU', x: 150, y: 410, angle: -0.15 },
            { name: 'KUZEY DENİZİ', x: 470, y: 280, angle: 0 },
            { name: 'BALTIK DENİZİ', x: 740, y: 230, angle: 0.25 },
            { name: 'BATI AKDENİZ', x: 460, y: 720, angle: 0 },
            { name: 'ORTA VE DOĞU AKDENİZ', x: 750, y: 750, angle: 0 },
            { name: 'KARADENİZ', x: 990, y: 550, angle: 0 },
            { name: 'HAZAR DENİZİ', x: 1330, y: 580, angle: 0.1 }
        ];

        ctx.save();
        ctx.font = 'bold 13px "Orbitron", monospace, sans-serif';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (const s of seas) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.angle || 0);
            ctx.fillText(s.name, 0, 0);
            ctx.restore();
        }
        ctx.restore();
    }

    _renderTacticalOcean(ctx, w, h) {
        // Deep naval war-room gradient
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#0a0e17');
        bgGrad.addColorStop(0.5, '#0f172a');
        bgGrad.addColorStop(1, '#080d1a');
        ctx.fillStyle = bgGrad;
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

        // Subtle topographic / radar scan arc
        const radarAngle = (this.pulseTime * 0.4) % (Math.PI * 2);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(radarAngle);
        const radarGrad = ctx.createRadialGradient(0, 0, 50, 0, 0, Math.max(w, h));
        radarGrad.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
        radarGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
        ctx.fillStyle = radarGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, Math.max(w, h), 0, Math.PI / 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    _renderRegions(ctx) {
        const regions = Object.values(this.gameState.regions);
        const selectedId = this.selectedRegionId;
        const hoveredId = this.hoveredRegionId;
        const pulse = (Math.sin(this.pulseTime) + 1) * 0.5; // 0 to 1

        // 1. First pass: Coastal water glow / shelf halo around landmasses
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 8;
        ctx.lineJoin = 'round';
        for (const r of regions) {
            if (!r.path2d && r.path) {
                try { r.path2d = new Path2D(r.path); } catch (e) { /* ignore */ }
            }
            if (r.path2d) {
                ctx.stroke(r.path2d);
            }
        }
        ctx.restore();

        // 2. Second pass: Fill realistic landmasses and draw tactical boundaries
        for (const r of regions) {
            if (!r.path2d && r.path) {
                try { r.path2d = new Path2D(r.path); } catch (e) { /* ignore */ }
            }

            const faction = FACTIONS[r.owner.toUpperCase()] || FACTIONS.NEUTRAL;
            const isSelected = r.id === selectedId;
            const isHovered = r.id === hoveredId;
            const isTarget = this.highlightedTargetIds.includes(r.id);

            if (r.path2d) {
                // Polygon Fill using authentic SVG curved landmass
                ctx.fillStyle = faction.color;
                ctx.globalAlpha = isSelected ? 0.92 : (isHovered ? 0.88 : 0.72);
                ctx.fill(r.path2d);

                // Tactical Border & Glow
                ctx.globalAlpha = 1.0;
                if (isSelected) {
                    ctx.strokeStyle = '#f59e0b'; // Amber tactical selection
                    ctx.lineWidth = 3.5 + pulse * 1.5;
                    ctx.shadowColor = '#f59e0b';
                    ctx.shadowBlur = 16;
                } else if (isTarget) {
                    const isFriendly = selectedId && this.gameState.regions[selectedId].owner === r.owner;
                    ctx.strokeStyle = isFriendly ? '#38bdf8' : '#ef4444';
                    ctx.lineWidth = 2.8 + pulse * 1.5;
                    ctx.shadowColor = isFriendly ? '#38bdf8' : '#ef4444';
                    ctx.shadowBlur = 12;
                } else if (isHovered) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.4;
                    ctx.shadowColor = '#ffffff';
                    ctx.shadowBlur = 9;
                } else {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
                    ctx.lineWidth = 1.4;
                    ctx.shadowBlur = 0;
                }

                ctx.stroke(r.path2d);
                ctx.shadowBlur = 0;
            } else if (r.polygon && r.polygon.length >= 3) {
                // Fallback for polygon arrays
                ctx.beginPath();
                ctx.moveTo(r.polygon[0][0], r.polygon[0][1]);
                for (let i = 1; i < r.polygon.length; i++) {
                    ctx.lineTo(r.polygon[i][0], r.polygon[i][1]);
                }
                ctx.closePath();

                ctx.fillStyle = faction.color;
                ctx.globalAlpha = isSelected ? 0.92 : (isHovered ? 0.88 : 0.72);
                ctx.fill();

                ctx.globalAlpha = 1.0;
                if (isSelected) {
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 3.5 + pulse * 1.5;
                    ctx.shadowColor = '#f59e0b';
                    ctx.shadowBlur = 16;
                } else if (isTarget) {
                    const isFriendly = selectedId && this.gameState.regions[selectedId].owner === r.owner;
                    ctx.strokeStyle = isFriendly ? '#38bdf8' : '#ef4444';
                    ctx.lineWidth = 2.8 + pulse * 1.5;
                    ctx.shadowColor = isFriendly ? '#38bdf8' : '#ef4444';
                    ctx.shadowBlur = 12;
                } else if (isHovered) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2.4;
                    ctx.shadowColor = '#ffffff';
                    ctx.shadowBlur = 9;
                } else {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
                    ctx.lineWidth = 1.4;
                    ctx.shadowBlur = 0;
                }

                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }
    }

    _renderFrontlines(ctx) {
        // Draw subtle dotted connection lines between adjacent regions
        const regions = Object.values(this.gameState.regions);
        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1;

        for (const r of regions) {
            for (const nId of r.neighbors) {
                const neighbor = this.gameState.regions[nId];
                if (!neighbor) continue;
                // Avoid drawing duplicates (draw when r.id < nId)
                if (r.id < neighbor.id) {
                    const isHostileFront = r.owner !== neighbor.owner;
                    ctx.strokeStyle = isHostileFront ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.15)';
                    ctx.beginPath();
                    ctx.moveTo(r.x, r.y);
                    ctx.lineTo(neighbor.x, neighbor.y);
                    ctx.stroke();
                }
            }
        }
        ctx.restore();
    }

    _renderRegionBadges(ctx) {
        const regions = Object.values(this.gameState.regions);

        for (const r of regions) {
            const faction = FACTIONS[r.owner.toUpperCase()] || FACTIONS.NEUTRAL;
            const cx = r.x;
            const cy = r.y;

            ctx.save();

            // 1. Regional Name Tag
            ctx.font = 'bold 12px "Rajdhani", "Roboto", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const name = r.name.toUpperCase();
            const textWidth = ctx.measureText(name).width;

            // Name Tag Badge Background
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.fillRect(cx - textWidth / 2 - 8, cy - 26, textWidth + 16, 18);
            ctx.strokeRect(cx - textWidth / 2 - 8, cy - 26, textWidth + 16, 18);

            ctx.fillStyle = '#f8fafc';
            ctx.fillText(name, cx, cy - 17);

            // Capital Star or Factory Icon
            if (r.capital) {
                ctx.font = '14px sans-serif';
                ctx.fillText('⭐', cx - textWidth / 2 - 18, cy - 17);
            } else if (r.industry >= 4) {
                ctx.font = '12px sans-serif';
                ctx.fillText('🏭', cx - textWidth / 2 - 16, cy - 17);
            }

            // 2. Unit Counters Badge (Military Stack Plate)
            const inf = r.units.infantry || 0;
            const arm = r.units.armor || 0;
            const air = r.units.air || 0;

            const badgeW = 90;
            const badgeH = 24;
            const badgeX = cx - badgeW / 2;
            const badgeY = cy + 2;

            // Plate Backdrop
            ctx.fillStyle = 'rgba(10, 15, 26, 0.90)';
            ctx.strokeStyle = faction.accentColor || '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
            ctx.fill();
            ctx.stroke();

            // Unit Icons and Counts inside badge
            ctx.font = '11px "Rajdhani", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Infantry (🪖)
            ctx.fillStyle = '#93c5fd';
            ctx.fillText(`🪖 ${inf}`, badgeX + 16, badgeY + 12);

            // Armor (🚜)
            ctx.fillStyle = arm > 0 ? '#facc15' : '#64748b';
            ctx.fillText(`🚜 ${arm}`, badgeX + 45, badgeY + 12);

            // Air (✈️)
            ctx.fillStyle = air > 0 ? '#f43f5e' : '#64748b';
            ctx.fillText(`✈️ ${air}`, badgeX + 74, badgeY + 12);

            ctx.restore();
        }
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

                // Tracer projectile glow
                ctx.save();
                ctx.fillStyle = '#fbbf24';
                ctx.shadowColor = '#f59e0b';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(curX, curY, 4, 0, Math.PI * 2);
                ctx.fill();

                // Tracer Tail
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
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

                ctx.save();
                ctx.font = '22px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = '#f43f5e';
                ctx.shadowBlur = 12;
                ctx.fillText('✈️', curX, curY);
                ctx.restore();
            } else if (anim.type === 'explosion') {
                const t = anim.progress;
                const radius = anim.radius + (anim.maxRadius - anim.radius) * t;
                const alpha = 1.0 - t;

                ctx.save();
                ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
                ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 0.45})`;
                ctx.lineWidth = 3;
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 20;

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
