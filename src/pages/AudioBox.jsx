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
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Upload, Trash2, Mic } from "lucide-react";

const AudioBox = () => {
  const { user } = useAuth();
  const [audioFiles, setAudioFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  
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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAudioFiles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Audio Player Logic
  useEffect(() => {
    const audio = audioRef.current;
    
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
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
      audioRef.current.play();
      setCurrentAudio(file);
      setIsPlaying(true);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "audio"), {
          userId: user.uid,
          url: downloadURL,
          fileName: file.name,
          storagePath: storageRef.fullPath,
          createdAt: serverTimestamp()
        });
        setUploading(false);
        setProgress(0);
      }
    );
  };

  const handleDelete = async (file) => {
    if (!window.confirm("Delete this audio?")) return;
    try {
      const storageRef = ref(storage, file.storagePath);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, "audio", file.id));
      if (currentAudio?.id === file.id) {
        audioRef.current.pause();
        setCurrentAudio(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Delete failed", error);
      await deleteDoc(doc(db, "audio", file.id));
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
             <Music className="text-purple-400" size={32} />
             Audio Box
          </h1>
          <p className="text-text-dim">Your private collection of voice memos and music.</p>
        </div>
        
        <label className="relative cursor-pointer group">
          <input type="file" className="hidden" onChange={handleUpload} accept="audio/*" />
          <div className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/20">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Playlist */}
        <div className="lg:col-span-2 space-y-4">
           {loading ? (
             [1, 2, 3].map(i => <div key={i} className="h-20 glass-card rounded-xl animate-pulse"></div>)
           ) : audioFiles.length > 0 ? (
             audioFiles.map((file) => (
               <motion.div
                 key={file.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`flex items-center justify-between p-4 glass-card rounded-[var(--radius-custom)] transition-all border ${
                   currentAudio?.id === file.id ? "border-purple-500/50 bg-purple-500/5" : "border-white/5"
                 }`}
               >
                 <div className="flex items-center gap-4 min-w-0">
                    <button 
                      onClick={() => playAudio(file)}
                      className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 hover:bg-purple-500 hover:text-white transition-all"
                    >
                      {currentAudio?.id === file.id && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <div className="min-w-0">
                       <h4 className="font-semibold text-white truncate text-sm">{file.fileName}</h4>
                       <p className="text-[10px] text-text-dim uppercase tracking-wider mt-1">
                          {file.createdAt?.toDate().toLocaleDateString()}
                       </p>
                    </div>
                 </div>
                 <button 
                   onClick={() => handleDelete(file)}
                   className="p-3 text-white/20 hover:text-red-400 transition-colors"
                 >
                   <Trash2 size={18} />
                 </button>
               </motion.div>
             ))
           ) : (
             <div className="glass-card rounded-[var(--radius-custom)] p-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-text-dim mb-8">
                   <Mic size={40} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No audio tracks</h3>
                <p className="text-text-dim max-w-xs">Upload your first voice memo or song to fill your private audio box.</p>
             </div>
           )}
        </div>

        {/* Floating Player */}
        <div className="lg:sticky lg:top-10 h-fit">
           <AnimatePresence>
             {currentAudio && (
               <motion.div
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="glass-card p-8 rounded-[var(--radius-custom)] space-y-8"
               >
                 <div className="space-y-4">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-purple-500/20 to-brand-accent/20 flex items-center justify-center relative overflow-hidden group">
                       <Music size={80} className="text-purple-400/50 group-hover:scale-105 transition-transform duration-700" />
                       {isPlaying && (
                         <div className="absolute bottom-6 flex items-end gap-1 px-4">
                           {[1,2,3,4,5,6].map(i => (
                             <motion.div 
                                key={i}
                                animate={{ height: [10, 30, 15, 40, 20] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                                className="w-1 bg-purple-400 rounded-full"
                             />
                           ))}
                         </div>
                       )}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white truncate">{currentAudio.fileName}</h3>
                       <p className="text-text-dim text-sm font-medium">Personal Audio</p>
                    </div>
                 </div>

                 {/* Progress Slider */}
                 <div className="space-y-2">
                    <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div 
                         className="absolute top-0 left-0 h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                         style={{ width: `${(currentTime/duration) * 100}%` }}
                       />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-dim font-bold tracking-widest px-1">
                       <span>{formatTime(currentTime)}</span>
                       <span>{formatTime(duration)}</span>
                    </div>
                 </div>

                 {/* Controls */}
                 <div className="flex items-center justify-center gap-8">
                    <button className="text-text-dim hover:text-white transition-colors"><SkipBack size={24} /></button>
                    <button 
                      onClick={() => playAudio(currentAudio)}
                      className="w-16 h-16 rounded-full bg-white text-brand-primary flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
                    >
                       {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </button>
                    <button className="text-text-dim hover:text-white transition-colors"><SkipForward size={24} /></button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AudioBox;
