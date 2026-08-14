import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCrypto } from "../context/CryptoContext";
import { 
  Home, 
  BookOpen, 
  Image as ImageIcon, 
  Music, 
  LogOut, 
  User,
  Menu,
  X,
  Plus,
  TrendingUp,
  Sliders,
  Shield,
  ShieldCheck,
  Database,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase/config";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import SoundscapeMixer from "./SoundscapeMixer";
import PanicShield from "./PanicShield";
import DataExport from "./DataExport";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { isLocked, lockVault } = useCrypto();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentEntries, setRecentEntries] = useState([]);
  const [isSoundscapeOpen, setIsSoundscapeOpen] = useState(false);
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Global Escape key shortcut for Panic Shield
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape' && !isPanicActive && !isSoundscapeOpen && !isExportOpen) {
        setIsPanicActive(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPanicActive, isSoundscapeOpen, isExportOpen]);

  // Fetch recent entries for history
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(8)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navItems = [
    { name: "Sanctuary", path: "/home", icon: Home },
    { name: "Zen Journal", path: "/diary", icon: BookOpen },
    { name: "Mood Analytics", path: "/mood", icon: TrendingUp },
    { name: "Memory Vault", path: "/gallery", icon: ImageIcon },
    { name: "Audio Box", path: "/audio", icon: Music },
  ];

  return (
    <div className="flex min-h-screen bg-brand-primary text-text-main font-inter">
      {/* Soundscape Mixer Modal */}
      <SoundscapeMixer 
        isOpen={isSoundscapeOpen} 
        onClose={() => setIsSoundscapeOpen(false)} 
      />

      {/* Panic Shield Disguise Overlay */}
      <PanicShield 
        isActive={isPanicActive} 
        onDismiss={() => setIsPanicActive(false)} 
      />

      {/* Data Export / Sovereignty Modal */}
      <DataExport 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-white/5 p-6 sticky top-0 h-screen shrink-0">
        <div className="mb-8 px-2 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                <ShieldCheck size={18} />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight">
                hush<span className="text-gradient">Space</span>
              </h1>
            </div>
            <p className="text-[10px] text-text-dim mt-1 font-mono uppercase tracking-wider">
              Zero-Knowledge Sanctuary
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
          {/* Main Navigation */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-3 mb-2">Sanctuary</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === "/diary" && location.pathname.startsWith("/diary"));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    isActive 
                      ? "bg-brand-accent text-white font-bold shadow-lg shadow-brand-accent/20" 
                      : "text-text-dim hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Privacy & Sound Controls */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-3 mb-2">Mindful Tools</p>
            
            {/* Ambient Soundscapes */}
            <button
              onClick={() => setIsSoundscapeOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-text-dim hover:bg-white/5 hover:text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <Sliders size={18} className="text-brand-accent group-hover:scale-110 transition-transform" />
                <span>Ambient Audio</span>
              </div>
              <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-md font-mono">
                Mix
              </span>
            </button>

            {/* Panic Shield */}
            <button
              onClick={() => setIsPanicActive(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-text-dim hover:bg-white/5 hover:text-white transition-all group"
              title="Press Esc anywhere for instant disguise"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Panic Shield</span>
              </div>
              <span className="text-[10px] bg-white/5 text-text-dim px-2 py-0.5 rounded-md font-mono">
                Esc
              </span>
            </button>

            {/* Data Sovereignty */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-text-dim hover:bg-white/5 hover:text-white transition-all group"
            >
              <Database size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Data Sovereignty</span>
            </button>
          </div>

          {/* Recent Journals */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Recent Reflections</p>
              <button 
                onClick={() => navigate("/diary")}
                className="text-brand-accent hover:text-brand-accent-hover text-xs"
                title="New Reflection"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {recentEntries.length > 0 ? (
                recentEntries.map(entry => (
                  <Link
                    key={entry.id}
                    to={`/diary/${entry.id}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all group ${
                      location.pathname === `/diary/${entry.id}`
                        ? "bg-white/10 text-brand-accent font-bold"
                        : "text-text-dim hover:bg-white/5 hover:text-text-main"
                    }`}
                  >
                    <BookOpen size={12} className="opacity-50 group-hover:opacity-100 shrink-0" />
                    <span className="truncate">{entry.title || "Untitled Entry"}</span>
                  </Link>
                ))
              ) : (
                <p className="px-3 text-[10px] text-text-dim italic">No reflections yet...</p>
              )}
            </div>
          </div>
        </nav>

        {/* Footer Profile & Lock */}
        <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent shrink-0">
                <User size={14} />
              </div>
              <p className="text-xs font-medium truncate text-white/80">{user?.email}</p>
            </div>
            <button
              onClick={lockVault}
              className="text-text-dim hover:text-amber-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              title="Lock Encryption Vault"
            >
              <Lock size={14} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-text-dim hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 p-4 flex justify-between items-center px-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-accent/20 flex items-center justify-center text-brand-accent">
            <ShieldCheck size={16} />
          </div>
          <h1 className="text-lg font-black text-white">hushSpace</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSoundscapeOpen(true)}
            className="p-2 text-brand-accent bg-brand-accent/10 rounded-lg"
            title="Ambient Soundscape"
          >
            <Sliders size={18} />
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-text-dim hover:text-white"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-40 md:hidden glass px-6 pt-24 pb-8 space-y-4 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-base font-medium ${
                      isActive 
                        ? "bg-brand-accent text-white font-bold shadow-lg" 
                        : "text-text-dim hover:bg-white/5"
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <div className="pt-4 space-y-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSoundscapeOpen(true);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm text-text-dim hover:bg-white/5"
                >
                  <Sliders size={18} className="text-brand-accent" />
                  <span>Ambient Soundscape Mixer</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsExportOpen(true);
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-sm text-text-dim hover:bg-white/5"
                >
                  <Database size={18} className="text-purple-400" />
                  <span>Data Sovereignty & Export</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-5 py-3.5 text-red-400 bg-red-500/10 rounded-2xl font-bold text-sm"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-0 pt-20 md:pt-0">
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
