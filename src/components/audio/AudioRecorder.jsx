import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Pause, Play, Trash2, Check, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AudioRecorder — Live Voice Memo Recording with Real-Time HTML5 Canvas Waveform
 */
const AudioRecorder = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [recordingTitle, setRecordingTitle] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  /**
   * Start Live Audio Stream & Canvas Waveform Analyzer.
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Web Audio Analyzer setup for real-time visualizer
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // MediaRecorder setup (prefers webm/opus)
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        cleanupStream();
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      // Draw real-time canvas visualizer
      drawWaveform();
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Unable to access microphone. Please grant audio permissions.');
    }
  };

  /**
   * Canvas visualizer loop.
   */
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        // Gradient color: Emerald to Teal
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#34d399');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth - 2, Math.max(3, barHeight));

        x += barWidth;
      }
    };

    render();
  }, []);

  /**
   * Pause/Resume recording.
   */
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      clearInterval(timerRef.current);
      setIsPaused(true);
    }
  };

  /**
   * Stop recording.
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const cleanupStream = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      cleanupStream();
    };
  }, []);

  const handleSave = () => {
    if (!audioBlob) return;
    const title = recordingTitle.trim() || `Voice Note ${new Date().toLocaleDateString()}`;
    onRecordingComplete({
      blob: audioBlob,
      title,
      duration,
      format: audioBlob.type || 'audio/webm',
    });
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
            <Radio size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Voice Sanctuary Recorder</h3>
            <p className="text-xs text-text-dim">Record private audio reflections and voice memos</p>
          </div>
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>REC • {formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Visualizer Canvas / State Box */}
      <div className="h-28 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden p-4">
        {isRecording ? (
          <canvas ref={canvasRef} width={400} height={100} className="w-full h-full" />
        ) : audioUrl ? (
          <div className="w-full flex flex-col items-center gap-2">
            <audio src={audioUrl} controls className="w-full h-10 accent-brand-accent" />
            <span className="text-[11px] font-mono text-text-dim">Recorded: {formatTime(duration)}</span>
          </div>
        ) : (
          <div className="text-center text-text-dim space-y-1">
            <Mic size={28} className="mx-auto text-white/20 mb-1" />
            <p className="text-xs">Click start to record voice reflection</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!isRecording && !audioBlob ? (
          <button
            onClick={startRecording}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-pink-500/20 text-sm"
          >
            <Mic size={18} />
            <span>Start Recording</span>
          </button>
        ) : isRecording ? (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={togglePause}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/5 transition-colors"
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md"
            >
              <Square size={16} />
              <span>Finish</span>
            </button>
          </div>
        ) : (
          <div className="w-full space-y-3">
            <input
              type="text"
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              placeholder="Name this voice memo..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-accent/50"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-accent/20 transition-all text-xs"
              >
                <Check size={16} />
                <span>Save to Audio Vault</span>
              </button>
              <button
                onClick={() => {
                  setAudioBlob(null);
                  setAudioUrl('');
                  setDuration(0);
                  if (onCancel) onCancel();
                }}
                className="p-3 text-text-dim hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Discard"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
