import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCrypto } from "../context/CryptoContext";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Image as ImageIcon, 
  Music, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Flame, 
  ShieldCheck, 
  Sliders, 
  Lock 
} from "lucide-react";
import { db } from "../firebase/config";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";

const QUICK_MOODS = [
  { id: 'anxious', emoji: '😫', label: 'Overwhelmed' },
  { id: 'down', emoji: '😕', label: 'Low' },
  { id: 'neutral', emoji: '😐', label: 'Calm' },
  { id: 'good', emoji: '🙂', label: 'Clear' },
  { id: 'peaceful', emoji: '😊', label: 'Serene' },
];

const Home = () => {
  const { user } = useAuth();
  const { decryptText, isLocked } = useCrypto();
  const navigate = useNavigate();

  const [lastEntry, setLastEntry] = useState(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch entries
    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setTotalEntries(snapshot.size);
      if (!snapshot.empty) {
        const raw = snapshot.docs[0].data();
        let decryptedTitle = raw.title || "Untitled Reflection";
        let decryptedContent = raw.content || "";

        if (raw.isEncrypted && !isLocked) {
          try {
            if (raw.ciphertext && raw.iv) {
              decryptedContent = await decryptText(raw.ciphertext, raw.iv);
            }
            if (raw.titleCiphertext && raw.titleIv) {
              decryptedTitle = await decryptText(raw.titleCiphertext, raw.titleIv);
            }
          } catch (err) {
            decryptedContent = "[Encrypted entry]";
          }
        }

        setLastEntry({
          id: snapshot.docs[0].id,
          ...raw,
          title: decryptedTitle,
          content: decryptedContent,
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user, isLocked, decryptText]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-[var(--radius-custom)] p-8 md:p-14 glass-card bg-gradient-to-br from-brand-secondary to-brand-primary border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-[45%] h-[100%] bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <motion.div variants={itemVariants} className="flex items-center gap-3 text-brand-accent mb-4">
            <ShieldCheck size={18} />
            <span className="font-bold tracking-widest text-[10px] uppercase font-mono">
              Zero-Knowledge Encrypted Sanctuary
            </span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
            Welcome home, <br />
            <span className="text-gradient">{user?.email?.split('@')[0]}</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-base text-text-dim mb-8 leading-relaxed font-medium">
            Your thoughts, audio memories, and photos are safely guarded behind client-side AES-GCM-256 encryption. Take a deep breath and unwind.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
            <Link 
              to="/diary"
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-7 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 group text-sm"
            >
              Start Reflection
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/mood"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-xl font-bold transition-all border border-white/5 text-sm"
            >
              <TrendingUp size={16} className="text-purple-400" />
              <span>Emotional Flow</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Recent Reflection Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-[var(--radius-custom)] flex flex-col justify-between min-h-[260px] border border-white/5">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen size={18} className="text-brand-accent" />
                Latest Reflection
              </h3>
              {lastEntry?.isEncrypted && (
                <span className="text-[10px] font-mono text-brand-accent flex items-center gap-1 bg-brand-accent/10 px-2 py-0.5 rounded-md">
                  <ShieldCheck size={12} />
                  AES-256 Encrypted
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
              </div>
            ) : lastEntry ? (
              <div className="space-y-3">
                <h4 className="font-bold text-white text-base">
                  {lastEntry.title}
                </h4>
                <p className="text-text-dim line-clamp-3 text-sm leading-relaxed font-inter">
                  {lastEntry.content || "No text preview available."}
                </p>
                <div className="text-[10px] font-mono text-text-dim">
                  Last updated: {lastEntry.updatedAt?.toDate?.() ? lastEntry.updatedAt.toDate().toLocaleDateString() : 'Today'}
                </div>
              </div>
            ) : (
              <p className="text-text-dim italic text-sm">
                Your sanctuary is clean and ready. Write your first reflection today.
              </p>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
            <Link 
              to={lastEntry ? `/diary/${lastEntry.id}` : "/diary"} 
              className="text-brand-accent font-bold text-xs flex items-center gap-1.5 hover:text-brand-accent-hover transition-colors group"
            >
              <span>{lastEntry ? "Continue Writing" : "Create Reflection"}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <span className="text-xs text-text-dim font-mono">
              {totalEntries} Total Entries
            </span>
          </div>
        </motion.div>

        {/* Media & Sanctuary Tools Stack */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Gallery Card */}
          <Link
            to="/gallery"
            className="block glass-card p-5 rounded-[var(--radius-custom)] hover:bg-white/[0.04] transition-all border border-white/5 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition-transform">
                <ImageIcon size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white">Memory Vault</h4>
                <p className="text-xs text-text-dim truncate">Preserve private moments & photos</p>
              </div>
              <ArrowRight size={14} className="text-text-dim group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </Link>

          {/* Audio Box Card */}
          <Link
            to="/audio"
            className="block glass-card p-5 rounded-[var(--radius-custom)] hover:bg-white/[0.04] transition-all border border-white/5 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 shrink-0 group-hover:scale-105 transition-transform">
                <Music size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white">Audio Box</h4>
                <p className="text-xs text-text-dim truncate">Voice memos & personal audio</p>
              </div>
              <ArrowRight size={14} className="text-text-dim group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </Link>

          {/* Emotional Flow Card */}
          <Link
            to="/mood"
            className="block glass-card p-5 rounded-[var(--radius-custom)] hover:bg-white/[0.04] transition-all border border-white/5 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white">Emotional Analytics</h4>
                <p className="text-xs text-text-dim truncate">View mood trends & streak</p>
              </div>
              <ArrowRight size={14} className="text-text-dim group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
