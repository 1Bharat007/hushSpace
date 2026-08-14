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
  Sparkles,
  Sliders,
  TrendingUp,
  Shield,
  KeyRound
} from "lucide-react";
import FloatingDots from "../components/FloatingDots";

const Landing = () => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleStart = (path) => {
    if (user) {
      navigate(path);
    } else {
      openAuthModal();
    }
  };

  const features = [
    {
      title: "Zero-Knowledge Journal",
      desc: "Client-side AES-GCM-256 encryption. Your thoughts are encrypted in your browser before ever touching the cloud.",
      icon: Lock,
      path: "/diary",
      color: "text-brand-accent",
      badge: "AES-256"
    },
    {
      title: "Ambient Soundscapes",
      desc: "Synthesized procedural audio: Brown Noise, Rain, Campfire, Ocean, Forest, and 10Hz Alpha Binaural Beats.",
      icon: Sliders,
      path: "/diary",
      color: "text-blue-400",
      badge: "Web Audio"
    },
    {
      title: "Emotional Analytics",
      desc: "Track psychological rhythms, 7-day mood trajectories, consistency heatmaps, and guided CBT prompts.",
      icon: TrendingUp,
      path: "/mood",
      color: "text-purple-400",
      badge: "CBT Guided"
    },
    {
      title: "Panic Shield Mask",
      desc: "One-tap Escape key instantly disguises your sanctuary into an interactive VS Code code editor.",
      icon: Shield,
      path: "/diary",
      color: "text-amber-400",
      badge: "Press Esc"
    },
    {
      title: "Private Memory Vault",
      desc: "Encrypted photo and moment storage. User-scoped storage isolation ensuring zero cross-user access.",
      icon: ImageIcon,
      path: "/gallery",
      color: "text-emerald-400",
      badge: "Scoped"
    },
    {
      title: "Voice Memo Box",
      desc: "In-browser voice note audio recording and private playback manager for unscripted audio reflections.",
      icon: Music,
      path: "/audio",
      color: "text-pink-400",
      badge: "Lossless"
    }
  ];

  return (
    <div className="relative min-h-screen bg-brand-primary overflow-x-hidden font-inter">
      <FloatingDots />

      {/* Navigation Header */}
      <nav className="relative z-20 flex justify-between items-center p-6 md:p-8 px-6 md:px-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 rounded-xl bg-brand-accent/20 flex items-center justify-center text-brand-accent group-hover:scale-105 transition-transform shadow-lg shadow-brand-accent/10">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            hush<span className="text-gradient">Space</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {!user ? (
            <>
              <button 
                onClick={openAuthModal}
                className="text-text-dim hover:text-white font-medium transition-colors hidden sm:block text-sm"
              >
                Sign In
              </button>
              <button 
                onClick={openAuthModal}
                className="bg-brand-accent hover:bg-brand-accent-hover text-white px-5 sm:px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 text-xs sm:text-sm"
              >
                Create Sanctuary
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate("/home")}
              className="bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 text-sm"
            >
              Open Sanctuary
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 md:pt-24 md:pb-32 px-6 md:px-20 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
            <KeyRound size={14} className="text-brand-accent" />
            <span className="text-[11px] font-bold tracking-widest text-text-dim uppercase font-mono">
              Zero-Knowledge • Open Source • E2E Encrypted
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            Your mind deserves a <br className="hidden sm:inline" />
            <span className="text-gradient">safe, silent space.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-text-dim max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            A distraction-free personal sanctuary combining client-side AES-GCM-256 encryption, procedural ambient soundscapes, and structured CBT reflections.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => handleStart("/diary")}
              className="w-full sm:w-auto bg-brand-accent hover:bg-brand-accent-hover text-white px-8 sm:px-10 py-4 rounded-2xl font-bold text-base sm:text-lg transition-all shadow-2xl shadow-brand-accent/30 flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
            >
              <span>Begin Reflection</span>
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('features-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all border border-white/10"
            >
              Explore Architecture
            </button>
          </div>
        </motion.div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features-section" className="relative z-10 px-6 md:px-20 pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Engineered for Total Cognitive Freedom
          </h2>
          <p className="text-sm text-text-dim max-w-xl mx-auto">
            Every feature is designed to protect your privacy and reduce cognitive load.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleStart(f.path)}
                className="glass-card p-8 rounded-[var(--radius-custom)] group cursor-pointer hover:bg-white/[0.04] transition-all hover:translate-y-[-4px] border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={24} className={f.color} />
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white/5 text-text-dim px-2.5 py-1 rounded-md">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-text-dim text-xs sm:text-sm leading-relaxed mb-6">{f.desc}</p>
                </div>
                <div className={`flex items-center gap-2 font-bold ${f.color} text-xs group-hover:gap-3 transition-all`}>
                  <span>Experience</span>
                  <ArrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trust & Security Signals */}
      <section className="relative z-10 bg-brand-secondary/40 py-20 border-y border-white/5 px-6 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-5">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Zero-Knowledge Proof</h4>
            <p className="text-xs text-text-dim leading-relaxed">
              Your encryption key never leaves your browser RAM. Even database administrators cannot read your reflections.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-5">
              <Sliders size={24} />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Pure Client Synthesis</h4>
            <p className="text-xs text-text-dim leading-relaxed">
              Audio soundscapes are synthesized directly via Web Audio API math. Zero audio files downloaded or tracked.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-5">
              <Zap size={24} />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Data Sovereignty</h4>
            <p className="text-xs text-text-dim leading-relaxed">
              1-click encrypted JSON backup, readable Markdown export, and irreversible account wipe whenever you choose.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 p-10 text-center border-t border-white/5 max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-brand-accent" />
          <span className="font-bold text-sm text-white">hushSpace</span>
        </div>
        <p className="text-text-dim text-xs opacity-60">
          © {new Date().getFullYear()} hushSpace. Open Source Zero-Knowledge Personal Sanctuary.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
