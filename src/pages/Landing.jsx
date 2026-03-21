import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Image as ImageIcon, 
  Music, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe,
  Lock,
  Sparkles
} from "lucide-react";
import FloatingDots from "../components/FloatingDots";

const Landing = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const handleStart = (path) => {
    if (user) {
      navigate(path);
    } else {
      openAuthModal();
    }
  };

  const features = [
    {
      title: "Digital Diary",
      desc: "Record your deepest thoughts in a distraction-free environment that auto-saves as you type.",
      icon: BookOpen,
      path: "/diary",
      color: "brand-accent"
    },
    {
      title: "Private Gallery",
      desc: "Preserve your visual memories in a beautiful masonry grid, safe from prying eyes.",
      icon: ImageIcon,
      path: "/gallery",
      color: "purple-400"
    },
    {
      title: "Audio Box",
      desc: "Upload voice memos or your favorite personal tracks to listen whenever you need a moment.",
      icon: Music,
      path: "/audio",
      color: "pink-400"
    }
  ];

  return (
    <div className="relative min-h-screen bg-brand-primary overflow-x-hidden font-inter">
      <FloatingDots />

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center p-8 px-10 md:px-20">
         <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-accent group-hover:scale-110 transition-transform">
               <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gradient">Private Place</h1>
         </div>
         <div className="flex items-center gap-6">
            {!user ? (
              <>
                <button 
                  onClick={openAuthModal}
                  className="text-text-dim hover:text-white font-medium transition-colors hidden md:block text-sm"
                >
                  Log In
                </button>
                <button 
                  onClick={openAuthModal}
                  className="bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 text-sm"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate("/home")}
                className="bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 text-sm"
              >
                Go to Dashboard
              </button>
            )}
         </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-10 md:px-20 text-center max-w-5xl mx-auto">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
         >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8">
               <Sparkles size={14} className="text-brand-accent" />
               <span className="text-[10px] font-bold tracking-widest text-text-dim uppercase">Total Privacy. Total Peace.</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tight leading-tight">
               Your thoughts, <br />
               <span className="text-gradient">Stay Yours.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-dim max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
               A refined sanctuary for your writing, photos, and audio. Built with total privacy in mind, designed for tranquility.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
               <button 
                 onClick={() => handleStart("/diary")}
                 className="w-full sm:w-auto bg-brand-accent hover:bg-brand-accent-hover text-white px-10 py-4.5 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-brand-accent/30 flex items-center justify-center gap-3 active:scale-95"
               >
                 Create Your Sanctuary
                 <ArrowRight size={20} />
               </button>
               <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-10 py-4.5 rounded-2xl font-bold text-lg transition-all border border-white/10">
                 Explore Features
               </button>
            </div>
         </motion.div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="relative z-10 px-10 md:px-20 pb-40">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleStart(f.path)}
                  className="glass-card p-10 rounded-3xl group cursor-pointer hover:bg-white/[0.04] transition-all hover:translate-y-[-8px] ring-1 ring-white/5"
                >
                   <div className={`w-14 h-14 rounded-xl bg-${f.color}/10 flex items-center justify-center text-${f.color} mb-8 group-hover:scale-110 transition-transform shadow-inner`}>
                      <Icon size={28} />
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                   <p className="text-text-dim leading-relaxed mb-8 text-sm">{f.desc}</p>
                   <div className={`flex items-center gap-2 font-bold text-${f.color} group-hover:gap-3 transition-all text-sm`}>
                      Get Started <ArrowRight size={18} />
                   </div>
                </motion.div>
              );
            })}
         </div>
      </section>

      {/* Trust Signals */}
      <section className="relative z-10 bg-brand-secondary/30 py-24 border-y border-white/5 px-10 flex flex-col items-center">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center">
               <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-6">
                  <Lock size={24} />
               </div>
               <h4 className="text-lg font-bold text-white mb-2">Cloud Synced</h4>
               <p className="text-sm text-text-dim">Your data is synced across your devices securely.</p>
            </div>
            <div className="flex flex-col items-center text-center">
               <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                  <Globe size={24} />
               </div>
               <h4 className="text-lg font-bold text-white mb-2">Accessible Anywhere</h4>
               <p className="text-sm text-text-dim">Your diary travels with you, wherever you are.</p>
            </div>
            <div className="flex flex-col items-center text-center">
               <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6">
                  <Zap size={24} />
               </div>
               <h4 className="text-lg font-bold text-white mb-2">Instant Response</h4>
               <p className="text-sm text-text-dim">Optimized for speed and a lightweight experience.</p>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 p-12 text-center border-t border-white/5">
         <p className="text-text-dim text-sm opacity-50">&copy; 2026 Private Place. Your Sanctuary, Secured.</p>
      </footer>
    </div>
  );
};

export default Landing;
