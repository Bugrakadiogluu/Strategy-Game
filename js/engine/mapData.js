/**
 * mapData.js - Real-World European Theater WW2 Map Data Engine
 * Powered by Authentic GeoJSON Geography & Spherical Mercator Projection.
 * Completely replaces all handcoded/low-poly polygon approximations.
 */

import { EUROPE_GEOJSON } from '../data/europeGeoJson.js';
import { MercatorProjection, parseGeoGeometry, subdivideGeometryWithSeeds } from './geoProjection.js';

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
        industry: 2,
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
        industry: 3,
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
        owner: 'ussr',
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
        owner: 'ussr',
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
        industry: 2,
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
/**
 * Historical WW2 Province Definitions for Major Powers
 * Seeds partition each country's GeoJSON geometry into seamless provinces
 * while strictly preserving the authentic outer country border.
 */
export const PROVINCE_DEFINITIONS = {
    TR: [
        { id: 'tr_istanbul', name: 'İstanbul & Marmara', owner: 'turkey', capital: false, industry: 3, terrain: 'city', lon: 28.97, lat: 41.01, initialUnits: { infantry: 4, armor: 1, air: 1 }, neighbors: ['tr_bursa', 'tr_ankara', 'bg', 'gr'], aliases: ['istanbul'] },
        { id: 'tr_bursa', name: 'Bursa & Güney Marmara', owner: 'turkey', capital: false, industry: 2, terrain: 'plains', lon: 29.06, lat: 40.18, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['tr_istanbul', 'tr_izmir', 'tr_ankara', 'tr_antalya'], aliases: ['bursa'] },
        { id: 'tr_izmir', name: 'İzmir & Ege', owner: 'turkey', capital: false, industry: 2, terrain: 'coastal', lon: 27.14, lat: 38.42, initialUnits: { infantry: 3, armor: 1, air: 1 }, neighbors: ['tr_bursa', 'tr_antalya', 'gr'], aliases: ['izmir'] },
        { id: 'tr_ankara', name: 'Ankara & İç Anadolu', owner: 'turkey', capital: true, capitalCity: 'Ankara', industry: 3, terrain: 'city', lon: 32.85, lat: 39.93, initialUnits: { infantry: 5, armor: 2, air: 1 }, neighbors: ['tr_istanbul', 'tr_bursa', 'tr_samsun', 'tr_adana', 'tr_antalya'], aliases: ['tr', 'turkey', 'ankara'] },
        { id: 'tr_antalya', name: 'Antalya & Akdeniz', owner: 'turkey', capital: false, industry: 1, terrain: 'coastal', lon: 30.71, lat: 36.89, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['tr_izmir', 'tr_bursa', 'tr_ankara', 'tr_adana', 'cy'], aliases: ['antalya'] },
        { id: 'tr_adana', name: 'Adana & Çukurova', owner: 'turkey', capital: false, industry: 2, terrain: 'plains', lon: 35.32, lat: 37.00, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['tr_antalya', 'tr_ankara', 'tr_samsun', 'tr_diyarbakir', 'cy'], aliases: ['adana'] },
        { id: 'tr_samsun', name: 'Samsun & Orta Karadeniz', owner: 'turkey', capital: false, industry: 1, terrain: 'coastal', lon: 36.33, lat: 41.29, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['tr_ankara', 'tr_adana', 'tr_trabzon', 'tr_erzurum'], aliases: ['samsun'] },
        { id: 'tr_trabzon', name: 'Trabzon & Doğu Karadeniz', owner: 'turkey', capital: false, industry: 1, terrain: 'mountains', lon: 39.72, lat: 41.00, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['tr_samsun', 'tr_erzurum', 'ge'], aliases: ['trabzon'] },
        { id: 'tr_erzurum', name: 'Erzurum & Doğu Anadolu', owner: 'turkey', capital: false, industry: 1, terrain: 'mountains', lon: 41.27, lat: 39.90, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['tr_trabzon', 'tr_samsun', 'tr_adana', 'tr_diyarbakir', 'ge', 'am', 'az'], aliases: ['erzurum'] },
        { id: 'tr_diyarbakir', name: 'Diyarbakır & Güneydoğu', owner: 'turkey', capital: false, industry: 1, terrain: 'plains', lon: 40.23, lat: 37.91, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['tr_adana', 'tr_erzurum', 'am'], aliases: ['diyarbakir'] }
    ],
    DE: [
        { id: 'de_berlin', name: 'Berlin & Brandenburg', owner: 'germany', capital: true, capitalCity: 'Berlin', industry: 5, terrain: 'city', lon: 13.40, lat: 52.52, initialUnits: { infantry: 7, armor: 3, air: 3 }, neighbors: ['de_magdeburg', 'de_dresden', 'de_leipzig', 'de_rostock'], aliases: ['de', 'germany', 'berlin'] },
        { id: 'de_hamburg', name: 'Hamburg & Elbe', owner: 'germany', capital: false, industry: 2, terrain: 'coastal', lon: 10.00, lat: 53.55, initialUnits: { infantry: 3, armor: 1, air: 1 }, neighbors: ['de_kiel', 'de_bremen', 'de_hanover', 'de_rostock', 'dk'], aliases: ['hamburg'] },
        { id: 'de_munich', name: 'Münih & Güney Bavyera', owner: 'germany', capital: false, industry: 3, terrain: 'mountains', lon: 11.58, lat: 48.14, initialUnits: { infantry: 4, armor: 2, air: 1 }, neighbors: ['de_nuremberg', 'de_stuttgart', 'at_vienna', 'at_tyrol', 'ch'], aliases: ['munich', 'bavaria'] },
        { id: 'de_cologne', name: 'Köln & Renanya', owner: 'germany', capital: false, industry: 3, terrain: 'city', lon: 6.95, lat: 50.93, initialUnits: { infantry: 4, armor: 2, air: 1 }, neighbors: ['de_dortmund', 'de_frankfurt', 'nl', 'be'], aliases: ['cologne', 'koln'] },
        { id: 'de_frankfurt', name: 'Frankfurt & Hessen', owner: 'germany', capital: false, industry: 2, terrain: 'plains', lon: 8.68, lat: 50.11, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['de_cologne', 'de_stuttgart', 'de_nuremberg', 'de_erfurt', 'fr_alsace'], aliases: ['frankfurt'] },
        { id: 'de_stuttgart', name: 'Stuttgart & Baden-Württemberg', owner: 'germany', capital: false, industry: 2, terrain: 'plains', lon: 9.18, lat: 48.78, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['de_frankfurt', 'de_munich', 'fr_alsace', 'ch'], aliases: ['stuttgart'] },
        { id: 'de_dresden', name: 'Dresden & Doğu Saksonya', owner: 'germany', capital: false, industry: 2, terrain: 'plains', lon: 13.74, lat: 51.05, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['de_berlin', 'de_leipzig', 'cz_bohemia', 'pl'], aliases: ['dresden', 'saxony'] },
        { id: 'de_hanover', name: 'Hannover & Weser', owner: 'germany', capital: false, industry: 2, terrain: 'plains', lon: 9.73, lat: 52.37, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['de_hamburg', 'de_bremen', 'de_dortmund', 'de_magdeburg', 'de_erfurt', 'nl'], aliases: ['hanover'] },
        { id: 'de_dortmund', name: 'Dortmund & Ruhr Sanayi', owner: 'germany', capital: false, industry: 4, terrain: 'city', lon: 7.46, lat: 51.51, initialUnits: { infantry: 5, armor: 3, air: 1 }, neighbors: ['de_cologne', 'de_hanover', 'de_frankfurt', 'nl'], aliases: ['dortmund', 'ruhr'] },
        { id: 'de_bremen', name: 'Bremen & Aşağı Weser', owner: 'germany', capital: false, industry: 1, terrain: 'coastal', lon: 8.80, lat: 53.07, initialUnits: { infantry: 2, armor: 1, air: 0 }, neighbors: ['de_hamburg', 'de_hanover', 'nl'], aliases: ['bremen'] },
        { id: 'de_nuremberg', name: 'Nürnberg & Frankonya', owner: 'germany', capital: false, industry: 2, terrain: 'plains', lon: 11.08, lat: 49.45, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['de_frankfurt', 'de_munich', 'de_erfurt', 'de_leipzig', 'cz_bohemia'], aliases: ['nuremberg'] },
        { id: 'de_leipzig', name: 'Leipzig & Batı Saksonya', owner: 'germany', capital: false, industry: 2, terrain: 'plains', lon: 12.37, lat: 51.34, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['de_berlin', 'de_dresden', 'de_magdeburg', 'de_erfurt', 'de_nuremberg'], aliases: ['leipzig'] },
        { id: 'de_kiel', name: 'Kiel & Holstein', owner: 'germany', capital: false, industry: 1, terrain: 'coastal', lon: 10.13, lat: 54.32, initialUnits: { infantry: 2, armor: 0, air: 1 }, neighbors: ['de_hamburg', 'dk'], aliases: ['kiel'] },
        { id: 'de_magdeburg', name: 'Magdeburg & Orta Elbe', owner: 'germany', capital: false, industry: 1, terrain: 'plains', lon: 11.63, lat: 52.13, initialUnits: { infantry: 2, armor: 1, air: 0 }, neighbors: ['de_berlin', 'de_hanover', 'de_leipzig', 'de_erfurt'], aliases: ['magdeburg'] },
        { id: 'de_erfurt', name: 'Erfurt & Thüringen', owner: 'germany', capital: false, industry: 1, terrain: 'plains', lon: 11.03, lat: 50.98, initialUnits: { infantry: 2, armor: 1, air: 0 }, neighbors: ['de_frankfurt', 'de_hanover', 'de_magdeburg', 'de_leipzig', 'de_nuremberg'], aliases: ['erfurt', 'thuringia'] },
        { id: 'de_rostock', name: 'Rostock & Baltık Sahili', owner: 'germany', capital: false, industry: 1, terrain: 'coastal', lon: 12.13, lat: 54.09, initialUnits: { infantry: 2, armor: 0, air: 1 }, neighbors: ['de_hamburg', 'de_berlin', 'pl'], aliases: ['rostock', 'mecklenburg'] }
    ],
    RU: [
        { id: 'ru_moscow', name: 'Moskova & Merkez', owner: 'ussr', capital: true, capitalCity: 'Moskova', industry: 5, terrain: 'city', lon: 37.62, lat: 55.75, initialUnits: { infantry: 8, armor: 4, air: 3 }, neighbors: ['ru_kalinin', 'ru_gorky', 'ru_kursk', 'ru_smolensk'], aliases: ['ru', 'ussr', 'moscow'] },
        { id: 'ru_leningrad', name: 'Leningrad & Neva', owner: 'ussr', capital: false, industry: 3, terrain: 'city', lon: 30.33, lat: 59.93, initialUnits: { infantry: 6, armor: 2, air: 1 }, neighbors: ['ru_novgorod', 'fi', 'ee', 'ru_vologda'], aliases: ['leningrad'] },
        { id: 'ru_stalingrad', name: 'Stalingrad & Volga', owner: 'ussr', capital: false, industry: 3, terrain: 'city', lon: 44.52, lat: 48.71, initialUnits: { infantry: 6, armor: 3, air: 1 }, neighbors: ['ru_saratov', 'ru_rostov', 'ru_voronezh', 'ru_caucasus'], aliases: ['stalingrad'] },
        { id: 'ru_smolensk', name: 'Smolensk & Batı Cephesi', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 32.05, lat: 54.78, initialUnits: { infantry: 4, armor: 1, air: 0 }, neighbors: ['ru_moscow', 'ru_kalinin', 'ru_kursk', 'by_vitebsk', 'by_minsk'], aliases: ['smolensk'] },
        { id: 'ru_kursk', name: 'Kursk & Orel', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 36.19, lat: 51.73, initialUnits: { infantry: 4, armor: 2, air: 0 }, neighbors: ['ru_moscow', 'ru_smolensk', 'ru_voronezh', 'ua_kiev', 'ua_kharkov'], aliases: ['kursk'] },
        { id: 'ru_rostov', name: 'Rostov-na-Donu & Don', owner: 'ussr', capital: false, industry: 2, terrain: 'plains', lon: 39.72, lat: 47.24, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['ru_stalingrad', 'ru_caucasus', 'ru_voronezh', 'ua_kharkov', 'ua_crimea'], aliases: ['rostov'] },
        { id: 'ru_caucasus', name: 'Kafkasya & Grozni', owner: 'ussr', capital: false, industry: 2, terrain: 'mountains', lon: 45.69, lat: 43.32, initialUnits: { infantry: 4, armor: 1, air: 0 }, neighbors: ['ru_rostov', 'ru_stalingrad', 'ge', 'az'], aliases: ['caucasus', 'grozny'] },
        { id: 'ru_gorky', name: 'Gorki & Orta Volga', owner: 'ussr', capital: false, industry: 2, terrain: 'plains', lon: 44.00, lat: 56.33, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['ru_moscow', 'ru_kazan', 'ru_vologda', 'ru_saratov'], aliases: ['gorky', 'nizhny'] },
        { id: 'ru_arkhangelsk', name: 'Arhangelsk & Beyazdeniz', owner: 'ussr', capital: false, industry: 1, terrain: 'coastal', lon: 40.54, lat: 64.54, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['ru_vologda', 'ru_murmansk'], aliases: ['arkhangelsk'] },
        { id: 'ru_vologda', name: 'Vologda & Kuzey Göller', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 39.89, lat: 59.22, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['ru_leningrad', 'ru_novgorod', 'ru_kalinin', 'ru_gorky', 'ru_arkhangelsk'], aliases: ['vologda'] },
        { id: 'ru_voronezh', name: 'Voronej & Don Havzası', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 39.20, lat: 51.67, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['ru_kursk', 'ru_rostov', 'ru_stalingrad', 'ru_saratov'], aliases: ['voronezh'] },
        { id: 'ru_kazan', name: 'Kazan & Volga-Kama', owner: 'ussr', capital: false, industry: 2, terrain: 'plains', lon: 47.00, lat: 55.79, initialUnits: { infantry: 3, armor: 2, air: 0 }, neighbors: ['ru_gorky', 'ru_samara', 'ru_saratov'], aliases: ['kazan'] },
        { id: 'ru_samara', name: 'Samara & Doğu Bozkır', owner: 'ussr', capital: false, industry: 2, terrain: 'plains', lon: 47.50, lat: 53.20, initialUnits: { infantry: 4, armor: 2, air: 1 }, neighbors: ['ru_kazan', 'ru_saratov'], aliases: ['samara', 'kuybyshev'] },
        { id: 'ru_saratov', name: 'Saratov & Aşağı Volga', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 46.00, lat: 51.54, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['ru_voronezh', 'ru_stalingrad', 'ru_gorky', 'ru_kazan', 'ru_samara'], aliases: ['saratov'] },
        { id: 'ru_kalinin', name: 'Kalinin & Tver', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 35.91, lat: 56.86, initialUnits: { infantry: 2, armor: 1, air: 0 }, neighbors: ['ru_moscow', 'ru_novgorod', 'ru_smolensk', 'ru_vologda'], aliases: ['kalinin', 'tver'] },
        { id: 'ru_murmansk', name: 'Murmansk & Kola', owner: 'ussr', capital: false, industry: 2, terrain: 'coastal', lon: 33.08, lat: 68.97, initialUnits: { infantry: 3, armor: 0, air: 1 }, neighbors: ['ru_arkhangelsk', 'fi', 'no'], aliases: ['murmansk'] },
        { id: 'ru_novgorod', name: 'Veliki Novgorod & İlmen', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 31.27, lat: 58.52, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['ru_leningrad', 'ru_kalinin', 'ru_smolensk', 'ru_vologda', 'ee', 'lv'], aliases: ['novgorod'] }
    ],
    UA: [
        { id: 'ua_kiev', name: 'Kiev & Dinyeper', owner: 'ussr', capital: false, industry: 2, terrain: 'city', lon: 30.52, lat: 50.45, initialUnits: { infantry: 5, armor: 2, air: 1 }, neighbors: ['ua_kharkov', 'ua_odessa', 'ua_lviv', 'ru_kursk', 'by_minsk', 'by_brest'], aliases: ['ua', 'ukraine', 'kiev'] },
        { id: 'ua_kharkov', name: 'Harkov & Donbass', owner: 'ussr', capital: false, industry: 2, terrain: 'city', lon: 36.23, lat: 50.00, initialUnits: { infantry: 4, armor: 2, air: 0 }, neighbors: ['ua_kiev', 'ua_crimea', 'ru_kursk', 'ru_rostov'], aliases: ['kharkov', 'donbass'] },
        { id: 'ua_odessa', name: 'Odessa & Karadeniz', owner: 'ussr', capital: false, industry: 1, terrain: 'coastal', lon: 30.72, lat: 46.48, initialUnits: { infantry: 3, armor: 1, air: 1 }, neighbors: ['ua_kiev', 'ua_crimea', 'ua_lviv', 'md', 'ro'], aliases: ['odessa'] },
        { id: 'ua_crimea', name: 'Kırım & Sivastopol', owner: 'ussr', capital: false, industry: 1, terrain: 'coastal', lon: 34.10, lat: 44.95, initialUnits: { infantry: 3, armor: 0, air: 1 }, neighbors: ['ua_kharkov', 'ua_odessa', 'ru_rostov'], aliases: ['crimea', 'sevastopol'] },
        { id: 'ua_lviv', name: 'Lviv & Batı Ukrayna', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 24.03, lat: 49.84, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['ua_kiev', 'ua_odessa', 'pl', 'sk', 'hu', 'ro', 'by_brest'], aliases: ['lviv'] }
    ],
    BY: [
        { id: 'by_minsk', name: 'Minsk & Merkez Belarus', owner: 'ussr', capital: false, industry: 1, terrain: 'city', lon: 27.57, lat: 53.90, initialUnits: { infantry: 4, armor: 1, air: 0 }, neighbors: ['by_brest', 'by_vitebsk', 'ru_smolensk', 'ua_kiev'], aliases: ['by', 'belarus', 'minsk'] },
        { id: 'by_brest', name: 'Brest & Batı Belarus', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 23.68, lat: 52.09, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['by_minsk', 'pl', 'ua_lviv', 'ua_kiev'], aliases: ['brest'] },
        { id: 'by_vitebsk', name: 'Vitebsk & Doğu Belarus', owner: 'ussr', capital: false, industry: 1, terrain: 'plains', lon: 30.20, lat: 55.19, initialUnits: { infantry: 3, armor: 0, air: 0 }, neighbors: ['by_minsk', 'ru_smolensk', 'lv', 'lt'], aliases: ['vitebsk'] }
    ],
    GB: [
        { id: 'gb_london', name: 'Londra & Güneydoğu', owner: 'uk', capital: true, capitalCity: 'Londra', industry: 7, terrain: 'city', lon: -0.13, lat: 51.51, initialUnits: { infantry: 6, armor: 2, air: 3 }, neighbors: ['gb_midlands', 'gb_cornwall', 'fr_normandy', 'fr_paris', 'de_ruhr', 'be'], aliases: ['gb', 'uk', 'london'] },
        { id: 'gb_midlands', name: 'Midlands & Birmingham', owner: 'uk', capital: false, industry: 5, terrain: 'plains', lon: -1.90, lat: 52.48, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['gb_london', 'gb_north', 'gb_wales'], aliases: ['midlands', 'birmingham'] },
        { id: 'gb_north', name: 'Manchester & Yorkshire', owner: 'uk', capital: false, industry: 5, terrain: 'plains', lon: -2.24, lat: 53.48, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['gb_midlands', 'gb_scotland', 'gb_wales', 'gb_ulster'], aliases: ['manchester', 'leeds'] },
        { id: 'gb_scotland', name: 'İskoçya & Edinburgh', owner: 'uk', capital: false, industry: 3, terrain: 'mountains', lon: -3.19, lat: 55.95, initialUnits: { infantry: 3, armor: 0, air: 1 }, neighbors: ['gb_north', 'gb_highlands', 'gb_ulster'], aliases: ['scotland', 'edinburgh'] },
        { id: 'gb_highlands', name: 'İskoç Dağları & Aberdeen', owner: 'uk', capital: false, industry: 2, terrain: 'mountains', lon: -2.10, lat: 57.15, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['gb_scotland', 'is', 'no'], aliases: ['highlands'] },
        { id: 'gb_wales', name: 'Galler & Cardiff', owner: 'uk', capital: false, industry: 3, terrain: 'mountains', lon: -3.18, lat: 51.48, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['gb_midlands', 'gb_north', 'gb_cornwall'], aliases: ['wales', 'cardiff'] },
        { id: 'gb_cornwall', name: 'Plymouth & Cornwall', owner: 'uk', capital: false, industry: 2, terrain: 'coastal', lon: -4.14, lat: 50.37, initialUnits: { infantry: 2, armor: 0, air: 1 }, neighbors: ['gb_london', 'gb_wales', 'fr_brittany'], aliases: ['cornwall', 'plymouth'] },
        { id: 'gb_ulster', name: 'Kuzey İrlanda & Belfast', owner: 'uk', capital: false, industry: 2, terrain: 'plains', lon: -5.93, lat: 54.60, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['ie', 'gb_scotland', 'gb_north'], aliases: ['ulster', 'belfast'] }
    ],
    FR: [
        { id: 'fr_paris', name: 'Paris & Île-de-France', owner: 'france', capital: true, capitalCity: 'Paris', industry: 5, terrain: 'city', lon: 2.35, lat: 48.86, initialUnits: { infantry: 6, armor: 2, air: 2 }, neighbors: ['fr_normandy', 'fr_burgundy', 'fr_lyon', 'fr_bordeaux', 'be', 'gb_london'], aliases: ['fr', 'france', 'paris'] },
        { id: 'fr_normandy', name: 'Normandiya & Cherbourg', owner: 'france', capital: false, industry: 2, terrain: 'coastal', lon: -0.37, lat: 49.18, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['fr_paris', 'fr_brittany', 'fr_bordeaux', 'gb_london'], aliases: ['normandy'] },
        { id: 'fr_brittany', name: 'Bretonya & Brest', owner: 'france', capital: false, industry: 2, terrain: 'coastal', lon: -4.48, lat: 48.39, initialUnits: { infantry: 3, armor: 0, air: 1 }, neighbors: ['fr_normandy', 'fr_bordeaux', 'gb_cornwall'], aliases: ['brittany', 'brest'] },
        { id: 'fr_bordeaux', name: 'Akitanya & Bordeaux', owner: 'france', capital: false, industry: 2, terrain: 'plains', lon: -0.58, lat: 44.84, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['fr_paris', 'fr_normandy', 'fr_brittany', 'fr_toulouse', 'es_bilbao'], aliases: ['bordeaux'] },
        { id: 'fr_marseille', name: 'Marsilya & Provence', owner: 'france', capital: false, industry: 2, terrain: 'coastal', lon: 5.37, lat: 43.30, initialUnits: { infantry: 3, armor: 1, air: 1 }, neighbors: ['fr_lyon', 'fr_toulouse', 'it_turin'], aliases: ['marseille', 'provence'] },
        { id: 'fr_lyon', name: 'Lyon & Rhône', owner: 'france', capital: false, industry: 3, terrain: 'plains', lon: 4.83, lat: 45.76, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['fr_paris', 'fr_burgundy', 'fr_marseille', 'fr_alsace', 'ch', 'it_turin'], aliases: ['lyon'] },
        { id: 'fr_alsace', name: 'Alsas-Loren & Strazburg', owner: 'france', capital: false, industry: 3, terrain: 'plains', lon: 7.75, lat: 48.58, initialUnits: { infantry: 4, armor: 1, air: 0 }, neighbors: ['fr_burgundy', 'fr_lyon', 'de_ruhr', 'de_frankfurt', 'de_stuttgart', 'ch'], aliases: ['alsace', 'strasbourg'] },
        { id: 'fr_toulouse', name: 'Midi & Toulouse', owner: 'france', capital: false, industry: 2, terrain: 'plains', lon: 1.44, lat: 43.60, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['fr_bordeaux', 'fr_marseille', 'es_barcelona', 'es_zaragoza'], aliases: ['toulouse'] },
        { id: 'fr_burgundy', name: 'Burgonya & Dijon', owner: 'france', capital: false, industry: 2, terrain: 'plains', lon: 5.04, lat: 47.32, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['fr_paris', 'fr_lyon', 'fr_alsace', 'be'], aliases: ['burgundy', 'dijon'] }
    ],
    IT: [
        { id: 'it_rome', name: 'Roma & Lazio', owner: 'italy', capital: true, capitalCity: 'Roma', industry: 4, terrain: 'city', lon: 12.49, lat: 41.90, initialUnits: { infantry: 5, armor: 2, air: 1 }, neighbors: ['it_naples', 'it_venice', 'it_milan', 'it_sardinia'], aliases: ['it', 'italy', 'rome'] },
        { id: 'it_milan', name: 'Milano & Lombardiya', owner: 'italy', capital: false, industry: 4, terrain: 'city', lon: 9.19, lat: 45.46, initialUnits: { infantry: 4, armor: 2, air: 1 }, neighbors: ['it_turin', 'it_venice', 'it_rome', 'ch', 'at_tyrol'], aliases: ['milan'] },
        { id: 'it_venice', name: 'Venedik & Veneto', owner: 'italy', capital: false, industry: 3, terrain: 'coastal', lon: 12.33, lat: 45.44, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['it_milan', 'it_rome', 'at_vienna', 'at_tyrol', 'si', 'hr'], aliases: ['venice'] },
        { id: 'it_turin', name: 'Torino & Piyemonte', owner: 'italy', capital: false, industry: 2, terrain: 'mountains', lon: 7.68, lat: 45.07, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['it_milan', 'fr_lyon', 'fr_marseille', 'ch'], aliases: ['turin'] },
        { id: 'it_naples', name: 'Napoli & Campania', owner: 'italy', capital: false, industry: 2, terrain: 'coastal', lon: 14.27, lat: 40.85, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['it_rome', 'it_calabria'], aliases: ['naples'] },
        { id: 'it_calabria', name: 'Taranto & Calabria', owner: 'italy', capital: false, industry: 1, terrain: 'coastal', lon: 16.59, lat: 39.00, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['it_naples', 'it_sicily', 'al', 'gr'], aliases: ['calabria', 'taranto'] },
        { id: 'it_sicily', name: 'Sicilya & Palermo', owner: 'italy', capital: false, industry: 1, terrain: 'coastal', lon: 13.36, lat: 38.12, initialUnits: { infantry: 3, armor: 0, air: 1 }, neighbors: ['it_calabria', 'mt'], aliases: ['sicily'] },
        { id: 'it_sardinia', name: 'Sardinya & Cagliari', owner: 'italy', capital: false, industry: 1, terrain: 'coastal', lon: 9.11, lat: 39.22, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['it_rome'], aliases: ['sardinia'] }
    ],
    ES: [
        { id: 'es_madrid', name: 'Madrid & Kastilya', owner: 'spain', capital: true, capitalCity: 'Madrid', industry: 3, terrain: 'city', lon: -3.70, lat: 40.42, initialUnits: { infantry: 5, armor: 2, air: 1 }, neighbors: ['es_seville', 'es_valencia', 'es_zaragoza', 'es_bilbao', 'pt'], aliases: ['es', 'spain', 'madrid'] },
        { id: 'es_barcelona', name: 'Barselona & Katalonya', owner: 'spain', capital: false, industry: 3, terrain: 'coastal', lon: 2.17, lat: 41.38, initialUnits: { infantry: 3, armor: 1, air: 1 }, neighbors: ['es_zaragoza', 'es_valencia', 'fr_toulouse'], aliases: ['barcelona', 'catalonia'] },
        { id: 'es_seville', name: 'Sevilla & Endülüs', owner: 'spain', capital: false, industry: 2, terrain: 'plains', lon: -5.98, lat: 37.38, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['es_madrid', 'es_valencia', 'pt'], aliases: ['seville', 'andalusia'] },
        { id: 'es_valencia', name: 'Valensiya & Levante', owner: 'spain', capital: false, industry: 2, terrain: 'coastal', lon: -0.38, lat: 39.47, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['es_madrid', 'es_barcelona', 'es_seville', 'es_zaragoza'], aliases: ['valencia'] },
        { id: 'es_bilbao', name: 'Bask & Bilbao', owner: 'spain', capital: false, industry: 2, terrain: 'mountains', lon: -2.93, lat: 43.26, initialUnits: { infantry: 3, armor: 0, air: 0 }, neighbors: ['es_madrid', 'es_galicia', 'es_zaragoza', 'fr_bordeaux'], aliases: ['bilbao', 'basque'] },
        { id: 'es_galicia', name: 'Galiçya & Coruña', owner: 'spain', capital: false, industry: 1, terrain: 'coastal', lon: -8.41, lat: 43.37, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['es_bilbao', 'pt'], aliases: ['galicia'] },
        { id: 'es_zaragoza', name: 'Aragon & Zaragoza', owner: 'spain', capital: false, industry: 1, terrain: 'plains', lon: -0.88, lat: 41.65, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['es_madrid', 'es_barcelona', 'es_bilbao', 'es_valencia', 'fr_toulouse'], aliases: ['zaragoza', 'aragon'] }
    ],
    AT: [
        { id: 'at_vienna', name: 'Avusturya & Viyana', owner: 'germany', capital: false, industry: 2, terrain: 'city', lon: 16.37, lat: 48.21, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['de_bavaria', 'at_tyrol', 'cz_moravia', 'sk', 'hu', 'si'], aliases: ['at', 'austria', 'vienna'] },
        { id: 'at_tyrol', name: 'Tirol & Alpler', owner: 'germany', capital: false, industry: 1, terrain: 'mountains', lon: 11.40, lat: 47.26, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['de_bavaria', 'at_vienna', 'it_milan', 'it_venice', 'ch'], aliases: ['tyrol'] }
    ],
    CZ: [
        { id: 'cz_bohemia', name: 'Bohemya & Prag', owner: 'germany', capital: false, industry: 2, terrain: 'plains', lon: 14.43, lat: 50.08, initialUnits: { infantry: 3, armor: 1, air: 0 }, neighbors: ['de_saxony', 'de_silesia', 'de_nuremberg', 'cz_moravia'], aliases: ['cz', 'czechia', 'bohemia', 'prague'] },
        { id: 'cz_moravia', name: 'Moravya & Brno', owner: 'germany', capital: false, industry: 1, terrain: 'plains', lon: 16.61, lat: 49.20, initialUnits: { infantry: 2, armor: 0, air: 0 }, neighbors: ['cz_bohemia', 'de_silesia', 'at_vienna', 'sk', 'pl'], aliases: ['moravia', 'brno'] }
    ]
};

/**
 * Parses GeoJSON Europe map into full game regions and subdivided provinces
 * @param {Object} geoJsonData
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

        // Parse outer geometry with Mercator projection
        const parsed = parseGeoGeometry(f.geometry, projection);

        // 1. If country has multiple provinces defined, subdivide the polygon seamlessly
        if (PROVINCE_DEFINITIONS[iso2]) {
            const provDefs = PROVINCE_DEFINITIONS[iso2];
            const subdividedGeoms = subdivideGeometryWithSeeds(parsed.projectedPolygons, provDefs, projection);

            for (const pDef of provDefs) {
                let pGeom = subdividedGeoms[pDef.id];
                if (!pGeom || !pGeom.projectedPolygons || pGeom.projectedPolygons.length === 0 || !pGeom.path2d) {
                    const pt = projection.project(pDef.lon, pDef.lat);
                    const r = 24;
                    const fallbackSvg = `M ${pt[0] - r},${pt[1]} A ${r},${r} 0 1 0 ${pt[0] + r},${pt[1]} A ${r},${r} 0 1 0 ${pt[0] - r},${pt[1]} Z`;
                    pGeom = {
                        centroid: [Math.round(pt[0]), Math.round(pt[1])],
                        bounds: { minX: pt[0] - r, maxX: pt[0] + r, minY: pt[1] - r, maxY: pt[1] + r },
                        path2d: typeof Path2D !== 'undefined' ? new Path2D(fallbackSvg) : null,
                        svgPath: fallbackSvg,
                        projectedPolygons: [[[ [pt[0]-r, pt[1]-r], [pt[0]+r, pt[1]-r], [pt[0]+r, pt[1]+r], [pt[0]-r, pt[1]+r] ]]],
                        polygon: [[pt[0]-r, pt[1]-r], [pt[0]+r, pt[1]-r], [pt[0]+r, pt[1]+r], [pt[0]-r, pt[1]+r]]
                    };
                }

                const provObj = {
                    id: pDef.id,
                    code: iso2,
                    countryId: iso2.toLowerCase(),
                    fips: fips,
                    name: pDef.name,
                    geoName: name,
                    owner: pDef.owner,
                    capital: pDef.capital || false,
                    capitalCity: pDef.capitalCity || null,
                    industry: pDef.industry || 1,
                    terrain: pDef.terrain || 'plains',
                    initialUnits: { ...pDef.initialUnits },
                    neighbors: [...pDef.neighbors],
                    aliases: pDef.aliases ? [...pDef.aliases] : [],

                    x: pGeom.centroid[0],
                    y: pGeom.centroid[1],
                    bounds: pGeom.bounds,

                    path2d: pGeom.path2d,
                    svgPath: pGeom.svgPath,
                    projectedPolygons: pGeom.projectedPolygons,
                    polygon: pGeom.polygon || (pGeom.projectedPolygons[0]?.[0] || []),
                    countryPath2d: parsed.path2d
                };

                regions[provObj.id] = provObj;
                regionList.push(provObj);

                // Register aliases (e.g. 'ankara' -> 'tr_ankara', 'berlin' -> 'de_berlin', 'tr' -> 'tr_ankara')
                if (pDef.aliases) {
                    for (const alias of pDef.aliases) {
                        if (alias !== provObj.id && !(alias in regions)) {
                            Object.defineProperty(regions, alias, {
                                value: provObj,
                                enumerable: false,
                                writable: true,
                                configurable: true
                            });
                        }
                    }
                }
            }
            continue;
        }

        // 2. Sovereign / single-territory nation
        const regionObj = {
            id: meta.id,
            code: iso2,
            countryId: iso2.toLowerCase(),
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

            x: parsed.centroid[0],
            y: parsed.centroid[1],
            bounds: parsed.bounds,

            path2d: parsed.path2d,
            svgPath: parsed.svgPath,
            projectedPolygons: parsed.projectedPolygons,
            polygon: parsed.projectedPolygons[0]?.[0] || [],
            countryPath2d: parsed.path2d
        };

        regions[regionObj.id] = regionObj;
        regionList.push(regionObj);

        if (meta.aliases) {
            for (const alias of meta.aliases) {
                if (alias !== regionObj.id && !(alias in regions)) {
                    Object.defineProperty(regions, alias, {
                        value: regionObj,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    });
                }
            }
        }
    }

    // Guarantee 100% bidirectional neighbor connections and canonical alias resolution
    for (const r of regionList) {
        r.neighbors = r.neighbors.map(nId => regions[nId]?.id || nId);
        r.neighbors = [...new Set(r.neighbors)].filter(nId => nId !== r.id);
    }
    for (const r of regionList) {
        for (const nbrId of r.neighbors) {
            const target = regions[nbrId];
            if (target && !target.neighbors.includes(r.id)) {
                target.neighbors.push(r.id);
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
