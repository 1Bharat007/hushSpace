import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Clock, Search, BookOpen, Trash2 } from "lucide-react";

const Diary = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef(null);

  // Fetch entries
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEntries(docs);
      setLoading(false);
      
      // If no active entry, pick the first one
      if (docs.length > 0 && !activeEntryId) {
        setActiveEntryId(docs[0].id);
        setTitle(docs[0].title || "");
        setContent(docs[0].content || "");
      }
    });

    return unsubscribe;
  }, [user, activeEntryId]);

  // Handle auto-save
  useEffect(() => {
    if (!activeEntryId || loading) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await updateDoc(doc(db, "entries", activeEntryId), {
          title,
          content,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Auto-save failed", error);
      } finally {
        setTimeout(() => setSaving(false), 800);
      }
    }, 2000);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, content, activeEntryId, loading]);

  const createNewEntry = async () => {
    try {
      const docRef = await addDoc(collection(db, "entries"), {
        userId: user.uid,
        title: "Untitled Entry",
        content: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setActiveEntryId(docRef.id);
      setTitle("Untitled Entry");
      setContent("");
    } catch (error) {
      console.error("Failed to create entry", error);
    }
  };

  const selectEntry = (entry) => {
    setActiveEntryId(entry.id);
    setTitle(entry.title || "");
    setContent(entry.content || "");
  };

  return (
    <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] flex gap-6 overflow-hidden">
      {/* Sidebar: Entries List */}
      <div className="hidden lg:flex flex-col w-72 glass-card rounded-xl overflow-hidden ring-1 ring-white/5">
         <div className="p-5 border-b border-white/5">
            <button 
              onClick={createNewEntry}
              className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all shadow-lg shadow-brand-accent/20 text-sm"
            >
              <Plus size={18} />
              New Entry
            </button>
         </div>
         <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>)
            ) : entries.map(entry => (
              <button
                key={entry.id}
                onClick={() => selectEntry(entry)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  activeEntryId === entry.id 
                    ? "bg-brand-accent text-white shadow-xl shadow-brand-accent/20" 
                    : "hover:bg-white/5 border border-transparent text-text-dim"
                }`}
              >
                <h4 className={`font-bold truncate text-sm`}>
                  {entry.title || "Untitled"}
                </h4>
                <p className={`text-[10px] mt-1 line-clamp-1 ${activeEntryId === entry.id ? "text-white/70" : "text-text-dim"}`}>
                   {entry.content || "No content yet..."}
                </p>
                <p className={`text-[9px] mt-2 font-bold uppercase tracking-widest ${activeEntryId === entry.id ? "text-white/50" : "text-white/10"}`}>
                   {entry.createdAt?.toDate().toLocaleDateString()}
                </p>
              </button>
            ))}
         </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 glass-card rounded-2xl flex flex-col relative overflow-hidden ring-1 ring-white/5 shadow-2xl">
        {/* Editor Toolbar */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center px-8">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-brand-accent" />
            <span className="text-xs font-bold tracking-widest text-text-dim uppercase">Diary Entry</span>
          </div>
          <div className="flex items-center gap-4">
            <AnimatePresence>
              {saving && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-brand-accent flex items-center gap-1"
                >
                  <Save size={12} className="animate-pulse" /> Saving...
                </motion.span>
              )}
            </AnimatePresence>
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          </div>
        </div>

        {/* Editor Inputs */}
        <div className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto scrollbar-hide">
           <input 
             type="text"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             placeholder="Entry Title..."
             className="bg-transparent text-3xl font-black text-white outline-none mb-8 placeholder:text-white/5 tracking-tight"
           />
           <textarea 
             value={content}
             onChange={(e) => setContent(e.target.value)}
             placeholder="Spill your thoughts here..."
             className="flex-1 bg-transparent text-lg text-text-main leading-relaxed outline-none resize-none placeholder:text-white/5 font-medium"
           />
        </div>

        {/* Bottom Status */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 px-10 flex justify-between items-center text-[10px] text-text-dim uppercase tracking-widest font-bold">
          <div className="flex gap-6">
            <span>Words: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
            <span>Chars: {content.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} />
            Updated {entries.find(e => e.id === activeEntryId)?.updatedAt?.toDate().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diary;
