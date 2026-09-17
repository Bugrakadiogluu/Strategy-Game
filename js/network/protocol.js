/**
 * protocol.js - WW2 Turn-Based Web Strategy Network Protocol
 * Defines all message contracts, action types, unit specifications,
 * and terrain parameters used across Host and Client.
 */

export const MSG_TYPES = {
    // Lobby Phase
    LOBBY_JOIN: 'LOBBY_JOIN',
    LOBBY_ACCEPTED: 'LOBBY_ACCEPTED',
    LOBBY_REJECTED: 'LOBBY_REJECTED',
    LOBBY_UPDATE: 'LOBBY_UPDATE',
    PLAYER_ASSIGN_FACTION: 'PLAYER_ASSIGN_FACTION',
    PLAYER_TOGGLE_READY: 'PLAYER_TOGGLE_READY',
    GAME_START: 'GAME_START',

    // Game Actions (Client -> Host)
    ACTION_DEPLOY: 'ACTION_DEPLOY',
    ACTION_ATTACK: 'ACTION_ATTACK',
    ACTION_AIR_STRIKE: 'ACTION_AIR_STRIKE',
    ACTION_MOVE: 'ACTION_MOVE',
    ACTION_END_TURN: 'ACTION_END_TURN',

    // Host -> Clients Sync
    STATE_SYNC: 'STATE_SYNC',
    COMBAT_EVENT: 'COMBAT_EVENT',
    ACTION_LOG_ENTRY: 'ACTION_LOG_ENTRY',
    GAME_OVER: 'GAME_OVER',

    // In-Game Hot-Join
    HOTJOIN_REQUEST: 'HOTJOIN_REQUEST',
    HOTJOIN_APPROVED: 'HOTJOIN_APPROVED',
    HOTJOIN_REJECTED: 'HOTJOIN_REJECTED',
    HOTJOIN_CLAIM: 'HOTJOIN_CLAIM',

    // Miscellaneous
    CHAT_MESSAGE: 'CHAT_MESSAGE',
    PING: 'PING',
    PONG: 'PONG'
};

export const FACTIONS = {
    GERMANY: {
        id: 'germany',
        name: 'German Reich',
        nameTr: 'Almanya',
        alliance: 'axis',
        color: '#1e293b',       // Wehrmacht Dark Iron Slate / Gunmetal
        accentColor: '#fbbf24', // Golden Eagle Amber
        textColor: '#f8fafc',
        capital: 'berlin',
        flagEmoji: '🦅'
    },
    ITALY: {
        id: 'italy',
        name: 'Kingdom of Italy',
        nameTr: 'İtalya',
        alliance: 'axis',
        color: '#15803d',       // Regio Esercito Alpine Green
        accentColor: '#86efac',
        textColor: '#ffffff',
        capital: 'rome',
        flagEmoji: '👑'
    },
    UK: {
        id: 'uk',
        name: 'United Kingdom',
        nameTr: 'Birleşik Krallık',
        alliance: 'allies',
        color: '#1d4ed8',       // Royal Navy Deep Blue
        accentColor: '#93c5fd',
        textColor: '#ffffff',
        capital: 'london',
        flagEmoji: '🦁'
    },
    USSR: {
        id: 'ussr',
        name: 'Soviet Union',
        nameTr: 'Sovyetler Birliği',
        alliance: 'allies',
        color: '#b91c1c',       // Soviet Red Army Crimson
        accentColor: '#fca5a5',
        textColor: '#ffffff',
        capital: 'moscow',
        flagEmoji: '⭐'
    },
    NEUTRAL: {
        id: 'neutral',
        name: 'Neutral Nations',
        nameTr: 'Tarafsız Ülkeler',
        alliance: 'neutral',
        color: '#716550',       // Warm Earth / Desert Khaki (distinct from Germany's slate steel)
        accentColor: '#d6c7a1',
        textColor: '#f5f5f4',
        capital: null,
        flagEmoji: '🕊️'
    }
};

export const UNIT_TYPES = {
    INFANTRY: {
        id: 'infantry',
        name: 'Piyade (Infantry)',
        cost: 3,
        attackPower: 2,   // base combat weight
        defensePower: 3,  // infantry excels at holding ground
        icon: '🪖',
        description: 'Düşük maliyetli, savunması güçlü temel hat askeri.'
    },
    ARMOR: {
        id: 'armor',
        name: 'Zırhlı Birlik (Panzer)',
        cost: 6,
        attackPower: 5,   // spearhead assault
        defensePower: 3,
        icon: '🚜',
        description: 'Yüksek taarruz gücüne sahip zırhlı yarma kuvveti.'
    },
    AIR: {
        id: 'air',
        name: 'Hava Filosu (Air Wing)',
        cost: 8,
        attackPower: 4,
        defensePower: 2,
        icon: '✈️',
        range: 2,         // can strike 1-2 regions away
        description: 'Taktik bombardıman ile düşman tahkimatını yumuşatır.'
    }
};

export const TERRAIN_TYPES = {
    PLAINS: {
        id: 'plains',
        name: 'Düzlük / Ova',
        defenseBonus: 0.0,
        armorAttackBonus: 0.10,
        icon: '🌾'
    },
    CITY: {
        id: 'city',
        name: 'Şehir / Metropol',
        defenseBonus: 0.25,
        armorAttackBonus: -0.15,
        icon: '🏙️'
    },
    MOUNTAINS: {
        id: 'mountains',
        name: 'Dağlık Arazi',
        defenseBonus: 0.40,
        armorAttackBonus: -0.25,
        icon: '⛰️'
    },
    DESERT: {
        id: 'desert',
        name: 'Çöl Arazisi',
        defenseBonus: 0.0,
        armorAttackBonus: 0.20,
        icon: '🏜️'
    },
    COASTAL: {
        id: 'coastal',
        name: 'Kıyı / Boğaz',
        defenseBonus: 0.15,
        armorAttackBonus: 0.0,
        icon: '⚓'
    }
};

export const TURN_PHASES = {
    PRODUCTION: 'PRODUCTION',
    COMBAT: 'COMBAT',
    END_TURN: 'END_TURN'
};

/**
 * Message Factory helper
 */
export function createMessage(type, payload = {}, sender = 'unknown') {
    return {
        type,
        payload,
        sender,
        timestamp: Date.now()
    };
}
