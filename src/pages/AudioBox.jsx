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
import { Music, Play, Pause, Upload, Trash2, AlertCircle } from "lucide-react";

const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024; // 25MB Limit

const AudioBox = () => {
  const { user } = useAuth();
  const [audioFiles, setAudioFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Player state
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());

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
        setAudioFiles(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Firestore audio snapshot error:", err);
        setErrorMsg("Failed to load voice audio notes.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  // Audio Player Listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime || 0);

    audio.addEventListener("loadeddata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("loadeddata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.pause();
    };
  }, []);

  const playAudio = (file) => {
    if (currentAudio?.id === file.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      audioRef.current.src = file.url;
      audioRef.current
        .play()
        .then(() => {
          setCurrentAudio(file);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio play error:", err);
          setErrorMsg("Failed to play audio track.");
        });
    }
  };

  const handleUpload = async (e) => {
    setErrorMsg("");
    const file = e.target.files[0];
    if (!file) return;

    // Client-side file type and file size validation (Abuse Protection)
    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|m4a|ogg|aac|flac)$/i)) {
      setErrorMsg("Please select a valid audio file (MP3, WAV, M4A, OGG, AAC).");
      return;
    }

    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      setErrorMsg("Audio file size exceeds 25MB limit. Please select a smaller recording.");
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `audio/${user.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error("Upload failed", error);
        setErrorMsg("Audio upload failed. Please try again.");
        setUploading(false);
        setProgress(0);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "audio"), {
            userId: user.uid,
            url: downloadURL,
            fileName: file.name,
            storagePath: storageRef.fullPath,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.error("Error saving audio metadata:", err);
          setErrorMsg("Audio uploaded, but failed to save track details.");
        } finally {
          setUploading(false);
          setProgress(0);
        }
      }
    );
  };

  const handleDelete = async (file) => {
    if (!window.confirm("Delete this audio note?")) return;
    setErrorMsg("");

    if (currentAudio?.id === file.id) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentAudio(null);
    }

    try {
      const storageRef = ref(storage, file.storagePath);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, "audio", file.id));
    } catch (error) {
      console.error("Delete failed", error);
      try {
        await deleteDoc(doc(db, "audio", file.id));
      } catch (err) {
        setErrorMsg("Failed to delete audio file.");
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Music className="text-brand-accent" size={32} />
            Audio Box
          </h1>
          <p className="text-text-dim text-sm sm:text-base">
            Your personal audio vault for voice notes & memos.
          </p>
        </div>

        <label className="relative cursor-pointer group w-full sm:w-auto">
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept="audio/*"
            disabled={uploading}
          />
          <div className="flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-3.5 rounded-[var(--radius-custom)] font-bold transition-all shadow-lg shadow-brand-accent/20">
            {uploading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Uploading {Math.round(progress)}%</span>
              </div>
            ) : (
              <>
                <Upload size={20} />
                <span>Upload Audio</span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Error Alert Banner */}
      {errorMsg && (
        <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-sm font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg("")}
            className="text-red-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Persistent Audio Player Bar */}
      {currentAudio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 sm:p-6 rounded-[var(--radius-custom)] flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-brand-accent/20 shadow-2xl"
        >
          <button
            onClick={() => playAudio(currentAudio)}
            className="w-12 h-12 rounded-2xl bg-brand-accent flex items-center justify-center text-white shrink-0 hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>

          <div className="flex-1 w-full space-y-2">
            <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
              <span className="text-white truncate max-w-[200px] sm:max-w-md font-bold">
                {currentAudio.fileName}
              </span>
              <span className="text-text-dim font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const val = Number(e.target.value);
                audioRef.current.currentTime = val;
                setCurrentTime(val);
              }}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-accent"
            />
          </div>
        </motion.div>
      )}

      {/* Audio List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 glass-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : audioFiles.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {audioFiles.map((file) => {
              const isSelected = currentAudio?.id === file.id;
              return (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`glass-card p-4 rounded-2xl flex items-center justify-between gap-4 border transition-all ${
                    isSelected
                      ? "border-brand-accent/40 bg-brand-accent/5"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <button
                      onClick={() => playAudio(file)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected && isPlaying
                          ? "bg-brand-accent text-white"
                          : "bg-white/5 text-brand-accent hover:bg-white/10"
                      }`}
                    >
                      {isSelected && isPlaying ? (
                        <Pause size={18} />
                      ) : (
                        <Play size={18} className="ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {file.fileName}
                      </p>
                      <p className="text-[11px] text-text-dim font-mono">
                        {file.createdAt?.toDate?.()
                          ? file.createdAt.toDate().toLocaleDateString()
                          : "Just now"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(file)}
                    className="p-2.5 text-text-dim hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card rounded-[var(--radius-custom)] p-12 sm:p-20 flex flex-col items-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[var(--radius-custom)] bg-white/5 flex items-center justify-center text-text-dim mb-6">
            <Music size={36} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            No audio notes yet
          </h3>
          <p className="text-text-dim text-sm max-w-sm">
            Click "Upload Audio" to save your first voice memo or audio track.
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioBox;
