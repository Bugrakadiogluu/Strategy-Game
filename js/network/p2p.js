/**
 * p2p.js - WebRTC PeerJS Authoritative Host-Client Network Layer
 * Enables static/zero-server multiplayer via WebRTC DataChannels over standard HTTPS/WSS (Port 443).
 * Supports both Host and Client roles, as well as Local Loopback for Singleplayer Campaign.
 */

import { MSG_TYPES, createMessage } from './protocol.js';

export class NetworkManager {
    constructor() {
        this.peer = null;
        this.connections = new Map(); // clientId -> DataConnection (Host mode)
        this.hostConnection = null;   // DataConnection to host (Client mode)
        this.isHost = false;
        this.isLocalOnly = false;
        this.roomCode = null;
        this.myPeerId = null;
        this.playerName = 'Komutan';
        this.assignedFaction = null;

        // Callback hooks for application glue
        this.onMessageReceived = () => {};
        this.onPlayerConnected = () => {};
        this.onPlayerDisconnected = () => {};
        this.onStatusUpdate = () => {};
        this.onError = () => {};
    }

    /**
     * Generates a human-friendly 6-character room code (e.g., "W2-7A9B")
     */
    static generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `W2${code}`;
    }

    /**
     * Initializes single-player local loopback mode.
     * Operates 100% offline with zero network latency or external dependencies.
     */
    initLocalMode(playerName = 'Komutan', chosenFaction = 'germany') {
        this.reset();
        this.isHost = true;
        this.isLocalOnly = true;
        this.roomCode = 'LOCAL';
        this.playerName = playerName;
        this.assignedFaction = chosenFaction;
        this.onStatusUpdate('Tek Oyunculu Sefer Başlatıldı.');
        return Promise.resolve({ success: true, roomCode: 'LOCAL' });
    }

    /**
     * Starts Host role: creates authoritative WebRTC Peer and awaits connections.
     */
    initHost(playerName = 'Komutan', roomCode = null) {
        this.reset();
        this.isHost = true;
        this.isLocalOnly = false;
        this.playerName = playerName;
        this.roomCode = (roomCode || NetworkManager.generateRoomCode()).toUpperCase();

        const peerId = `ww2strat-${this.roomCode.toLowerCase()}`;

        return new Promise((resolve, reject) => {
            if (typeof window.Peer === 'undefined') {
                const err = 'PeerJS kütüphanesi yüklenemedi. Yerel mod kullanılabilir.';
                this.onError(err);
                return reject(err);
            }

            try {
                // Connect to public PeerJS signaling using standard TLS / Port 443
                this.peer = new window.Peer(peerId, {
                    debug: 1,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:global.stun.twilio.com:3478' }
                        ]
                    }
                });

                this.peer.on('open', (id) => {
                    this.myPeerId = id;
                    this.onStatusUpdate(`Lobi oluşturuldu. Oda Kodu: ${this.roomCode}`);
                    resolve({ success: true, roomCode: this.roomCode, peerId: id });
                });

                this.peer.on('connection', (conn) => {
                    this._handleIncomingConnection(conn);
                });

                this.peer.on('error', (err) => {
                    console.error('PeerJS Host Error:', err);
                    if (err.type === 'unavailable-id') {
                        // If ID collision, retry with new code
                        this.initHost(playerName).then(resolve).catch(reject);
                    } else {
                        this.onError(`Ağ Hatası: ${err.type || err.message}`);
                        reject(err);
                    }
                });
            } catch (ex) {
                console.error('Host peer init exception', ex);
                reject(ex);
            }
        });
    }

    /**
     * Starts Client role: connects to the Host's peer ID using room code.
     */
    initClient(playerName = 'Asker', roomCode, requestedFaction = null) {
        this.reset();
        this.isHost = false;
        this.isLocalOnly = false;
        this.playerName = playerName;
        this.roomCode = roomCode.trim().toUpperCase();
        this.requestedFaction = requestedFaction;

        const hostPeerId = `ww2strat-${this.roomCode.toLowerCase()}`;

        return new Promise((resolve, reject) => {
            if (typeof window.Peer === 'undefined') {
                const err = 'PeerJS kütüphanesi bulunamadı.';
                this.onError(err);
                return reject(err);
            }

            try {
                this.peer = new window.Peer(null, {
                    debug: 1,
                    config: {
                        iceServers: [
                            { urls: 'stun:stun.l.google.com:19302' },
                            { urls: 'stun:global.stun.twilio.com:3478' }
                        ]
                    }
                });

                this.peer.on('open', (id) => {
                    this.myPeerId = id;
                    this.onStatusUpdate(`Sunucuya (${this.roomCode}) bağlanılıyor...`);

                    const conn = this.peer.connect(hostPeerId, {
                        reliable: true,
                        serialization: 'json'
                    });

                    this.hostConnection = conn;

                    conn.on('open', () => {
                        this.onStatusUpdate(`Odaya bağlanıldı: ${this.roomCode}`);
                        // Send Join Request with desired faction
                        conn.send(createMessage(MSG_TYPES.LOBBY_JOIN, {
                            playerName: this.playerName,
                            clientPeerId: this.myPeerId,
                            requestedFaction: this.requestedFaction
                        }, this.myPeerId));
                        resolve({ success: true, roomCode: this.roomCode });
                    });

                    conn.on('data', (data) => {
                        this._handleIncomingData(data, 'host');
                    });

                    conn.on('close', () => {
                        this.onStatusUpdate('Sunucu ile bağlantı koptu.');
                        this.onPlayerDisconnected('host');
                    });

                    conn.on('error', (err) => {
                        console.error('Client connection error:', err);
                        this.onError(`Bağlantı hatası: ${err.message || err}`);
                        reject(err);
                    });
                });

                this.peer.on('error', (err) => {
                    console.error('PeerJS Client Error:', err);
                    this.onError(`Ağ Hatası: ${err.type || err.message}`);
                    reject(err);
                });
            } catch (ex) {
                console.error('Client init exception', ex);
                reject(ex);
            }
        });
    }

    /**
     * Host handling incoming client data connections
     */
    _handleIncomingConnection(conn) {
        this.connections.set(conn.peer, conn);
        if (conn.open) {
            this.onPlayerConnected(conn.peer);
        }

        conn.on('open', () => {
            this.connections.set(conn.peer, conn);
            this.onPlayerConnected(conn.peer);
        });

        conn.on('data', (data) => {
            this.connections.set(conn.peer, conn);
            this._handleIncomingData(data, conn.peer);
        });

        conn.on('close', () => {
            this.connections.delete(conn.peer);
            this.onPlayerDisconnected(conn.peer);
        });

        conn.on('error', (err) => {
            console.error(`[P2P] Bağlantı hatası (${conn.peer}):`, err);
            this.connections.delete(conn.peer);
            this.onPlayerDisconnected(conn.peer);
        });
    }

    /**
     * Incoming Data Processor
     */
    _handleIncomingData(rawMessage, senderId) {
        try {
            const message = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage;
            if (!message || !message.type) return;
            this.onMessageReceived(message, senderId);
        } catch (err) {
            console.error('[P2P] Ağ paketi işlenemedi:', err, rawMessage);
        }
    }

    /**
     * Broadcasts message to all connected clients (Host only)
     */
    broadcast(type, payload = {}) {
        if (this.isLocalOnly) return;
        if (!this.isHost) return;

        const msg = createMessage(type, payload, 'host');
        console.log(`[P2P Broadcast] ${type} to ${this.connections.size} connections`);
        for (const [peerId, conn] of this.connections.entries()) {
            if (conn) {
                if (conn.open) {
                    try {
                        conn.send(msg);
                    } catch (e) {
                        console.warn(`Failed to broadcast to ${peerId}:`, e);
                    }
                } else {
                    conn.on('open', () => {
                        try { conn.send(msg); } catch (_) {}
                    });
                }
            }
        }
    }

    sendTo(peerId, type, payload = {}) {
        if (this.isLocalOnly) return;
        const conn = this.connections.get(peerId);
        if (conn) {
            const msg = createMessage(type, payload, 'host');
            if (conn.open) {
                conn.send(msg);
            } else {
                conn.on('open', () => {
                    try { conn.send(msg); } catch (e) { console.warn(`Failed delayed send to ${peerId}:`, e); }
                });
            }
        } else {
            console.warn(`[P2P] Aktif bağlantı bulunamadı: ${peerId}`);
        }
    }

    /**
     * Sends message from Client to Host
     */
    sendToHost(type, payload = {}) {
        if (this.isLocalOnly) return;
        if (this.isHost) {
            // Self loopback
            this.onMessageReceived(createMessage(type, payload, 'host'), 'host');
            return;
        }

        if (this.hostConnection) {
            const msg = createMessage(type, payload, this.myPeerId);
            if (this.hostConnection.open) {
                this.hostConnection.send(msg);
            } else {
                this.hostConnection.on('open', () => {
                    try { this.hostConnection.send(msg); } catch (_) {}
                });
            }
        } else {
            console.warn('[P2P] Sunucu bağlantısı kapalı, mesaj gönderilemedi.');
        }
    }

    /**
     * Cleanup resources
     */
    reset() {
        if (this.connections) {
            for (const conn of this.connections.values()) {
                try { conn.close(); } catch (_) {}
            }
            this.connections.clear();
        }

        if (this.hostConnection) {
            try { this.hostConnection.close(); } catch (_) {}
            this.hostConnection = null;
        }

        if (this.peer) {
            try { this.peer.destroy(); } catch (_) {}
            this.peer = null;
        }

        this.isHost = false;
        this.isLocalOnly = false;
        this.roomCode = null;
        this.myPeerId = null;
    }
}
