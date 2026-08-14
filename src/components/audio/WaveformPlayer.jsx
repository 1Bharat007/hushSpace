import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Music, 
  Gauge 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * WaveformPlayer — Interactive Audio Player with visual scrubber and variable speed controls
 */
const WaveformPlayer = ({ audioUrl, title, duration: initialDuration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleSkip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleSeek = (e) => {
    const progressBar = progressBarRef.current;
    const audio = audioRef.current;
    if (!progressBar || !audio || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = pct * duration;
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : val;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (sec) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Fake waveform bars for visual aesthetic
  const waveformBars = Array.from({ length: 48 }, (_, i) => {
    const heightPct = Math.sin(i * 0.4) * 35 + 50 + ((i % 5) * 6);
    const isActive = (i / 48) * 100 <= progressPct;
    return { heightPct, isActive };
  });

  return (
    <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
            <Music size={16} />
          </div>
          <h4 className="text-sm font-bold text-white truncate">{title || 'Voice Reflection'}</h4>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-text-dim shrink-0">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Waveform Scrubber */}
      <div
        ref={progressBarRef}
        onClick={handleSeek}
        className="h-12 bg-black/30 rounded-xl p-2 flex items-center justify-between gap-0.5 cursor-pointer group relative"
      >
        {waveformBars.map((bar, idx) => (
          <div
            key={idx}
            className={`flex-1 rounded-full transition-all duration-150 ${
              bar.isActive ? 'bg-brand-accent' : 'bg-white/10 group-hover:bg-white/20'
            }`}
            style={{ height: `${Math.max(15, Math.min(100, bar.heightPct))}%` }}
          />
        ))}
      </div>

      {/* Playback Controls & Speed Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Main Transport */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSkip(-10)}
            className="p-2 text-text-dim hover:text-white transition-colors"
            title="Skip back 10s"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white flex items-center justify-center shadow-lg shadow-brand-accent/20 transition-all active:scale-95"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          <button
            onClick={() => handleSkip(10)}
            className="p-2 text-text-dim hover:text-white transition-colors"
            title="Skip forward 10s"
          >
            <RotateCw size={16} />
          </button>
        </div>

        {/* Speed Multiplier & Volume */}
        <div className="flex items-center gap-3">
          {/* Speed Pills */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSpeedChange(rate)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  playbackRate === rate
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'text-text-dim hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="text-text-dim hover:text-white">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveformPlayer;
