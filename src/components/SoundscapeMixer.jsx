import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Waves, 
  Flame, 
  TreePine, 
  Headphones, 
  Radio, 
  Clock, 
  X, 
  Play, 
  Pause,
  Sliders
} from 'lucide-react';
import ambientEngine from '../lib/ambientEngine';

const SOUNDS = [
  { id: 'brown', name: 'Brown Noise', desc: 'Deep soothing rumble', icon: Radio, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'rain', name: 'Gentle Rain', desc: 'Soft droplets & drizzle', icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'ocean', name: 'Ocean Waves', desc: 'Rhythmic tidal surge', icon: Waves, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { id: 'campfire', name: 'Campfire', desc: 'Warm crackling embers', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { id: 'forest', name: 'Forest Sanctuary', desc: 'Wind whisper & bells', icon: TreePine, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'binaural', name: 'Alpha Beats (10Hz)', desc: 'Focus wave (Headphones)', icon: Headphones, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
];

const SoundscapeMixer = ({ isOpen, onClose }) => {
  const [activeTracks, setActiveTracks] = useState({});
  const [volumes, setVolumes] = useState({
    brown: 0.5,
    rain: 0.5,
    ocean: 0.5,
    campfire: 0.5,
    forest: 0.5,
    binaural: 0.4,
  });
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // Sync state with active engine tracks
  const toggleTrack = (soundId) => {
    const isCurrentlyActive = !!activeTracks[soundId];
    if (isCurrentlyActive) {
      ambientEngine.stopTrack(soundId);
      setActiveTracks((prev) => {
        const next = { ...prev };
        delete next[soundId];
        return next;
      });
    } else {
      const vol = volumes[soundId] || 0.5;
      if (soundId === 'brown') ambientEngine.startBrownNoise(vol);
      else if (soundId === 'rain') ambientEngine.startRain(vol);
      else if (soundId === 'ocean') ambientEngine.startOcean(vol);
      else if (soundId === 'campfire') ambientEngine.startCampfire(vol);
      else if (soundId === 'forest') ambientEngine.startForest(vol);
      else if (soundId === 'binaural') ambientEngine.startBinaural(vol);

      setActiveTracks((prev) => ({ ...prev, [soundId]: true }));
    }
  };

  const handleVolumeChange = (soundId, val) => {
    const newVol = parseFloat(val);
    setVolumes((prev) => ({ ...prev, [soundId]: newVol }));
    ambientEngine.setTrackVolume(soundId, newVol);
  };

  const handleMasterVolumeChange = (val) => {
    const newVol = parseFloat(val);
    setMasterVolume(newVol);
    if (!isMuted) {
      ambientEngine.setMasterVolume(newVol);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      ambientEngine.setMasterVolume(masterVolume);
      setIsMuted(false);
    } else {
      ambientEngine.setMasterVolume(0);
      setIsMuted(true);
    }
  };

  const handleSetTimer = (mins) => {
    setTimerMinutes(mins);
    if (mins === 0) {
      ambientEngine.stopTimer();
      setRemainingTime(0);
    } else {
      ambientEngine.startTimer(
        mins,
        (secondsLeft) => setRemainingTime(secondsLeft),
        () => {
          setActiveTracks({});
          setRemainingTime(0);
          setTimerMinutes(0);
        }
      );
    }
  };

  const stopAll = () => {
    ambientEngine.stopAll();
    setActiveTracks({});
    setRemainingTime(0);
    setTimerMinutes(0);
  };

  const hasAnyActive = Object.keys(activeTracks).length > 0;

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl glass-card p-6 sm:p-8 rounded-3xl shadow-2xl ring-1 ring-white/10 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                <Sliders size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Ambient Sanctuary
                  {hasAnyActive && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </h2>
                <p className="text-xs text-text-dim">
                  Procedural Web Audio soundscapes for deep focus & meditation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasAnyActive && (
                <button
                  onClick={stopAll}
                  className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Stop All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-text-dim hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Sound Grid */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SOUNDS.map((sound) => {
                const Icon = sound.icon;
                const isActive = !!activeTracks[sound.id];
                const volume = volumes[sound.id] || 0.5;

                return (
                  <div
                    key={sound.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive
                        ? `${sound.bg} ${sound.border} ring-1 ring-white/10`
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleTrack(sound.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform active:scale-95 ${
                            isActive
                              ? `${sound.bg} ${sound.color}`
                              : 'bg-white/5 text-text-dim hover:text-white'
                          }`}
                        >
                          <Icon size={20} />
                        </button>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {sound.name}
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            )}
                          </h4>
                          <p className="text-[11px] text-text-dim">{sound.desc}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleTrack(sound.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/20'
                            : 'bg-white/5 text-text-dim hover:text-white'
                        }`}
                      >
                        {isActive ? 'Active' : 'Off'}
                      </button>
                    </div>

                    {/* Track Volume Slider */}
                    {isActive && (
                      <div className="pt-2 border-t border-white/5 flex items-center gap-3">
                        <Volume2 size={14} className="text-text-dim shrink-0" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => handleVolumeChange(sound.id, e.target.value)}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-accent"
                        />
                        <span className="text-[10px] font-mono text-text-dim w-7 text-right">
                          {Math.round(volume * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Controls: Master Volume & Sleep Timer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Master Volume */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={toggleMute}
                className={`p-2 rounded-lg transition-colors ${
                  isMuted ? 'text-red-400 bg-red-500/10' : 'text-text-dim hover:text-white'
                }`}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : masterVolume}
                onChange={(e) => handleMasterVolumeChange(e.target.value)}
                className="w-28 sm:w-36 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-accent"
              />
              <span className="text-xs font-mono text-text-dim">
                {isMuted ? 'Muted' : `${Math.round(masterVolume * 100)}%`}
              </span>
            </div>

            {/* Sleep Timer Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Clock size={16} className="text-text-dim" />
              <span className="text-xs text-text-dim">Timer:</span>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                {[0, 15, 30, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSetTimer(mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      timerMinutes === mins
                        ? 'bg-brand-accent text-white shadow-sm'
                        : 'text-text-dim hover:text-white'
                    }`}
                  >
                    {mins === 0 ? 'Off' : `${mins}m`}
                  </button>
                ))}
              </div>
              {remainingTime > 0 && (
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                  {formatTimer(remainingTime)}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SoundscapeMixer;
