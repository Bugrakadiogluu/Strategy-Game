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

    for (let i = 0; i < n - 1; i++) {
        const p1 = ring[i];
        const p2 = ring[i + 1];
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
