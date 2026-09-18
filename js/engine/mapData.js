/**
 * mapData.js - Real-World European Theater WW2 Map Data Engine
 * Powered by Authentic GeoJSON Geography & Spherical Mercator Projection.
 * Completely replaces all handcoded/low-poly polygon approximations.
 */

import { EUROPE_GEOJSON } from '../data/europeGeoJson.js';
import { MercatorProjection, parseGeoGeometry } from './geoProjection.js';

export const MAP_DIMENSIONS = {
    width: 2400,
    height: 1600
};

export const GEO_PROJECTION_CONFIG = {
    minLon: -14.0,
    maxLon: 48.0,
    minLat: 31.5,
    maxLat: 71.5,
    width: 2400,
    height: 1600
};

/**
 * Historical WW2 Country Configuration Table for all 51 GeoJSON Features
 * Keyed by uppercase ISO2 code.
 */
export const COUNTRY_METADATA = {
    // -------------------------------------------------------------------------
    // 1. GERMANY & CENTRAL AXIS
    // -------------------------------------------------------------------------
    DE: {
        id: 'de',
        name: 'Almanya',
        owner: 'germany',
        capital: true,
        capitalCity: 'Berlin',
        industry: 14,
        terrain: 'city',
        initialUnits: { infantry: 10, armor: 5, air: 4 },
        neighbors: ['pl', 'cz', 'at', 'ch', 'fr', 'be', 'nl', 'dk', 'gb', 'lu'],
        aliases: ['germany', 'berlin']
    },
    AT: {
        id: 'at',
        name: 'Avusturya',
        owner: 'germany',
        capital: false,
        industry: 2,
        terrain: 'mountains',
        initialUnits: { infantry: 3, armor: 1, air: 0 },
        neighbors: ['de', 'cz', 'sk', 'hu', 'si', 'it', 'ch', 'li'],
        aliases: ['austria']
    },
    CZ: {
        id: 'cz',
        name: 'Çekya (Bohemya)',
        owner: 'germany',
        capital: false,
        industry: 3,
        terrain: 'plains',
        initialUnits: { infantry: 3, armor: 1, air: 0 },
        neighbors: ['de', 'pl', 'sk', 'at'],
        aliases: ['czechia', 'czech_republic']
    },

    // -------------------------------------------------------------------------
    // 2. UNITED KINGDOM & ALLIED ISLES / BASES
    // -------------------------------------------------------------------------
    GB: {
        id: 'gb',
        name: 'Birleşik Krallık',
        owner: 'uk',
        capital: true,
        capitalCity: 'Londra',
        industry: 10,
        terrain: 'city',
        initialUnits: { infantry: 8, armor: 3, air: 3 },
        neighbors: ['ie', 'fr', 'no', 'de', 'nl', 'is', 'mt', 'cy', 'fo'],
        aliases: ['uk', 'london', 'britain', 'united_kingdom']
    },
    IE: {
        id: 'ie',
        name: 'İrlanda',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'plains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['gb'],
        aliases: ['ireland']
    },
    IS: {
        id: 'is',
        name: 'İzlanda',
        owner: 'uk',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 2, armor: 0, air: 1 },
        neighbors: ['gb'],
        aliases: ['iceland']
    },
    FO: {
        id: 'fo',
        name: 'Faroe Adaları',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'coastal',
        initialUnits: { infantry: 1, armor: 0, air: 0 },
        neighbors: ['gb', 'no'],
        aliases: ['faroe']
    },

    // -------------------------------------------------------------------------
    // 3. SOVIET UNION & EASTERN FRONT
    // -------------------------------------------------------------------------
    RU: {
        id: 'ru',
        name: 'Sovyet Rusya',
        owner: 'ussr',
        capital: true,
        capitalCity: 'Moskova',
        industry: 10,
        terrain: 'city',
        initialUnits: { infantry: 10, armor: 4, air: 3 },
        neighbors: ['ua', 'by', 'ee', 'lv', 'fi', 'no', 'ge', 'az', 'pl', 'lt'],
        aliases: ['russia', 'moscow', 'ussr', 'soviet_union']
    },
    UA: {
        id: 'ua',
        name: 'Ukrayna',
        owner: 'ussr',
        capital: false,
        industry: 4,
        terrain: 'plains',
        initialUnits: { infantry: 5, armor: 2, air: 1 },
        neighbors: ['ru', 'by', 'pl', 'sk', 'hu', 'ro', 'md'],
        aliases: ['ukraine']
    },
    BY: {
        id: 'by',
        name: 'Belarus',
        owner: 'ussr',
        capital: false,
        industry: 3,
        terrain: 'plains',
        initialUnits: { infantry: 4, armor: 1, air: 1 },
        neighbors: ['ru', 'ua', 'pl', 'lt', 'lv'],
        aliases: ['belarus']
    },
    MD: {
        id: 'md',
        name: 'Moldova',
        owner: 'ussr',
        capital: false,
        industry: 1,
        terrain: 'plains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['ua', 'ro'],
        aliases: ['moldova']
    },
    EE: {
        id: 'ee',
        name: 'Estonya',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'plains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['ru', 'lv', 'fi'],
        aliases: ['estonia']
    },
    LV: {
        id: 'lv',
        name: 'Letonya',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'plains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['ru', 'by', 'lt', 'ee'],
        aliases: ['latvia']
    },
    LT: {
        id: 'lt',
        name: 'Litvanya',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'plains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['ru', 'by', 'pl', 'lv'],
        aliases: ['lithuania']
    },

    // -------------------------------------------------------------------------
    // 4. ITALY & MEDITERRANEAN AXIS
    // -------------------------------------------------------------------------
    IT: {
        id: 'it',
        name: 'İtalya',
        owner: 'italy',
        capital: true,
        capitalCity: 'Roma',
        industry: 8,
        terrain: 'city',
        initialUnits: { infantry: 7, armor: 2, air: 2 },
        neighbors: ['fr', 'ch', 'at', 'si', 'al', 'mt', 'gr', 'sm', 'va', 'mc'],
        aliases: ['italy', 'rome']
    },
    AL: {
        id: 'al',
        name: 'Arnavutluk',
        owner: 'italy',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['it', 'gr', 'mk', 'me', 'rs'],
        aliases: ['albania']
    },
    MT: {
        id: 'mt',
        name: 'Malta',
        owner: 'uk',
        capital: false,
        industry: 1,
        terrain: 'coastal',
        initialUnits: { infantry: 2, armor: 0, air: 1 },
        neighbors: ['it', 'gb'],
        aliases: ['malta']
    },
    SM: {
        id: 'sm',
        name: 'San Marino',
        owner: 'italy',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 1, armor: 0, air: 0 },
        neighbors: ['it'],
        aliases: ['san_marino']
    },
    VA: {
        id: 'va',
        name: 'Vatikan',
        owner: 'italy',
        capital: false,
        industry: 1,
        terrain: 'city',
        initialUnits: { infantry: 1, armor: 0, air: 0 },
        neighbors: ['it'],
        aliases: ['vatican']
    },

    // -------------------------------------------------------------------------
    // 5. FRANCE & WESTERN ALLIES
    // -------------------------------------------------------------------------
    FR: {
        id: 'fr',
        name: 'Fransa',
        owner: 'france',
        capital: true,
        capitalCity: 'Paris',
        industry: 7,
        terrain: 'city',
        initialUnits: { infantry: 7, armor: 3, air: 2 },
        neighbors: ['gb', 'be', 'lu', 'de', 'ch', 'it', 'es', 'ad', 'mc'],
        aliases: ['france', 'paris']
    },
    BE: {
        id: 'be',
        name: 'Belçika',
        owner: 'france',
        capital: false,
        industry: 2,
        terrain: 'plains',
        initialUnits: { infantry: 3, armor: 1, air: 0 },
        neighbors: ['fr', 'nl', 'de', 'lu'],
        aliases: ['belgium']
    },
    LU: {
        id: 'lu',
        name: 'Lüksemburg',
        owner: 'france',
        capital: false,
        industry: 1,
        terrain: 'plains',
        initialUnits: { infantry: 1, armor: 0, air: 0 },
        neighbors: ['fr', 'be', 'de'],
        aliases: ['luxembourg']
    },
    MC: {
        id: 'mc',
        name: 'Monako',
        owner: 'france',
        capital: false,
        industry: 1,
        terrain: 'coastal',
        initialUnits: { infantry: 1, armor: 0, air: 0 },
        neighbors: ['fr', 'it'],
        aliases: ['monaco']
    },

    // -------------------------------------------------------------------------
    // 6. SPAIN & IBERIAN PENINSULA
    // -------------------------------------------------------------------------
    ES: {
        id: 'es',
        name: 'İspanya',
        owner: 'spain',
        capital: true,
        capitalCity: 'Madrid',
        industry: 5,
        terrain: 'city',
        initialUnits: { infantry: 6, armor: 2, air: 1 },
        neighbors: ['fr', 'pt', 'ad'],
        aliases: ['spain', 'madrid']
    },
    PT: {
        id: 'pt',
        name: 'Portekiz',
        owner: 'spain',
        capital: false,
        industry: 2,
        terrain: 'coastal',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['es'],
        aliases: ['portugal']
    },
    AD: {
        id: 'ad',
        name: 'Andorra',
        owner: 'spain',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 1, armor: 0, air: 0 },
        neighbors: ['es', 'fr'],
        aliases: ['andorra']
    },

    // -------------------------------------------------------------------------
    // 7. TURKEY & STRAITS GUARDIAN / CAUCASUS
    // -------------------------------------------------------------------------
    TR: {
        id: 'tr',
        name: 'Türkiye',
        owner: 'turkey',
        capital: true,
        capitalCity: 'Ankara',
        industry: 5,
        terrain: 'city',
        initialUnits: { infantry: 6, armor: 2, air: 1 },
        neighbors: ['bg', 'gr', 'ge', 'am', 'az', 'cy', 'il'],
        aliases: ['turkey', 'ankara']
    },
    GE: {
        id: 'ge',
        name: 'Gürcistan',
        owner: 'turkey',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['tr', 'ru', 'az', 'am'],
        aliases: ['georgia']
    },
    AM: {
        id: 'am',
        name: 'Ermenistan',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['tr', 'ge', 'az'],
        aliases: ['armenia']
    },
    AZ: {
        id: 'az',
        name: 'Azerbaycan',
        owner: 'turkey',
        capital: false,
        industry: 2,
        terrain: 'plains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['tr', 'ru', 'ge', 'am'],
        aliases: ['azerbaijan']
    },
    CY: {
        id: 'cy',
        name: 'Kıbrıs',
        owner: 'uk',
        capital: false,
        industry: 1,
        terrain: 'coastal',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['tr', 'gb', 'gr', 'il'],
        aliases: ['cyprus']
    },
    IL: {
        id: 'il',
        name: 'Levant & Orta Doğu',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'coastal',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['tr', 'cy'],
        aliases: ['israel', 'levant']
    },

    // -------------------------------------------------------------------------
    // 8. NEUTRAL BUFFER STATES & BALKANS / SCANDINAVIA
    // -------------------------------------------------------------------------
    PL: {
        id: 'pl',
        name: 'Polonya',
        owner: 'neutral',
        capital: false,
        industry: 3,
        terrain: 'plains',
        initialUnits: { infantry: 4, armor: 1, air: 0 },
        neighbors: ['de', 'cz', 'sk', 'ua', 'by', 'lt', 'ru'],
        aliases: ['poland']
    },
    RO: {
        id: 'ro',
        name: 'Romanya',
        owner: 'neutral',
        capital: false,
        industry: 3,
        terrain: 'plains',
        initialUnits: { infantry: 4, armor: 1, air: 0 },
        neighbors: ['ua', 'md', 'hu', 'rs', 'bg'],
        aliases: ['romania']
    },
    BG: {
        id: 'bg',
        name: 'Bulgaristan',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'mountains',
        initialUnits: { infantry: 3, armor: 0, air: 0 },
        neighbors: ['ro', 'rs', 'mk', 'gr', 'tr'],
        aliases: ['bulgaria']
    },
    GR: {
        id: 'gr',
        name: 'Yunanistan',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'mountains',
        initialUnits: { infantry: 3, armor: 0, air: 1 },
        neighbors: ['al', 'mk', 'bg', 'tr', 'it', 'cy'],
        aliases: ['greece']
    },
    HU: {
        id: 'hu',
        name: 'Macaristan',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'plains',
        initialUnits: { infantry: 3, armor: 1, air: 0 },
        neighbors: ['at', 'sk', 'ua', 'ro', 'rs', 'hr', 'si'],
        aliases: ['hungary']
    },
    SK: {
        id: 'sk',
        name: 'Slovakya',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'mountains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['cz', 'pl', 'ua', 'hu', 'at'],
        aliases: ['slovakia']
    },
    RS: {
        id: 'rs',
        name: 'Sırbistan (Yugoslavya)',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'mountains',
        initialUnits: { infantry: 4, armor: 1, air: 0 },
        neighbors: ['hu', 'ro', 'bg', 'mk', 'al', 'me', 'ba', 'hr'],
        aliases: ['serbia', 'yugoslavia']
    },
    HR: {
        id: 'hr',
        name: 'Hırvatistan',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'coastal',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['si', 'hu', 'rs', 'ba', 'me'],
        aliases: ['croatia']
    },
    BA: {
        id: 'ba',
        name: 'Bosna-Hersek',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['hr', 'rs', 'me'],
        aliases: ['bosnia']
    },
    ME: {
        id: 'me',
        name: 'Karadağ',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 1, armor: 0, air: 0 },
        neighbors: ['ba', 'rs', 'al', 'hr'],
        aliases: ['montenegro']
    },
    MK: {
        id: 'mk',
        name: 'Makedonya',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['rs', 'bg', 'gr', 'al'],
        aliases: ['macedonia']
    },
    SI: {
        id: 'si',
        name: 'Slovenya',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['it', 'at', 'hu', 'hr'],
        aliases: ['slovenia']
    },
    SE: {
        id: 'se',
        name: 'İsveç',
        owner: 'neutral',
        capital: false,
        industry: 3,
        terrain: 'plains',
        initialUnits: { infantry: 4, armor: 1, air: 1 },
        neighbors: ['no', 'fi', 'dk'],
        aliases: ['sweden']
    },
    NO: {
        id: 'no',
        name: 'Norveç',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'mountains',
        initialUnits: { infantry: 3, armor: 0, air: 0 },
        neighbors: ['se', 'fi', 'ru', 'gb', 'fo', 'dk'],
        aliases: ['norway']
    },
    FI: {
        id: 'fi',
        name: 'Finlandiya',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'plains',
        initialUnits: { infantry: 4, armor: 0, air: 1 },
        neighbors: ['no', 'se', 'ru', 'ee'],
        aliases: ['finland']
    },
    DK: {
        id: 'dk',
        name: 'Danimarka',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'coastal',
        initialUnits: { infantry: 2, armor: 0, air: 0 },
        neighbors: ['de', 'se', 'no'],
        aliases: ['denmark']
    },
    NL: {
        id: 'nl',
        name: 'Hollanda',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'coastal',
        initialUnits: { infantry: 3, armor: 0, air: 0 },
        neighbors: ['de', 'be', 'gb'],
        aliases: ['netherlands']
    },
    CH: {
        id: 'ch',
        name: 'İsviçre',
        owner: 'neutral',
        capital: false,
        industry: 2,
        terrain: 'mountains',
        initialUnits: { infantry: 5, armor: 0, air: 0 },
        neighbors: ['fr', 'de', 'at', 'it', 'li'],
        aliases: ['switzerland']
    },
    LI: {
        id: 'li',
        name: 'Lihtenştayn',
        owner: 'neutral',
        capital: false,
        industry: 1,
        terrain: 'mountains',
        initialUnits: { infantry: 1, armor: 0, air: 0 },
        neighbors: ['ch', 'at'],
        aliases: ['liechtenstein']
    }
};

/**
 * Builds the complete European Theater game map from GeoJSON features.
 * Computes projected Path2D paths, visual centroids, and links gameplay metadata.
 * 
 * @param {Object} geoJsonData - GeoJSON FeatureCollection
 * @param {Object} [projectionConfig]
 * @returns {{ regions: Object, regionList: Array, dimensions: Object, projection: MercatorProjection }}
 */
export function buildGeoJsonMap(geoJsonData = EUROPE_GEOJSON, projectionConfig = GEO_PROJECTION_CONFIG) {
    const projection = new MercatorProjection(projectionConfig);
    const regions = {};
    const regionList = [];

    const features = geoJsonData?.features || [];

    for (const f of features) {
        const iso2 = (f.properties?.ISO2 || '').toUpperCase();
        const fips = (f.properties?.FIPS || '').toUpperCase();
        const name = f.properties?.NAME || '';

        // Match metadata by ISO2, FIPS, or NAME
        let meta = COUNTRY_METADATA[iso2];
        if (!meta) {
            meta = Object.values(COUNTRY_METADATA).find(m => 
                m.fips === fips || m.id === iso2.toLowerCase() || m.name.toLowerCase() === name.toLowerCase()
            );
        }

        if (!meta) {
            // Fallback default for unexpected feature
            meta = {
                id: iso2.toLowerCase() || `region_${regionList.length}`,
                name: name || iso2,
                owner: 'neutral',
                capital: false,
                industry: 1,
                terrain: 'plains',
                initialUnits: { infantry: 2, armor: 0, air: 0 },
                neighbors: []
            };
        }

        // Parse geometry with Mercator projection
        const parsed = parseGeoGeometry(f.geometry, projection);

        const regionObj = {
            id: meta.id,
            code: iso2,
            fips: fips,
            name: meta.name,
            geoName: name,
            owner: meta.owner,
            capital: meta.capital || false,
            capitalCity: meta.capitalCity || null,
            industry: meta.industry || 1,
            terrain: meta.terrain || 'plains',
            initialUnits: { ...meta.initialUnits },
            neighbors: [...meta.neighbors],
            aliases: meta.aliases ? [...meta.aliases] : [],

            // Spatial coordinates
            x: parsed.centroid[0],
            y: parsed.centroid[1],
            bounds: parsed.bounds,

            // Canvas Vector Geometry
            path2d: parsed.path2d,
            svgPath: parsed.svgPath,
            projectedPolygons: parsed.projectedPolygons,
            // Fallback polygon (primary outer ring)
            polygon: parsed.projectedPolygons[0]?.[0] || []
        };

        regions[regionObj.id] = regionObj;
        regionList.push(regionObj);

        // Register aliases (e.g. 'berlin' -> 'de', 'london' -> 'gb', etc.)
        if (meta.aliases) {
            for (const alias of meta.aliases) {
                if (!regions[alias]) {
                    regions[alias] = regionObj;
                }
            }
        }
    }

    return {
        regions,
        regionList,
        dimensions: MAP_DIMENSIONS,
        projection
    };
}

/**
 * Pre-build INITIAL_REGIONS for immediate, synchronous consumer availability
 */
export const MAP_BUILD_RESULT = buildGeoJsonMap(EUROPE_GEOJSON, GEO_PROJECTION_CONFIG);
export const INITIAL_REGIONS = MAP_BUILD_RESULT.regionList;

/**
 * Asynchronously loads europe.geojson via fetch with fallback to embedded dataset
 * @returns {Promise<Object>}
 */
export async function loadEuropeGeoJson() {
    try {
        if (typeof window !== 'undefined' && window.location && window.location.protocol !== 'file:') {
            const resp = await fetch('europe.geojson');
            if (resp.ok) {
                const data = await resp.json();
                return buildGeoJsonMap(data, GEO_PROJECTION_CONFIG);
            }
        }
    } catch (e) {
        console.warn('HTTP fetch failed, falling back to embedded GeoJSON dataset:', e);
    }
    return MAP_BUILD_RESULT;
}
