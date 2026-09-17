/**
 * icons.js - High-Precision Military & Tactical Vector SVG Icon Library
 * Provides ultra-crisp, scalable vector icons to replace generic emojis.
 * WAR ROOM 1942: Grand Strategy Game Engine
 */

export const ICONS = {
    // Brand & Combat
    swords: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
        <line x1="13" y1="19" x2="19" y2="13"/>
        <line x1="16" y1="16" x2="20" y2="20"/>
        <line x1="19" y1="21" x2="21" y2="19"/>
        <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/>
        <line x1="5" y1="11" x2="11" y2="5"/>
        <line x1="4" y1="20" x2="8" y2="16"/>
    </svg>`,

    crosshair: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <line x1="12" y1="3" x2="12" y2="7"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
        <line x1="3" y1="12" x2="7" y2="12"/>
        <line x1="17" y1="12" x2="21" y2="12"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>`,

    // Units
    infantry: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <!-- Stahlhelm / Combat Helmet Profile -->
        <path d="M4 14 C4 9, 7 5, 13 5 C18 5, 20 8, 20 12 C20 13.5, 21.5 14.5, 22 15 C21 16, 17 16, 12 16 C6 16, 3 15.5, 2 15 C2.5 14.5, 4 14, 4 14 Z"/>
        <rect x="7" y="16" width="10" height="2.5" rx="1" fill="currentColor" opacity="0.8"/>
        <circle cx="12" cy="10" r="1.5" fill="#070b12"/>
    </svg>`,

    armor: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <!-- WW2 Battle Tank Silhouette -->
        <!-- Gun Barrel -->
        <rect x="1" y="8.5" width="9" height="1.8" rx="0.5"/>
        <circle cx="1" cy="9.4" r="1.2"/>
        <!-- Turret -->
        <path d="M8 8 C8 6.5, 10 5, 14 5 C17 5, 18 6.5, 18 8 Z"/>
        <circle cx="13" cy="6" r="0.9" fill="#070b12"/>
        <!-- Main Hull -->
        <polygon points="5,9 20,9 22,12 3,12"/>
        <!-- Tracks -->
        <rect x="2" y="12.5" width="20" height="5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="5.5" cy="15" r="1.3"/>
        <circle cx="9.8" cy="15" r="1.3"/>
        <circle cx="14.2" cy="15" r="1.3"/>
        <circle cx="18.5" cy="15" r="1.3"/>
    </svg>`,

    air: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <!-- WW2 Warplane / Fighter Silhouette -->
        <path d="M12 2 C11.5 2, 11 3.5, 11 6 L3 11 L3 13 L11 11.5 L11 18 L8 20 L8 21.5 L12 20.5 L16 21.5 L16 20 L13 18 L13 11.5 L21 13 L21 11 L13 6 C13 3.5, 12.5 2, 12 2 Z"/>
    </svg>`,

    // Tabs
    tabProduction: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
    </svg>`,

    tabCombat: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="22" y1="12" x2="18" y2="12"/>
        <line x1="6" y1="12" x2="2" y2="12"/>
        <line x1="12" y1="6" x2="12" y2="2"/>
        <line x1="12" y1="22" x2="12" y2="18"/>
    </svg>`,

    tabMovement: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <polygon points="16,8 20,8 23,11 23,16 16,16"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>`,

    tabIntel: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 20V10"/>
        <path d="M12 20V4"/>
        <path d="M6 20v-6"/>
    </svg>`,

    tabRadio: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
        <circle cx="12" cy="12" r="2"/>
        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
    </svg>`,

    // System & Controls
    soundOn: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>`,

    soundOff: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>`,

    save: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
    </svg>`,

    load: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>`,

    key: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5-2 2L14 9l-1.5 1.5-2-2L9 10l-1.5-1.5L5 11a7 7 0 1 0 10-10l-4 4"/>
    </svg>`,

    developer: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
    </svg>`,

    zoomIn: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,

    zoomOut: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>`,

    centerMap: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="2" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>`,

    copy: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>`,

    link: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>`,

    leave: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>`,

    crown: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        <path d="M2 20h20v2H2zM4 18l3-11 5 5 5-5 3 11z"/>
    </svg>`,

    bot: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        <rect x="4" y="8" width="16" height="12" rx="3"/>
        <circle cx="9" cy="13" r="1.5" fill="#070b12"/>
        <circle cx="15" cy="13" r="1.5" fill="#070b12"/>
        <line x1="12" y1="2" x2="12" y2="8" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="2" r="1.5"/>
    </svg>`,

    player: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>`,

    star: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>`,

    factory: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M2 22h20V10l-6 4V8l-6 4V4L2 8z"/>
    </svg>`,

    blitz: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>`,

    rocket: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>`,

    globe: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>`,

    check: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>`,

    close: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>`,

    info: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`,

    shield: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>`,

    flag: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>`,

    // Historical National Insignias (Replaces generic animal/star emojis)
    insigniaGermany: `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" class="insignia-svg">
        <!-- Balkenkreuz / Iron Cross motif -->
        <rect x="9" y="2" width="6" height="20" rx="0.5" fill="#f8fafc"/>
        <rect x="2" y="9" width="20" height="6" rx="0.5" fill="#f8fafc"/>
        <rect x="10" y="3" width="4" height="18" rx="0.3" fill="#0f172a"/>
        <rect x="3" y="10" width="18" height="4" rx="0.3" fill="#0f172a"/>
        <rect x="10.8" y="0" width="2.4" height="24" rx="0.3" fill="#fbbf24"/>
        <rect x="0" y="10.8" width="24" height="2.4" rx="0.3" fill="#fbbf24"/>
    </svg>`,

    insigniaUK: `<svg viewBox="0 0 24 24" width="22" height="22" class="insignia-svg">
        <!-- Royal Air Force / Allied Target Roundel -->
        <circle cx="12" cy="12" r="11" fill="#1d4ed8"/>
        <circle cx="12" cy="12" r="7.5" fill="#f8fafc"/>
        <circle cx="12" cy="12" r="4" fill="#dc2626"/>
    </svg>`,

    insigniaUSSR: `<svg viewBox="0 0 24 24" width="22" height="22" class="insignia-svg">
        <!-- Soviet Red Star with Gold Rim -->
        <circle cx="12" cy="12" r="11" fill="#7f1d1d" stroke="#fbbf24" stroke-width="1.5"/>
        <polygon points="12,4 14.5,9.5 20.5,10.2 16,14.3 17.2,20.2 12,17.2 6.8,20.2 8,14.3 3.5,10.2 9.5,9.5" fill="#dc2626" stroke="#fbbf24" stroke-width="0.8"/>
    </svg>`,

    insigniaItaly: `<svg viewBox="0 0 24 24" width="22" height="22" class="insignia-svg">
        <!-- Regia Aeronautica Shield / Savoy Cross -->
        <path d="M12 2 L21 5 V12 C21 17.5 17 21.5 12 23 C7 21.5 3 17.5 3 12 V5 Z" fill="#15803d" stroke="#86efac" stroke-width="1.2"/>
        <rect x="10" y="5" width="4" height="14" fill="#f8fafc"/>
        <rect x="5" y="10" width="14" height="4" fill="#f8fafc"/>
        <rect x="11" y="6" width="2" height="12" fill="#dc2626"/>
        <rect x="6" y="11" width="12" height="2" fill="#dc2626"/>
    </svg>`,

    insigniaNeutral: `<svg viewBox="0 0 24 24" width="22" height="22" class="insignia-svg">
        <circle cx="12" cy="12" r="10" fill="#716550" stroke="#d6c7a1" stroke-width="1.5"/>
        <path d="M12 6v12M6 12h12" stroke="#f5f5f4" stroke-width="2"/>
    </svg>`
};

/**
 * Returns the faction insignia SVG
 */
export function getFactionInsignia(factionId, size = 20) {
    const id = (factionId || '').toLowerCase();
    const map = {
        germany: ICONS.insigniaGermany,
        uk: ICONS.insigniaUK,
        ussr: ICONS.insigniaUSSR,
        italy: ICONS.insigniaItaly,
        neutral: ICONS.insigniaNeutral
    };
    const svg = map[id] || ICONS.flag;
    return svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
}
