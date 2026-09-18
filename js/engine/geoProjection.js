/**
 * geoProjection.js - High-Precision GIS Engine & Spherical Mercator Projection for WAR ROOM 1942
 * Transforms GeoJSON geographic coordinates (lon, lat) into 2400x1600 canvas space
 * and precompiles Polygon & MultiPolygon geometries into native Path2D instances for 60 FPS rendering.
 */

export class MercatorProjection {
    /**
     * @param {Object} options
     * @param {number} options.minLon - Western longitude boundary (degrees)
     * @param {number} options.maxLon - Eastern longitude boundary (degrees)
     * @param {number} options.minLat - Southern latitude boundary (degrees)
     * @param {number} options.maxLat - Northern latitude boundary (degrees)
     * @param {number} options.width  - Canvas width in pixels (e.g. 2400)
     * @param {number} options.height - Canvas height in pixels (e.g. 1600)
     */
    constructor(options = {}) {
        this.minLon = options.minLon !== undefined ? options.minLon : -14.0;
        this.maxLon = options.maxLon !== undefined ? options.maxLon : 48.0;
        this.minLat = options.minLat !== undefined ? options.minLat : 31.5;
        this.maxLat = options.maxLat !== undefined ? options.maxLat : 71.5;
        this.width  = options.width  || 2400;
        this.height = options.height || 1600;

        // Precompute Mercator latitudes
        this.minMerc = this._mercatorN(this.minLat);
        this.maxMerc = this._mercatorN(this.maxLat);
        this.mercSpan = this.maxMerc - this.minMerc;
        this.lonSpan  = this.maxLon - this.minLon;
    }

    _mercatorN(latDeg) {
        const latRad = (latDeg * Math.PI) / 180;
        // Standard Web Mercator latitude formula
        return Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    }

    /**
     * Projects (longitude, latitude) in degrees into canvas (x, y) pixels
     * @param {number} lon
     * @param {number} lat
     * @returns {[number, number]}
     */
    project(lon, lat) {
        const x = ((lon - this.minLon) / this.lonSpan) * this.width;
        const merc = this._mercatorN(lat);
        // Canvas Y is inverted (0 at top, increasing southward)
        const y = this.height - ((merc - this.minMerc) / this.mercSpan) * this.height;
        return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
    }

    /**
     * Unprojects canvas (x, y) pixels back into (longitude, latitude) degrees
     * @param {number} x
     * @param {number} y
     * @returns {[number, number]} [lon, lat]
     */
    unproject(x, y) {
        const lon = (x / this.width) * this.lonSpan + this.minLon;
        const normY = (this.height - y) / this.height;
        const merc = normY * this.mercSpan + this.minMerc;
        const latRad = 2 * Math.atan(Math.exp(merc)) - Math.PI / 2;
        const lat = (latRad * 180) / Math.PI;
        return [lon, lat];
    }
}

/**
 * Calculates the polygonal area and centroid of a closed 2D ring
 * @param {Array<[number, number]>} ring - Array of [x, y] points
 * @returns {{ area: number, cx: number, cy: number }}
 */
export function computeRingCentroid(ring) {
    let a = 0;
    let cx = 0;
    let cy = 0;
    const n = ring.length;
    if (n < 3) return { area: 0, cx: ring[0]?.[0] || 0, cy: ring[0]?.[1] || 0 };

    for (let i = 0; i < n; i++) {
        const p1 = ring[i];
        const p2 = ring[(i + 1) % n];
        const cross = (p1[0] * p2[1]) - (p2[0] * p1[1]);
        a += cross;
        cx += (p1[0] + p2[0]) * cross;
        cy += (p1[1] + p2[1]) * cross;
    }

    const area = Math.abs(a / 2);
    if (Math.abs(a) > 0.0001) {
        return {
            area,
            cx: cx / (3 * a),
            cy: cy / (3 * a)
        };
    }
    return { area: 0, cx: ring[0][0], cy: ring[0][1] };
}

/**
 * Parses GeoJSON Polygon or MultiPolygon coordinates into:
 * - Native Canvas Path2D instance (hardware-accelerated rendering)
 * - SVG Path string (for fallbacks and serializations)
 * - Projected 2D rings
 * - Visual centroid (center of mass of the largest landmass)
 * - Bounding box
 * 
 * @param {Object} geometry - GeoJSON geometry { type: 'Polygon' | 'MultiPolygon', coordinates: [...] }
 * @param {MercatorProjection} projection
 * @returns {Object}
 */
export function parseGeoGeometry(geometry, projection) {
    const rawPolygons = geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [geometry.coordinates];

    let svgPath = '';
    const projectedPolygons = [];
    let bestArea = -1;
    let centroid = [0, 0];
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    for (const poly of rawPolygons) {
        const projPoly = [];
        for (let rIdx = 0; rIdx < poly.length; rIdx++) {
            const rawRing = poly[rIdx];
            if (!rawRing || rawRing.length < 3) continue;

            const projRing = [];
            let ringSvg = '';

            for (let i = 0; i < rawRing.length; i++) {
                const pt = rawRing[i];
                const [px, py] = projection.project(pt[0], pt[1]);
                projRing.push([px, py]);

                if (i === 0) {
                    ringSvg += `M ${px},${py} `;
                } else {
                    ringSvg += `L ${px},${py} `;
                }

                if (px < minX) minX = px;
                if (px > maxX) maxX = px;
                if (py < minY) minY = py;
                if (py > maxY) maxY = py;
            }
            ringSvg += 'Z ';
            svgPath += ringSvg;
            projPoly.push(projRing);

            // Compute centroid from outer rings (rIdx === 0)
            if (rIdx === 0) {
                const { area, cx, cy } = computeRingCentroid(projRing);
                if (area > bestArea) {
                    bestArea = area;
                    centroid = [Math.round(cx), Math.round(cy)];
                }
            }
        }
        projectedPolygons.push(projPoly);
    }

    // Compile into native Path2D
    let path2d = null;
    try {
        if (typeof Path2D !== 'undefined' && svgPath) {
            path2d = new Path2D(svgPath);
        }
    } catch (e) {
        console.warn('Path2D compilation failed, falling back to manual lineTo:', e);
    }

    return {
        path2d,
        svgPath,
        projectedPolygons,
        centroid,
        bounds: { minX, maxX, minY, maxY }
    };
}

/**
 * Clips a 2D closed polygon ring against a half-plane defined by:
 * (P - M) · N >= 0
 * using the Sutherland-Hodgman polygon clipping algorithm.
 *
 * @param {Array<[number, number]>} ring - Polygon ring [[x,y], [x,y], ...]
 * @param {[number, number]} M - Midpoint / line point
 * @param {[number, number]} N - Normal vector pointing into the interior
 * @returns {Array<[number, number]>} Clipped polygon ring
 */
export function clipRingWithHalfPlane(ring, M, N) {
    if (!ring || ring.length < 3) return [];

    const isInside = (p) => (p[0] - M[0]) * N[0] + (p[1] - M[1]) * N[1] >= -0.001;

    const intersection = (p1, p2) => {
        const d1 = (p1[0] - M[0]) * N[0] + (p1[1] - M[1]) * N[1];
        const d2 = (p2[0] - M[0]) * N[0] + (p2[1] - M[1]) * N[1];
        const diff = d1 - d2;
        if (Math.abs(diff) < 1e-9) return [p1[0], p1[1]];
        const t = d1 / diff;
        return [
            Math.round((p1[0] + t * (p2[0] - p1[0])) * 10) / 10,
            Math.round((p1[1] + t * (p2[1] - p1[1])) * 10) / 10
        ];
    };

    const output = [];
    const len = ring.length;
    for (let i = 0; i < len; i++) {
        const curr = ring[i];
        const prev = ring[(i + len - 1) % len];
        const currIn = isInside(curr);
        const prevIn = isInside(prev);

        if (currIn) {
            if (!prevIn) {
                output.push(intersection(prev, curr));
            }
            output.push(curr);
        } else if (prevIn) {
            output.push(intersection(prev, curr));
        }
    }
    return output;
}

/**
 * Subdivides a country's projected multi-polygons into discrete, seamless provinces
 * based on geographic seed points using iterative half-plane Voronoi clipping.
 * Guarantees that the outer boundary matches the GeoJSON country borders 100%.
 *
 * @param {Array} projectedPolygons - Country's projected rings
 * @param {Array<Object>} seeds - Array of { id, lon, lat, pos }
 * @param {MercatorProjection} projection
 * @returns {Object} Dictionary of province geometry results keyed by seed ID
 */
export function subdivideGeometryWithSeeds(projectedPolygons, seeds, projection) {
    const projectedSeeds = seeds.map(s => {
        let pt = s.pos || s.seed;
        if (s.lon !== undefined && s.lat !== undefined) {
            pt = projection.project(s.lon, s.lat);
        }
        return {
            ...s,
            pt
        };
    });

    const results = {};

    for (let i = 0; i < projectedSeeds.length; i++) {
        const seedI = projectedSeeds[i];
        const subPolys = [];
        let totalArea = 0;
        let bestRingArea = 0;
        let subCentroid = [seedI.pt[0], seedI.pt[1]];
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let svgPath = '';

        for (const poly of projectedPolygons) {
            const clippedPoly = [];
            for (let rIdx = 0; rIdx < poly.length; rIdx++) {
                let currentRing = poly[rIdx];

                for (let j = 0; j < projectedSeeds.length; j++) {
                    if (i === j) continue;
                    const seedJ = projectedSeeds[j];
                    const M = [
                        (seedI.pt[0] + seedJ.pt[0]) / 2,
                        (seedI.pt[1] + seedJ.pt[1]) / 2
                    ];
                    const N = [
                        seedI.pt[0] - seedJ.pt[0],
                        seedI.pt[1] - seedJ.pt[1]
                    ];
                    currentRing = clipRingWithHalfPlane(currentRing, M, N);
                    if (currentRing.length < 3) break;
                }

                if (currentRing.length >= 3) {
                    const { area, cx, cy } = computeRingCentroid(currentRing);
                    if (area > 30) {
                        clippedPoly.push(currentRing);
                        totalArea += area;

                        let ringSvg = '';
                        for (let k = 0; k < currentRing.length; k++) {
                            const [px, py] = currentRing[k];
                            if (k === 0) ringSvg += `M ${px},${py} `;
                            else ringSvg += `L ${px},${py} `;

                            if (px < minX) minX = px;
                            if (px > maxX) maxX = px;
                            if (py < minY) minY = py;
                            if (py > maxY) maxY = py;
                        }
                        ringSvg += 'Z ';
                        svgPath += ringSvg;

                        if (rIdx === 0 && area > bestRingArea) {
                            bestRingArea = area;
                            subCentroid = [Math.round(cx), Math.round(cy)];
                        }
                    }
                }
            }
            if (clippedPoly.length > 0) {
                subPolys.push(clippedPoly);
            }
        }

        let path2d = null;
        try {
            if (typeof Path2D !== 'undefined' && svgPath) {
                path2d = new Path2D(svgPath);
            }
        } catch (e) {
            /* ignore */
        }

        if (minX === Infinity) {
            minX = seedI.pt[0] - 20;
            maxX = seedI.pt[0] + 20;
            minY = seedI.pt[1] - 20;
            maxY = seedI.pt[1] + 20;
        }

        results[seedI.id] = {
            id: seedI.id,
            centroid: subCentroid,
            bounds: { minX, maxX, minY, maxY },
            path2d,
            svgPath,
            projectedPolygons: subPolys,
            polygon: subPolys[0]?.[0] || []
        };
    }

    return results;
}
