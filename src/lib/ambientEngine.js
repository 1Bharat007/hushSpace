/**
 * hushSpace — Procedural Ambient Soundscape Engine
 * 
 * Generates natural ambient soundscapes (Brown Noise, Rain, Forest, Ocean Waves, 
 * Campfire, Binaural Alpha Beats) in real-time purely via Web Audio API.
 * 
 * Zero external audio assets, zero CDN latency, zero bandwidth consumption.
 * 
 * @module lib/ambientEngine
 */

class AmbientEngine {
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
   * Initialize Web Audio context on user gesture.
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

  /**
   * Ensure AudioContext is running before performing audio actions.
   */
  ensureContext() {
    if (!this.initialized || !this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Create a 5-second looping White Noise AudioBuffer.
   */
  createWhiteNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Create a 5-second looping Pink Noise AudioBuffer using Paul Kellet's algorithm.
   */
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

  /**
   * Create a 5-second looping Brown (Red) Noise AudioBuffer.
   */
  createBrownNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Gain compensation
    }
    return buffer;
  }

  /* ------------------- TRACK GENERATORS ------------------- */

  /**
   * 1. Brown Noise Generator
   */
  startBrownNoise(gainVal = 0.5) {
    this.ensureContext();
    if (this.tracks.brown) this.stopTrack('brown');

    const source = this.ctx.createBufferSource();
    source.buffer = this.createBrownNoiseBuffer();
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.tracks.brown = { source, gain, filter, nodes: [source, filter, gain] };
  }

  /**
   * 2. Rain Generator (Filtered pink noise + highpass droplets)
   */
  startRain(gainVal = 0.5) {
    this.ensureContext();
    if (this.tracks.rain) this.stopTrack('rain');

    // Base rain rumble
    const baseSource = this.ctx.createBufferSource();
    baseSource.buffer = this.createPinkNoiseBuffer();
    baseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1000, this.ctx.currentTime);

    // Rain droplet sizzle
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
    trackGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);

    baseSource.connect(lowpass);
    lowpass.connect(trackGain);

    dropSource.connect(bandpass);
    bandpass.connect(dropGain);
    dropGain.connect(trackGain);

    trackGain.connect(this.masterGain);

    baseSource.start();
    dropSource.start();

    this.tracks.rain = {
      gain: trackGain,
      nodes: [baseSource, lowpass, dropSource, bandpass, dropGain, trackGain]
    };
  }

  /**
   * 3. Ocean Waves Generator (Filtered noise with rhythmic LFO amplitude modulation)
   */
  startOcean(gainVal = 0.5) {
    this.ensureContext();
    if (this.tracks.ocean) this.stopTrack('ocean');

    const source = this.ctx.createBufferSource();
    source.buffer = this.createPinkNoiseBuffer();
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    // LFO to modulate wave surge every ~7 seconds
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.14, this.ctx.currentTime); // ~7s cycle

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(trackGain);
    trackGain.connect(this.masterGain);

    source.start();
    lfo.start();

    this.tracks.ocean = {
      gain: trackGain,
      nodes: [source, filter, lfo, lfoGain, waveGain, trackGain]
    };
  }

  /**
   * 4. Campfire Generator (Warm low rumble + crackle impulses)
   */
  startCampfire(gainVal = 0.5) {
    this.ensureContext();
    if (this.tracks.campfire) this.stopTrack('campfire');

    // Warm fire bass rumble
    const rumble = this.ctx.createBufferSource();
    rumble.buffer = this.createBrownNoiseBuffer();
    rumble.loop = true;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'bandpass';
    rumbleFilter.frequency.setValueAtTime(180, this.ctx.currentTime);
    rumbleFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // Crackle generator (short buffer with sparse sharp spikes)
    const crackleBufferSize = this.ctx.sampleRate * 2;
    const crackleBuffer = this.ctx.createBuffer(1, crackleBufferSize, this.ctx.sampleRate);
    const crackleData = crackleBuffer.getChannelData(0);
    for (let i = 0; i < crackleBufferSize; i++) {
      if (Math.random() < 0.0006) {
        crackleData[i] = (Math.random() * 2 - 1) * 0.9;
      } else {
        crackleData[i] = 0;
      }
    }

    const crackleSource = this.ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const crackleFilter = this.ctx.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(trackGain);

    crackleSource.connect(crackleFilter);
    crackleFilter.connect(trackGain);

    trackGain.connect(this.masterGain);

    rumble.start();
    crackleSource.start();

    this.tracks.campfire = {
      gain: trackGain,
      nodes: [rumble, rumbleFilter, crackleSource, crackleFilter, trackGain]
    };
  }

  /**
   * 5. Forest Sanctuary (Gentle wind whisper + periodic subtle bird chime)
   */
  startForest(gainVal = 0.5) {
    this.ensureContext();
    if (this.tracks.forest) this.stopTrack('forest');

    // Wind whisper
    const wind = this.ctx.createBufferSource();
    wind.buffer = this.createPinkNoiseBuffer();
    wind.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(550, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);

    wind.connect(windFilter);
    windFilter.connect(trackGain);
    trackGain.connect(this.masterGain);

    wind.start();

    // Subtle singing bowl bell chime scheduled periodically
    let bellTimer = setInterval(() => {
      if (!this.tracks.forest) {
        clearInterval(bellTimer);
        return;
      }
      try {
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5

        bellGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.0);

        bellOsc.connect(bellGain);
        bellGain.connect(trackGain);
        bellOsc.start();
        bellOsc.stop(this.ctx.currentTime + 3.2);
      } catch {
        // Context might be closed
      }
    }, 12000);

    this.tracks.forest = {
      gain: trackGain,
      interval: bellTimer,
      nodes: [wind, windFilter, trackGain]
    };
  }

  /**
   * 6. Alpha Binaural Beats (200Hz Left / 210Hz Right -> 10Hz Alpha Focus Wave)
   * Note: Requires stereo headphones for neurological entrainment effect.
   */
  startBinaural(gainVal = 0.4) {
    this.ensureContext();
    if (this.tracks.binaural) this.stopTrack('binaural');

    // Left channel: 200 Hz carrier
    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(200, this.ctx.currentTime);

    // Right channel: 210 Hz carrier (10 Hz beat difference)
    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(210, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);

    const panLeftGain = this.ctx.createGain();
    const panRightGain = this.ctx.createGain();
    panLeftGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    panRightGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    oscLeft.connect(panLeftGain);
    panLeftGain.connect(merger, 0, 0); // Left channel

    oscRight.connect(panRightGain);
    panRightGain.connect(merger, 0, 1); // Right channel

    const trackGain = this.ctx.createGain();
    trackGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);

    merger.connect(trackGain);
    trackGain.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();

    this.tracks.binaural = {
      gain: trackGain,
      nodes: [oscLeft, oscRight, panLeftGain, panRightGain, merger, trackGain]
    };
  }

  /* ------------------- TRACK CONTROL ------------------- */

  setTrackVolume(trackName, volume) {
    if (this.tracks[trackName]?.gain && this.ctx) {
      this.tracks[trackName].gain.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)),
        this.ctx.currentTime
      );
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

    if (track.interval) {
      clearInterval(track.interval);
    }

    if (track.nodes) {
      track.nodes.forEach((node) => {
        try {
          if (typeof node.stop === 'function') node.stop();
          if (typeof node.disconnect === 'function') node.disconnect();
        } catch {
          // Node already stopped or disconnected
        }
      });
    }

    delete this.tracks[trackName];
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

  fadeOutAndStop(durationSeconds = 3) {
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

// Export singleton instance
export const ambientEngine = new AmbientEngine();
export default ambientEngine;
