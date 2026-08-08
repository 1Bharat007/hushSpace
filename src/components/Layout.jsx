import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase/config";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [recentEntries, setRecentEntries] = React.useState([]);

  // Fetch recent entries for history
  React.useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecentEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Diary", path: "/diary", icon: BookOpen },
    { name: "Gallery", path: "/gallery", icon: ImageIcon },
    { name: "Audio Box", path: "/audio", icon: Music },
  ];

  return (
    <div className="flex min-h-screen bg-brand-primary text-text-main font-inter">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass border-r border-white/5 p-6 sticky top-0 h-screen">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold text-gradient">Private Place</h1>
          <p className="text-xs text-text-dim mt-1">Your Personal Online Gallery</p>
        </div>

        <nav className="flex-1 overflow-y-auto mt-4 space-y-8 scrollbar-hide">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-4 mb-4">Main Menu</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === "/diary" && location.pathname.startsWith("/diary"));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20" 
                      : "text-text-dim hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* History Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 mb-4">
              <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Recent Journals</p>
              <button 
                onClick={() => navigate("/diary")}
                className="text-brand-accent hover:text-brand-accent-hover"
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
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all group ${
                      location.pathname === `/diary/${entry.id}`
                        ? "bg-white/10 text-brand-accent"
                        : "text-text-dim hover:bg-white/5 hover:text-text-main"
                    }`}
                  >
                    <BookOpen size={14} className="opacity-50 group-hover:opacity-100" />
                    <span className="truncate">{entry.title || "Untitled"}</span>
                  </Link>
                ))
              ) : (
                <p className="px-4 text-[10px] text-text-dim italic">No entries yet...</p>
              )}
            </div>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 transition-all">
            <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent">
              <User size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-text-dim hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 p-4 flex justify-between items-center px-6">
        <h1 className="text-xl font-bold text-gradient">Private Place</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-text-dim hover:text-white"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-40 md:hidden glass px-6 pt-24 space-y-4"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg ${
                    isActive 
                      ? "bg-brand-accent text-white" 
                      : "text-text-dim"
                  }`}
                >
                  <Icon size={24} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-6 py-4 text-red-400 mt-10"
            >
              <LogOut size={24} />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 md:pl-0 pt-20 md:pt-0">
        <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
