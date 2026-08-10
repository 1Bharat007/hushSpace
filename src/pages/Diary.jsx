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
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Clock, Search, BookOpen, Trash2, AlertCircle, Menu, X } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const Diary = () => {
  const { user } = useAuth();
  const { entryId } = useParams();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(entryId || null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Sync activeEntryId with URL param
  useEffect(() => {
    if (entryId) {
      setActiveEntryId(entryId);
    }
  }, [entryId]);

  // Fetch entries
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEntries(docs);
        setLoading(false);

        // If an entry is selected in URL, load its content
        const entry = entryId ? docs.find((d) => d.id === entryId) : docs[0];
        if (entry) {
          if (!entryId) {
            setActiveEntryId(entry.id);
            navigate(`/diary/${entry.id}`, { replace: true });
          }
          setTitle(entry.title || "");
          setContent(entry.content || "");
        }
      },
      (err) => {
        console.error("Diary snapshot error:", err);
        setErrorMsg("Failed to sync diary entries.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, entryId, navigate]);

  // Handle auto-save with error feedback
  useEffect(() => {
    if (!activeEntryId || loading) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      setErrorMsg("");
      try {
        await updateDoc(doc(db, "entries", activeEntryId), {
          title,
          content,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Auto-save failed", error);
        setErrorMsg("Auto-save failed. Unsaved edits remain locally.");
      } finally {
        setTimeout(() => setSaving(false), 800);
      }
    }, 1500);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, content, activeEntryId, loading]);

  const createNewEntry = async () => {
    setErrorMsg("");
    try {
      const docRef = await addDoc(collection(db, "entries"), {
        userId: user.uid,
        title: "Untitled Entry",
        content: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setActiveEntryId(docRef.id);
      setTitle("Untitled Entry");
      setContent("");
      setIsSidebarOpenMobile(false);
      navigate(`/diary/${docRef.id}`);
    } catch (err) {
      console.error("Failed to create entry:", err);
      setErrorMsg("Failed to create new diary entry.");
    }
  };

  const deleteEntry = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this diary entry?")) return;
    setErrorMsg("");

    try {
      await deleteDoc(doc(db, "entries", id));
      if (activeEntryId === id) {
        const remaining = entries.filter((d) => d.id !== id);
        if (remaining.length > 0) {
          navigate(`/diary/${remaining[0].id}`);
        } else {
          setActiveEntryId(null);
          setTitle("");
          setContent("");
          navigate("/diary");
        }
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
      setErrorMsg("Failed to delete entry.");
    }
  };

  const filteredEntries = entries.filter(
    (e) =>
      e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 relative">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden flex items-center justify-between bg-brand-primary p-3 rounded-xl border border-white/10">
        <button
          onClick={() => setIsSidebarOpenMobile(!isSidebarOpenMobile)}
          className="flex items-center gap-2 text-white font-bold text-sm"
        >
          {isSidebarOpenMobile ? <X size={20} /> : <Menu size={20} />}
          <span>{isSidebarOpenMobile ? "Close Entries" : "View All Entries"}</span>
        </button>
        <button
          onClick={createNewEntry}
          className="bg-brand-accent text-white p-2 rounded-lg"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Entries Sidebar */}
      <div
        className={`w-full lg:w-80 glass-card rounded-[var(--radius-custom)] p-4 flex flex-col gap-4 shrink-0 overflow-hidden ${
          isSidebarOpenMobile
            ? "absolute inset-0 z-40 bg-[#0F172A] p-6"
            : "hidden lg:flex"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen size={20} className="text-brand-accent" />
            <span>Diary Notes</span>
          </h2>
          <button
            onClick={createNewEntry}
            className="p-2 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-xl transition-all"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-text-dim focus:outline-none focus:border-brand-accent/50"
          />
        </div>

        {/* Entry List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => {
              const isActive = entry.id === activeEntryId;
              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    setActiveEntryId(entry.id);
                    setTitle(entry.title || "");
                    setContent(entry.content || "");
                    setIsSidebarOpenMobile(false);
                    navigate(`/diary/${entry.id}`);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                    isActive
                      ? "bg-brand-accent/20 border border-brand-accent/40 text-white"
                      : "hover:bg-white/5 text-text-dim hover:text-white border border-transparent"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="font-bold text-xs sm:text-sm truncate">
                      {entry.title || "Untitled Entry"}
                    </h4>
                    <p className="text-[10px] text-text-dim font-mono">
                      {entry.updatedAt?.toDate?.()
                        ? entry.updatedAt.toDate().toLocaleDateString()
                        : "Just now"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteEntry(entry.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 rounded-lg transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-text-dim text-center py-8">
              No diary entries found.
            </p>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 glass-card rounded-[var(--radius-custom)] p-6 sm:p-8 flex flex-col min-w-0 overflow-hidden">
        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs font-medium mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
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

        {activeEntryId ? (
          <>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-4 mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title your entry..."
                className="bg-transparent text-xl sm:text-2xl font-bold text-white outline-none w-full placeholder:text-white/30"
              />
              <div className="flex items-center gap-2 shrink-0 text-xs text-text-dim">
                <Clock size={14} />
                <span>{saving ? "Saving..." : "Saved"}</span>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your thoughts here..."
              className="flex-1 w-full bg-transparent text-white/90 outline-none resize-none text-sm sm:text-base leading-relaxed placeholder:text-white/20"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <BookOpen size={48} className="text-text-dim mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Entry Selected</h3>
            <p className="text-text-dim text-sm max-w-sm mb-6">
              Select an entry from the list or create a new one to start writing.
            </p>
            <button
              onClick={createNewEntry}
              className="bg-brand-accent text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-accent/20"
            >
              Create New Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Diary;
