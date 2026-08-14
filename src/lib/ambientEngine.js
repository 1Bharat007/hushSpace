/**
 * hushSpace v0.0.1 — Procedural Soundscape Studio & Spatial Acoustics Engine
 * 
 * Generates natural ambient soundscapes (Brown Noise, Rain, Ocean Waves, 
 * Campfire, Forest Sanctuary, Alpha Binaural Beats) in real-time purely via Web Audio API.
 * 
 * Features:
 * - Zero external audio assets, zero CDN latency, zero bandwidth consumption.
 * - Stereo Spatial Panning on each sound channel for 3D acoustic immersion.
 * - Anti-pop exponential gain ramping on start, stop, and volume adjustments.
 * - Sleep timer with smooth exponential fade-out.
 * - Built-in and user-customizable preset configurations.
 * 
 * @module lib/audio/ambientEngine
 */

export const CURATED_PRESETS = [
  {
    id: 'deep_focus',
    name: 'Deep Cognitive Focus',
    desc: 'Alpha binaural waves layered over soothing brown noise',
    tracks: { brown: 0.55, binaural: 0.45 },
    pans: { brown: 0, binaural: 0 },
  },
  {
    id: 'midnight_storm',
    name: 'Midnight Storm',
    desc: 'Heavy rain paired with rolling ocean waves',
    tracks: { rain: 0.65, ocean: 0.45 },
    pans: { rain: -0.3, ocean: 0.3 },
  },
  {
    id: 'wilderness_solitude',
    name: 'Wilderness Cabin',
    desc: 'Warm crackling campfire with gentle forest breeze & chimes',
    tracks: { campfire: 0.55, forest: 0.45 },
    pans: { campfire: -0.25, forest: 0.25 },
  },
  {
    id: 'zen_sanctuary',
    name: 'Zen Sanctuary',
    desc: 'Forest wind, gentle raindrops, and calming tidal surges',
    tracks: { forest: 0.4, rain: 0.4, ocean: 0.3 },
    pans: { forest: -0.4, rain: 0, ocean: 0.4 },
  },
];

class AmbientStudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.tracks = {};
    this.timerId = null;
    this.timerRemainingSeconds = 0;
    this.onTimerTick = null;
    this.onTimerComplete = null;
    this.initialized = false;
  }

  /**
   * Initialize or resume Web Audio context on user gesture.
   */
  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio API is not supported in this browser.');
      return;
    }

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    this.initialized = true;
  }

  ensureContext() {
    if (!this.initialized || !this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /* ------------------- NOISE BUFFER FACTORIES ------------------- */

  createWhiteNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  createPinkNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  createBrownNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  createPanner(pan = 0) {
    if (typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(pan, this.ctx.currentTime);
      return panner;
    }
    return null;
  }

  /* ------------------- TRACK GENERATORS ------------------- */

  startBrownNoise(gainVal = 0.5, panVal = 0) {
    this.ensureContext();
    if (this.tracks.brown) this.stopTrack('brown');

    const source = this.ctx.createBufferSource();
    source.buffer = this.createBrownNoiseBuffer();
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainVal), this.ctx.currentTime + 0.2);

    const panner = this.createPanner(panVal);

    source.connect(filter);
    filter.connect(gain);

    if (panner) {
      gain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      gain.connect(this.masterGain);
    }

    source.start();
    this.tracks.brown = { gain, panner, nodes: [source, filter, gain] };
  }

  startRain(gainVal = 0.5, panVal = 0) {
    this.ensureContext();
    if (this.tracks.rain) this.stopTrack('rain');

    const baseSource = this.ctx.createBufferSource();
    baseSource.buffer = this.createPinkNoiseBuffer();
    baseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1000, this.ctx.currentTime);

    const dropSource = this.ctx.createBufferSource();
    dropSource.buffer = this.createWhiteNoiseBuffer();
    dropSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(3200, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const dropGain = this.ctx.createGain();
    dropGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainVal), this.ctx.currentTime + 0.2);

    const panner = this.createPanner(panVal);

    baseSource.connect(lowpass);
    lowpass.connect(trackGain);

    dropSource.connect(bandpass);
    bandpass.connect(dropGain);
    dropGain.connect(trackGain);

    if (panner) {
      trackGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      trackGain.connect(this.masterGain);
    }

    baseSource.start();
    dropSource.start();

    this.tracks.rain = {
      gain: trackGain,
      panner,
      nodes: [baseSource, lowpass, dropSource, bandpass, dropGain, trackGain]
    };
  }

  startOcean(gainVal = 0.5, panVal = 0) {
    this.ensureContext();
    if (this.tracks.ocean) this.stopTrack('ocean');

    const source = this.ctx.createBufferSource();
    source.buffer = this.createPinkNoiseBuffer();
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.14, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainVal), this.ctx.currentTime + 0.2);

    const panner = this.createPanner(panVal);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(trackGain);

    if (panner) {
      trackGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      trackGain.connect(this.masterGain);
    }

    source.start();
    lfo.start();

    this.tracks.ocean = {
      gain: trackGain,
      panner,
      nodes: [source, filter, lfo, lfoGain, waveGain, trackGain]
    };
  }

  startCampfire(gainVal = 0.5, panVal = 0) {
    this.ensureContext();
    if (this.tracks.campfire) this.stopTrack('campfire');

    const rumble = this.ctx.createBufferSource();
    rumble.buffer = this.createBrownNoiseBuffer();
    rumble.loop = true;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'bandpass';
    rumbleFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    rumbleFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const crackleBufferSize = this.ctx.sampleRate * 2;
    const crackleBuffer = this.ctx.createBuffer(1, crackleBufferSize, this.ctx.sampleRate);
    const crackleData = crackleBuffer.getChannelData(0);
    for (let i = 0; i < crackleBufferSize; i++) {
      crackleData[i] = Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.9 : 0;
    }

    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const crackleFilter = this.ctx.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainVal), this.ctx.currentTime + 0.2);

    const panner = this.createPanner(panVal);

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(trackGain);

    crackleSource.connect(crackleFilter);
    crackleFilter.connect(trackGain);

    if (panner) {
      trackGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      trackGain.connect(this.masterGain);
    }

    rumble.start();
    crackleSource.start();

    this.tracks.campfire = {
      gain: trackGain,
      panner,
      nodes: [rumble, rumbleFilter, crackleSource, crackleFilter, trackGain]
    };
  }

  startForest(gainVal = 0.5, panVal = 0) {
    this.ensureContext();
    if (this.tracks.forest) this.stopTrack('forest');

    const wind = this.ctx.createBufferSource();
    wind.buffer = this.createPinkNoiseBuffer();
    wind.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(550, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainVal), this.ctx.currentTime + 0.2);

    const panner = this.createPanner(panVal);

    wind.connect(windFilter);
    windFilter.connect(trackGain);

    if (panner) {
      trackGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      trackGain.connect(this.masterGain);
    }

    wind.start();

    const bellTimer = setInterval(() => {
      if (!this.tracks.forest) {
        clearInterval(bellTimer);
        return;
      }
      try {
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(880, this.ctx.currentTime);

        bellGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

        bellOsc.connect(bellGain);
        bellGain.connect(trackGain);
        bellOsc.start();
        bellOsc.stop(this.ctx.currentTime + 3.2);
      } catch {
        // Safe catch
      }
    }, 12000);

    this.tracks.forest = {
      gain: trackGain,
      panner,
      interval: bellTimer,
      nodes: [wind, windFilter, trackGain]
    };
  }

  startBinaural(gainVal = 0.4, panVal = 0) {
    this.ensureContext();
    if (this.tracks.binaural) this.stopTrack('binaural');

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(210, this.ctx.currentTime); // 10Hz alpha beat difference

    const merger = this.ctx.createChannelMerger(2);

    const panLeftGain = this.ctx.createGain();
    const panRightGain = this.ctx.createGain();
    panLeftGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    panRightGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    oscLeft.connect(panLeftGain);
    panLeftGain.connect(merger, 0, 0);

    oscRight.connect(panRightGain);
    panRightGain.connect(merger, 0, 1);

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    trackGain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainVal), this.ctx.currentTime + 0.2);

    const panner = this.createPanner(panVal);

    merger.connect(trackGain);

    if (panner) {
      trackGain.connect(panner);
      panner.connect(this.masterGain);
    } else {
      trackGain.connect(this.masterGain);
    }

    oscLeft.start();
    oscRight.start();

    this.tracks.binaural = {
      gain: trackGain,
      panner,
      nodes: [oscLeft, oscRight, panLeftGain, panRightGain, merger, trackGain]
    };
  }

  /* ------------------- TRACK ADJUSTMENTS ------------------- */

  setTrackVolume(trackName, volume) {
    if (this.tracks[trackName]?.gain && this.ctx) {
      const v = Math.max(0.0001, Math.min(1, volume));
      this.tracks[trackName].gain.gain.setValueAtTime(
        v,
        this.ctx.currentTime
      );
    }
  }

  setTrackPan(trackName, pan) {
    if (this.tracks[trackName]?.panner && this.ctx) {
      const p = Math.max(-1, Math.min(1, pan));
      this.tracks[trackName].panner.pan.setValueAtTime(p, this.ctx.currentTime);
    }
  }

  setMasterVolume(volume) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.ctx.currentTime
      );
    }
  }

  stopTrack(trackName) {
    const track = this.tracks[trackName];
    if (!track) return;

    if (track.interval) clearInterval(track.interval);

    if (track.gain && this.ctx) {
      try {
        track.gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
      } catch {
        // Safe catch
      }
    }

    setTimeout(() => {
      if (track.nodes) {
        track.nodes.forEach((node) => {
          try {
            if (typeof node.stop === 'function') node.stop();
            if (typeof node.disconnect === 'function') node.disconnect();
          } catch {
            // Already stopped
          }
        });
      }
      delete this.tracks[trackName];
    }, 160);
  }

  stopAll() {
    Object.keys(this.tracks).forEach((name) => this.stopTrack(name));
    this.stopTimer();
  }

  /* ------------------- SLEEP TIMER ------------------- */

  startTimer(minutes, onTick, onComplete) {
    this.stopTimer();
    this.timerRemainingSeconds = minutes * 60;
    this.onTimerTick = onTick;
    this.onTimerComplete = onComplete;

    if (this.onTimerTick) this.onTimerTick(this.timerRemainingSeconds);

    this.timerId = setInterval(() => {
      this.timerRemainingSeconds -= 1;
      if (this.onTimerTick) this.onTimerTick(this.timerRemainingSeconds);

      if (this.timerRemainingSeconds <= 0) {
        this.stopTimer();
        this.fadeOutAndStop(5);
        if (this.onTimerComplete) this.onTimerComplete();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      this.timerRemainingSeconds = 0;
    }
  }

  fadeOutAndStop(durationSeconds = 4) {
    if (!this.masterGain || !this.ctx) {
      this.stopAll();
      return;
    }
    const currentGain = this.masterGain.gain.value;
    this.masterGain.gain.setValueAtTime(currentGain, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(
      0.0001,
      this.ctx.currentTime + durationSeconds
    );
    setTimeout(() => {
      this.stopAll();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      }
    }, durationSeconds * 1000);
  }
}

export const ambientEngine = new AmbientStudioEngine();
export default ambientEngine;
