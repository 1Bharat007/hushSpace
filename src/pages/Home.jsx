import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { BookOpen, Image as ImageIcon, Music, ArrowRight, Sparkles } from "lucide-react";
import { db } from "../firebase/config";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";

const Home = () => {
  const { user } = useAuth();
  const [lastEntry, setLastEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch the most recent diary entry
    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLastEntry({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Hero Welcome */}
      <section className="relative overflow-hidden rounded-[var(--radius-custom)] p-10 md:p-16 glass-card bg-gradient-to-br from-brand-secondary to-brand-primary border-none shadow-2xl">
        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-brand-accent/5 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <motion.div variants={itemVariants} className="flex items-center gap-3 text-brand-accent mb-4">
            <Sparkles size={18} />
            <span className="font-bold tracking-widest text-[10px] uppercase">Welcome to your sanctuary</span>
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Hello, <br />
            <span className="text-gradient leading-normal">{user?.email?.split('@')[0]}</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-text-dim max-w-xl mb-10 leading-relaxed font-medium">
            Your private space is ready. Continue your journey of recording thoughts and memories where you left off.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link 
              to="/diary"
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 group text-sm"
            >
              Start Writing
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Grid Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-8 rounded-[var(--radius-custom)] flex flex-col justify-between min-h-[300px] ring-1 ring-white/5">
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-brand-accent" />
              Start where you left off
            </h3>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
              </div>
            ) : lastEntry ? (
              <div>
                <p className="text-text-dim line-clamp-3 italic mb-4 text-sm leading-relaxed">
                   "{lastEntry.content}"
                </p>
                <div className="flex items-center gap-4 mb-6">
                   <p className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">
                      Last updated: {lastEntry.createdAt?.toDate().toLocaleDateString()}
                   </p>
                </div>
              </div>
            ) : (
              <p className="text-text-dim italic mb-6 text-sm">
                Your diary is empty. Start your first entry today to preserve your story.
              </p>
            )}
          </div>
          <Link 
            to="/diary" 
            className="text-white font-bold text-sm flex items-center gap-2 hover:text-brand-accent transition-colors group self-start"
          >
            {lastEntry ? "Continue Writing" : "Create first entry"}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Media Summary */}
        <motion.div variants={itemVariants} className="space-y-6">
           {/* Gallery Card */}
           <div className="glass-card p-6 rounded-[var(--radius-custom)] hover:bg-white/[0.05] transition-colors group cursor-pointer ring-1 ring-white/5">
              <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <ImageIcon size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Preserve Images</h3>
              <p className="text-text-dim text-xs mb-6">Your online gallery for personal moments.</p>
              <Link to="/gallery" className="text-brand-accent text-xs font-bold flex items-center gap-1 group/link">
                View Gallery <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
           </div>

           {/* Audio Card */}
           <div className="glass-card p-6 rounded-2xl hover:bg-white/[0.05] transition-colors group cursor-pointer ring-1 ring-white/5">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                <Music size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Melody Box</h3>
              <p className="text-text-dim text-xs mb-6">Listen to your favorite personal audios.</p>
              <Link to="/audio" className="text-purple-400 text-xs font-bold flex items-center gap-1 group/link">
                Open Audio Box <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
