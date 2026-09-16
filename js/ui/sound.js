/**
 * sound.js - Procedural Web Audio API Sound Synthesizer
 * Generates realistic military sound effects (artillery, air siren, radio beeps,
 * clicks, fanfare) without downloading ANY external MP3/audio files.
 */

export class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.masterVolume = 0.35;

        // Load mute state from localStorage if available
        try {
            const savedMute = localStorage.getItem('ww2_sound_muted');
            if (savedMute !== null) {
                this.isMuted = savedMute === 'true';
            }
        } catch (_) {}
    }

    _ensureContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        try {
            localStorage.setItem('ww2_sound_muted', this.isMuted.toString());
        } catch (_) {}
        return this.isMuted;
    }

    setMuted(muted) {
        this.isMuted = !!muted;
        try {
            localStorage.setItem('ww2_sound_muted', this.isMuted.toString());
        } catch (_) {}
    }

    /**
     * UI Click / Terminal Tap
     */
    playClick() {
        if (this.isMuted) return;
        this._ensureContext();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(this.masterVolume * 0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    /**
     * Military Morse / Radio Chirp
     */
    playRadioBeep() {
        if (this.isMuted) return;
        this._ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1150, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(this.masterVolume * 0.25, now + 0.01);
        gain.gain.setValueAtTime(0, now + 0.06);
        gain.gain.setValueAtTime(this.masterVolume * 0.25, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.17);
    }

    /**
     * Heavy Artillery / Cannon Blast with Sub-Bass Explosion
     */
    playArtillery() {
        if (this.isMuted) return;
        this._ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // 1. Noise Generator for Explosive Crack
        const bufferSize = this.ctx.sampleRate * 0.6; // 600ms noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Low-pass filter for thunderous explosion body
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(45, now + 0.5);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(this.masterVolume * 0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        // 2. Sub-bass thump (cannon muzzle punch)
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(140, now);
        subOsc.frequency.exponentialRampToValueAtTime(28, now + 0.35);

        subGain.gain.setValueAtTime(this.masterVolume * 0.9, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        subOsc.connect(subGain);
        subGain.connect(this.ctx.destination);

        noise.start(now);
        subOsc.start(now);
        subOsc.stop(now + 0.4);
    }

    /**
     * Air Raid / Dive Bomber Siren
     */
    playAirRaid() {
        if (this.isMuted) return;
        this._ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';

        // Siren sweep up and down
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(720, now + 0.45);
        osc.frequency.linearRampToValueAtTime(420, now + 0.9);
        osc.frequency.linearRampToValueAtTime(640, now + 1.2);
        osc.frequency.linearRampToValueAtTime(220, now + 1.6);

        // Bandpass to give old mechanical megaphone feel
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(600, now);
        bandpass.Q.setValueAtTime(3.0, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.5, now + 0.2);
        gain.gain.setValueAtTime(this.masterVolume * 0.5, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);

        osc.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.7);
    }

    /**
     * Unit Deployment / Marching Cadence
     */
    playDeploy() {
        if (this.isMuted) return;
        this._ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const stepTime = now + (i * 0.08);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120 - (i * 15), stepTime);
            osc.frequency.exponentialRampToValueAtTime(40, stepTime + 0.06);

            gain.gain.setValueAtTime(this.masterVolume * 0.4, stepTime);
            gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(stepTime);
            osc.stop(stepTime + 0.07);
        }
    }

    /**
     * Triumphant Brass Fanfare (Territory Conquered / Victory)
     */
    playVictory() {
        if (this.isMuted) return;
        this._ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Notes: G4 (392Hz), C5 (523Hz), E5 (659Hz), G5 (784Hz)
        const notes = [
            { f: 392, start: 0.0, dur: 0.15 },
            { f: 523, start: 0.16, dur: 0.15 },
            { f: 659, start: 0.32, dur: 0.18 },
            { f: 784, start: 0.52, dur: 0.55 }
        ];

        for (const n of notes) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(n.f, now + n.start);

            // Filter out harsh high harmonics for warm brass
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1800, now + n.start);

            gain.gain.setValueAtTime(0.001, now + n.start);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.4, now + n.start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + n.start);
            osc.stop(now + n.start + n.dur + 0.02);
        }
    }

    /**
     * Somber Drone (Defeat / Retreat)
     */
    playDefeat() {
        if (this.isMuted) return;
        this._ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [130.81, 155.56, 196.0]; // C minor triad in bass

        for (const f of notes) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            osc.frequency.exponentialRampToValueAtTime(f * 0.85, now + 1.2);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.25, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 1.5);
        }
    }
}
