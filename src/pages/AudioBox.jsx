import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Music, 
  Play, 
  Pause, 
  Upload, 
  Trash2, 
  AlertCircle, 
  Mic, 
  Radio, 
  Clock, 
  HardDrive 
} from "lucide-react";
import AudioRecorder from "../components/audio/AudioRecorder";
import WaveformPlayer from "../components/audio/WaveformPlayer";

const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024; // 25MB Limit

const AudioBox = () => {
  const { user } = useAuth();
  const [audioFiles, setAudioFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showRecorder, setShowRecorder] = useState(false);
  const [activePlayback, setActivePlayback] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "audio"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAudioFiles(docs);
        setLoading(false);
        if (docs.length > 0 && !activePlayback) {
          setActivePlayback(docs[0]);
        }
      },
      (err) => {
        console.error("Firestore audio snapshot error:", err);
        setErrorMsg("Failed to load audio reflections.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  /**
   * Save recorded voice memo from AudioRecorder to Firebase Storage + Firestore.
   */
  const handleSaveRecording = async ({ blob, title, duration, format }) => {
    if (!user || !blob) return;
    setUploading(true);
    setErrorMsg("");

    try {
      const fileName = `voice_memo_${Date.now()}.${format.includes('webm') ? 'webm' : 'wav'}`;
      const storagePath = `users/${user.uid}/audio/${fileName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(pct);
        },
        (error) => {
          console.error("Upload error:", error);
          setErrorMsg("Failed to upload voice memo to cloud storage.");
          setUploading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const newDoc = {
            userId: user.uid,
            title,
            duration,
            url: downloadUrl,
            storagePath,
            sizeBytes: blob.size,
            format,
            createdAt: serverTimestamp(),
          };

          const docRef = await addDoc(collection(db, "audio"), newDoc);
          setActivePlayback({ id: docRef.id, ...newDoc });
          setUploading(false);
          setProgress(0);
          setShowRecorder(false);
        }
      );
    } catch (err) {
      console.error("Recording save failed:", err);
      setErrorMsg("Failed to save audio reflection.");
      setUploading(false);
    }
  };

  /**
   * Handle custom file upload from desktop.
   */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("audio/")) {
      setErrorMsg("Please upload an audio file (MP3, WAV, WebM, M4A).");
      return;
    }

    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      setErrorMsg("Audio file exceeds maximum 25MB limit.");
      return;
    }

    setUploading(true);
    setErrorMsg("");

    const storagePath = `users/${user.uid}/audio/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(pct);
      },
      (error) => {
        console.error("Upload error:", error);
        setErrorMsg("Failed to upload audio track.");
        setUploading(false);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        const newDoc = {
          userId: user.uid,
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: downloadUrl,
          storagePath,
          sizeBytes: file.size,
          format: file.type,
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "audio"), newDoc);
        setActivePlayback({ id: docRef.id, ...newDoc });
        setUploading(false);
        setProgress(0);
      }
    );
  };

  /**
   * Delete audio track from Storage and Firestore.
   */
  const handleDeleteAudio = async (file, e) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently delete "${file.title}"?`)) return;
    setErrorMsg("");

    try {
      if (file.storagePath) {
        const storageRef = ref(storage, file.storagePath);
        await deleteObject(storageRef).catch((err) => console.warn("Storage deletion error:", err));
      }
      await deleteDoc(doc(db, "audio", file.id));
      if (activePlayback?.id === file.id) {
        const remaining = audioFiles.filter((f) => f.id !== file.id);
        setActivePlayback(remaining[0] || null);
      }
    } catch (err) {
      console.error("Audio deletion error:", err);
      setErrorMsg("Failed to delete audio file.");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Radio className="text-pink-400" size={32} />
            Voice Sanctuary & Audio Box
          </h1>
          <p className="text-text-dim text-sm sm:text-base">
            Record spoken reflections, listen to personal voice memos, and preserve audio memories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRecorder(!showRecorder)}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-pink-500/20"
          >
            <Mic size={16} />
            <span>{showRecorder ? "Hide Recorder" : "Record Memo"}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border border-white/10 disabled:opacity-50"
          >
            <Upload size={16} />
            <span>{uploading ? `${progress}%` : "Upload File"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-red-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Live Voice Recorder Panel */}
      <AnimatePresence>
        {showRecorder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AudioRecorder
              onRecordingComplete={handleSaveRecording}
              onCancel={() => setShowRecorder(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Waveform Player */}
      {activePlayback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WaveformPlayer
            audioUrl={activePlayback.url}
            title={activePlayback.title}
            duration={activePlayback.duration}
          />
        </motion.div>
      )}

      {/* Audio Memos List Grid */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Music size={20} className="text-pink-400" />
            <span>Audio Sanctuary Vault</span>
          </h3>
          <span className="text-xs font-mono text-text-dim">
            {audioFiles.length} {audioFiles.length === 1 ? "File" : "Files"}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : audioFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {audioFiles.map((file) => {
              const isCurrent = activePlayback?.id === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => setActivePlayback(file)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isCurrent
                      ? "bg-pink-500/10 border-pink-500/40 ring-1 ring-pink-500/20"
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-2">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                        isCurrent
                          ? "bg-pink-500 text-white shadow-md shadow-pink-500/20"
                          : "bg-white/5 text-text-dim group-hover:text-white"
                      }`}
                    >
                      <Music size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white truncate">
                        {file.title || "Voice Memo"}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-text-dim mt-0.5">
                        <span>
                          {file.createdAt?.toDate?.()
                            ? file.createdAt.toDate().toLocaleDateString()
                            : "Recent"}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(file.sizeBytes)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteAudio(file, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-text-dim hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Delete Audio"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-text-dim space-y-3">
            <Radio size={40} className="mx-auto text-white/10" />
            <p className="text-sm">No audio reflections recorded yet.</p>
            <button
              onClick={() => setShowRecorder(true)}
              className="text-xs text-pink-400 hover:text-pink-300 font-bold"
            >
              Start your first voice recording →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioBox;
