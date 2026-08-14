import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useCrypto } from "../context/CryptoContext";
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
import { 
  Plus, 
  Clock, 
  Search, 
  BookOpen, 
  Trash2, 
  AlertCircle, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  Smile, 
  FileText,
  Lightbulb
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const MOODS = [
  { id: 'anxious', emoji: '😫', label: 'Overwhelmed', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  { id: 'down', emoji: '😕', label: 'Low', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'neutral', emoji: '😐', label: 'Calm', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { id: 'good', emoji: '🙂', label: 'Clear', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'peaceful', emoji: '😊', label: 'Serene', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
];

const REFLECTION_PROMPTS = [
  { category: 'Gratitude', prompt: 'What are 3 small, ordinary moments that brought you quiet peace today?' },
  { category: 'CBT Reframe', prompt: 'What specific worry is lingering in your mind? What is a rational, kind counter-perspective?' },
  { category: 'Evening Unwind', prompt: 'What went well today? What can you forgive yourself for and release into the night?' },
  { category: 'Morning Intention', prompt: 'What mindset or gentle boundary will best protect your energy today?' },
  { category: 'Brain Dump', prompt: 'Unload whatever raw thoughts are cluttering your mind without editing or judging.' },
];

const Diary = () => {
  const { user } = useAuth();
  const { encryptText, decryptText, isLocked } = useCrypto();
  const { entryId } = useParams();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [activeEntryId, setActiveEntryId] = useState(entryId || null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [mood, setMood] = useState("neutral");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  
  const saveTimeoutRef = useRef(null);
  const activeEntryRef = useRef(null);

  // Sync activeEntryId with URL param
  useEffect(() => {
    if (entryId) {
      setActiveEntryId(entryId);
    }
  }, [entryId]);

  // Fetch entries and decrypt them in real time
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const rawDocs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        // Decrypt doc contents if encrypted
        const decryptedDocs = await Promise.all(
          rawDocs.map(async (docData) => {
            let decryptedTitle = docData.title || "Untitled Entry";
            let decryptedContent = docData.content || "";

            if (docData.isEncrypted && !isLocked) {
              try {
                if (docData.ciphertext && docData.iv) {
                  decryptedContent = await decryptText(docData.ciphertext, docData.iv);
                }
                if (docData.titleCiphertext && docData.titleIv) {
                  decryptedTitle = await decryptText(docData.titleCiphertext, docData.titleIv);
                }
              } catch (err) {
                console.error("Failed to decrypt entry:", docData.id, err);
                decryptedContent = "[Encrypted entry — unlock vault to view]";
              }
            }

            return {
              ...docData,
              title: decryptedTitle,
              content: decryptedContent,
            };
          })
        );

        setEntries(decryptedDocs);
        setLoading(false);

        // Load active entry
        const currentActive = entryId 
          ? decryptedDocs.find((d) => d.id === entryId) 
          : decryptedDocs[0];

        if (currentActive && (!activeEntryRef.current || activeEntryRef.current !== currentActive.id)) {
          activeEntryRef.current = currentActive.id;
          if (!entryId) {
            setActiveEntryId(currentActive.id);
            navigate(`/diary/${currentActive.id}`, { replace: true });
          }
          setTitle(currentActive.title || "");
          setContent(currentActive.content || "");
          setMood(currentActive.mood || "neutral");
          setTags(currentActive.tags || []);
        }
      },
      (err) => {
        console.error("Diary snapshot error:", err);
        setErrorMsg("Failed to sync diary entries.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, entryId, isLocked, decryptText, navigate]);

  // Handle auto-save with client-side encryption
  useEffect(() => {
    if (!activeEntryId || loading) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      setErrorMsg("");

      try {
        let payload = {
          mood,
          tags,
          updatedAt: serverTimestamp(),
        };

        // If vault is unlocked, encrypt title & content with AES-GCM
        if (!isLocked) {
          const encContent = await encryptText(content);
          const encTitle = await encryptText(title);
          payload = {
            ...payload,
            isEncrypted: true,
            ciphertext: encContent.ciphertext,
            iv: encContent.iv,
            titleCiphertext: encTitle.ciphertext,
            titleIv: encTitle.iv,
            // Clear plaintext fields for true zero-knowledge privacy
            content: "",
            title: "Encrypted Entry",
          };
        } else {
          // Fallback if locked
          payload = {
            ...payload,
            title,
            content,
            isEncrypted: false,
          };
        }

        await updateDoc(doc(db, "entries", activeEntryId), payload);
      } catch (error) {
        console.error("Auto-save failed", error);
        setErrorMsg("Auto-save failed. Unsaved edits remain locally.");
      } finally {
        setTimeout(() => setSaving(false), 600);
      }
    }, 1200);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [title, content, mood, tags, activeEntryId, loading, isLocked, encryptText]);

  // Create new entry
  const createNewEntry = async () => {
    setErrorMsg("");
    try {
      let initialPayload = {
        userId: user.uid,
        mood: "neutral",
        tags: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (!isLocked) {
        const encTitle = await encryptText("Untitled Entry");
        const encContent = await encryptText("");
        initialPayload = {
          ...initialPayload,
          isEncrypted: true,
          titleCiphertext: encTitle.ciphertext,
          titleIv: encTitle.iv,
          ciphertext: encContent.ciphertext,
          iv: encContent.iv,
          title: "Encrypted Entry",
          content: "",
        };
      } else {
        initialPayload = {
          ...initialPayload,
          title: "Untitled Entry",
          content: "",
          isEncrypted: false,
        };
      }

      const docRef = await addDoc(collection(db, "entries"), initialPayload);
      activeEntryRef.current = docRef.id;
      setActiveEntryId(docRef.id);
      setTitle("Untitled Entry");
      setContent("");
      setMood("neutral");
      setTags([]);
      setIsSidebarOpenMobile(false);
      navigate(`/diary/${docRef.id}`);
    } catch (err) {
      console.error("Failed to create entry:", err);
      setErrorMsg("Failed to create new diary entry.");
    }
  };

  // Delete entry
  const deleteEntry = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this memory?")) return;
    setErrorMsg("");

    try {
      await deleteDoc(doc(db, "entries", id));
      if (activeEntryId === id) {
        const remaining = entries.filter((d) => d.id !== id);
        if (remaining.length > 0) {
          activeEntryRef.current = remaining[0].id;
          setActiveEntryId(remaining[0].id);
          navigate(`/diary/${remaining[0].id}`);
        } else {
          activeEntryRef.current = null;
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

  // Tag helper
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const applyPrompt = (promptText) => {
    const formatted = content 
      ? `${content}\n\n### ${promptText}\n` 
      : `### ${promptText}\n\n`;
    setContent(formatted);
    setShowPromptPicker(false);
  };

  // Stats calculation
  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const readingTimeMinutes = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [wordCount]);

  const filteredEntries = entries.filter(
    (e) =>
      e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 relative">
      {/* Mobile Toggle Bar */}
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
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-brand-accent" />
            <h2 className="text-lg font-bold text-white">Zen Journal</h2>
          </div>
          <button
            onClick={createNewEntry}
            className="p-2 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-xl transition-all shadow-md shadow-brand-accent/20"
            title="New Entry"
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
            placeholder="Search entries or #tags..."
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
              const entryMood = MOODS.find(m => m.id === entry.mood);

              return (
                <div
                  key={entry.id}
                  onClick={() => {
                    activeEntryRef.current = entry.id;
                    setActiveEntryId(entry.id);
                    setTitle(entry.title || "");
                    setContent(entry.content || "");
                    setMood(entry.mood || "neutral");
                    setTags(entry.tags || []);
                    setIsSidebarOpenMobile(false);
                    navigate(`/diary/${entry.id}`);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                    isActive
                      ? "bg-brand-accent/20 border border-brand-accent/40 text-white shadow-lg"
                      : "hover:bg-white/5 text-text-dim hover:text-white border border-transparent"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      {entryMood && <span className="text-sm">{entryMood.emoji}</span>}
                      <h4 className="font-bold text-xs sm:text-sm truncate">
                        {entry.title || "Untitled Entry"}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-dim font-mono">
                      <span>
                        {entry.updatedAt?.toDate?.()
                          ? entry.updatedAt.toDate().toLocaleDateString()
                          : "Just now"}
                      </span>
                      {entry.isEncrypted && (
                        <span className="text-brand-accent flex items-center gap-0.5">
                          <ShieldCheck size={10} />
                          <span>E2E</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteEntry(entry.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 rounded-lg transition-opacity"
                    title="Delete"
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

      {/* Editor Main Canvas */}
      <div className="flex-1 glass-card rounded-[var(--radius-custom)] p-6 sm:p-8 flex flex-col min-w-0 overflow-hidden relative">
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
            {/* Header: Title + Save Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-white/10 gap-3 mb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title your reflection..."
                className="bg-transparent text-xl sm:text-2xl font-bold text-white outline-none w-full placeholder:text-white/30"
              />
              <div className="flex items-center gap-3 shrink-0 text-xs text-text-dim">
                <span className="flex items-center gap-1 text-emerald-400 font-mono">
                  <ShieldCheck size={14} />
                  <span>AES-256</span>
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock size={14} />
                  <span>{saving ? "Encrypting..." : "Saved"}</span>
                </span>
              </div>
            </div>

            {/* Toolbar: Mood Selector + Prompt Picker Button + Tags */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-white/5">
              {/* Mood Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-dim mr-1 flex items-center gap-1">
                  <Smile size={14} />
                  <span>Mood:</span>
                </span>
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMood(m.id)}
                    className={`px-2 py-1 rounded-xl text-xs flex items-center gap-1 transition-all ${
                      mood === m.id
                        ? `${m.color} ring-1 font-bold shadow-sm`
                        : 'text-text-dim hover:bg-white/5'
                    }`}
                    title={m.label}
                  >
                    <span>{m.emoji}</span>
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Prompt Engine Button */}
              <div className="relative">
                <button
                  onClick={() => setShowPromptPicker(!showPromptPicker)}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-accent bg-brand-accent/10 hover:bg-brand-accent/20 px-3 py-1.5 rounded-xl transition-all border border-brand-accent/30"
                >
                  <Lightbulb size={14} />
                  <span>CBT Prompts</span>
                </button>

                {/* Prompt Popover */}
                {showPromptPicker && (
                  <div className="absolute right-0 top-10 z-30 w-80 sm:w-96 glass-card p-4 rounded-2xl shadow-2xl ring-1 ring-white/10 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles size={14} className="text-brand-accent" />
                        Guided Prompts
                      </span>
                      <button onClick={() => setShowPromptPicker(false)} className="text-text-dim hover:text-white">
                        ✕
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {REFLECTION_PROMPTS.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => applyPrompt(p.prompt)}
                          className="w-full text-left p-2.5 rounded-xl bg-white/[0.02] hover:bg-brand-accent/10 border border-white/5 hover:border-brand-accent/30 transition-all text-xs group"
                        >
                          <div className="font-bold text-brand-accent text-[10px] uppercase tracking-wider mb-1">
                            {p.category}
                          </div>
                          <div className="text-text-dim group-hover:text-white leading-relaxed">
                            {p.prompt}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags Ribbon */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Tag size={13} className="text-text-dim" />
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-white/5 border border-white/10 text-white/80 text-[11px] font-mono px-2.5 py-0.5 rounded-lg flex items-center gap-1.5"
                >
                  #{t}
                  <button onClick={() => removeTag(t)} className="text-text-dim hover:text-red-400 text-xs">
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag + Enter..."
                className="bg-transparent text-xs text-white/70 placeholder:text-white/20 outline-none w-28 font-mono"
              />
            </div>

            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your unfiltered thoughts here. Everything is encrypted before leaving your browser..."
              className="flex-1 w-full bg-transparent text-white/90 outline-none resize-none text-sm sm:text-base leading-relaxed placeholder:text-white/20 font-inter"
            />

            {/* Footer Stats Bar */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-text-dim font-mono">
              <div className="flex items-center gap-4">
                <span>{wordCount} words</span>
                <span>~{readingTimeMinutes} min read</span>
              </div>
              <div className="flex items-center gap-1.5 text-brand-accent">
                <ShieldCheck size={14} />
                <span>Zero-Knowledge Protected</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <BookOpen size={48} className="text-text-dim mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Entry Selected</h3>
            <p className="text-text-dim text-sm max-w-sm mb-6">
              Select an entry from the sidebar or start fresh with a new reflection.
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
