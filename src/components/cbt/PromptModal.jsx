import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CLINICAL_PROTOCOLS, COGNITIVE_DISTORTIONS } from '../../lib/cbt/prompts';
import { Sparkles, Brain, X, ArrowRight, Shield, BookOpen, AlertCircle } from 'lucide-react';

/**
 * PromptModal — Clinical CBT & Psychometric Framework Picker
 */
const PromptModal = ({ isOpen, onClose, onSelectProtocol }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDistortionGuide, setShowDistortionGuide] = useState(false);

  if (!isOpen) return null;

  const categories = ['All', 'Cognitive Restructuring', 'Anxiety Defusal (ACT)', 'Positive Psychology & Somatics', 'Evening Protocol', 'Morning Protocol'];

  const filtered = selectedCategory === 'All'
    ? CLINICAL_PROTOCOLS
    : CLINICAL_PROTOCOLS.filter((p) => p.category === selectedCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl glass-card p-6 sm:p-8 rounded-3xl shadow-2xl ring-1 ring-white/10 max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                <Brain size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Clinical CBT & Reflection Protocols
                </h2>
                <p className="text-xs text-text-dim">
                  Evidence-based psychometric frameworks to decompress and reframe thoughts
                </p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 text-text-dim hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-hide border-b border-white/5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'text-text-dim hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}

            <button
              onClick={() => setShowDistortionGuide(!showDistortionGuide)}
              className="ml-auto px-3 py-1.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all whitespace-nowrap flex items-center gap-1"
            >
              <AlertCircle size={13} />
              <span>{showDistortionGuide ? 'Hide Distortions' : 'Distortions Guide'}</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* Cognitive Distortions Quick Reference */}
            {showDistortionGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-3"
              >
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                  Common Cognitive Distortions Reference
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {COGNITIVE_DISTORTIONS.map((d) => (
                    <div key={d.id} className="p-2 bg-black/30 rounded-xl border border-white/5">
                      <div className="font-bold text-white mb-0.5">{d.name}</div>
                      <div className="text-text-dim text-[11px] leading-relaxed">{d.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Protocols Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((proto) => (
                <div
                  key={proto.id}
                  onClick={() => {
                    onSelectProtocol(proto.template);
                    onClose();
                  }}
                  className="p-5 rounded-2xl bg-white/[0.02] hover:bg-brand-accent/5 border border-white/5 hover:border-brand-accent/30 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-md">
                        {proto.badge}
                      </span>
                      <span className="text-[10px] text-text-dim">{proto.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand-accent transition-colors mb-2">
                      {proto.title}
                    </h3>
                    <p className="text-xs text-text-dim leading-relaxed mb-4">
                      {proto.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-accent group-hover:gap-2.5 transition-all pt-2 border-t border-white/5">
                    <span>Apply Protocol Template</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PromptModal;
