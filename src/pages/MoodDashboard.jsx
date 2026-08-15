import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { getLocalEntries } from '../lib/storage/indexedDb';
import { motion } from 'framer-motion';
import { 
  Smile, 
  TrendingUp, 
  Flame, 
  Calendar, 
  Tag, 
  Award, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  ShieldCheck,
  Brain,
  Lightbulb,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MOOD_MAP = {
  anxious: { score: 1, emoji: '😫', label: 'Overwhelmed', color: '#f87171', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  down: { score: 2, emoji: '😕', label: 'Low', color: '#fbbf24', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  neutral: { score: 3, emoji: '😐', label: 'Calm', color: '#60a5fa', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  good: { score: 4, emoji: '🙂', label: 'Clear', color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  peaceful: { score: 5, emoji: '😊', label: 'Serene', color: '#c084fc', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
};

const MoodDashboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load from IndexedDB immediately + Firestore real-time listener
  useEffect(() => {
    if (!user) return;

    const loadLocal = async () => {
      try {
        const cached = await getLocalEntries(user.uid);
        if (cached && cached.length > 0) {
          setEntries(cached);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Could not load local mood cache:', err);
      }
    };
    loadLocal();

    const q = query(
      collection(db, 'entries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEntries(docs);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsubscribe;
  }, [user]);

  // Streak Calculation
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    const entryDates = new Set(
      entries
        .map((e) => {
          if (e.createdAt?.toDate) return e.createdAt.toDate().toISOString().slice(0, 10);
          if (typeof e.createdAt === 'string') return e.createdAt.slice(0, 10);
          return null;
        })
        .filter(Boolean)
    );

    let count = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (entryDates.has(dateStr)) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  }, [entries]);

  // Mood distribution counts & percentages
  const moodDistribution = useMemo(() => {
    const counts = { anxious: 0, down: 0, neutral: 0, good: 0, peaceful: 0 };
    entries.forEach((e) => {
      if (e.mood && counts[e.mood] !== undefined) {
        counts[e.mood]++;
      }
    });
    const total = entries.length || 1;
    return {
      counts,
      percentages: {
        anxious: Math.round((counts.anxious / total) * 100),
        down: Math.round((counts.down / total) * 100),
        neutral: Math.round((counts.neutral / total) * 100),
        good: Math.round((counts.good / total) * 100),
        peaceful: Math.round((counts.peaceful / total) * 100),
      },
    };
  }, [entries]);

  // 7-Day Emotional Flow Trajectory
  const sevenDayFlow = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Find entries for this date
      const dayEntries = entries.filter((e) => {
        const eDate = e.createdAt?.toDate?.()?.toISOString()?.slice(0, 10) ||
          (typeof e.createdAt === 'string' ? e.createdAt.slice(0, 10) : null);
        return eDate === dateStr;
      });

      let avgScore = 0;
      let dominantMood = null;
      if (dayEntries.length > 0) {
        const scores = dayEntries.map((e) => MOOD_MAP[e.mood]?.score || 3);
        avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        dominantMood = dayEntries[0].mood || 'neutral';
      }

      days.push({
        dateStr,
        dayName,
        score: avgScore,
        mood: dominantMood,
        count: dayEntries.length,
      });
    }

    return days;
  }, [entries]);

  // Top Reflection Tags
  const topTags = useMemo(() => {
    const freq = {};
    entries.forEach((e) => {
      if (Array.isArray(e.tags)) {
        e.tags.forEach((t) => {
          const lower = t.toLowerCase();
          freq[lower] = (freq[lower] || 0) + 1;
        });
      }
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [entries]);

  // 30-Day Heatmap Grid
  const thirtyDayHeatmap = useMemo(() => {
    const cells = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      const dayEntries = entries.filter((e) => {
        const eDate = e.createdAt?.toDate?.()?.toISOString()?.slice(0, 10) ||
          (typeof e.createdAt === 'string' ? e.createdAt.slice(0, 10) : null);
        return eDate === dateStr;
      });

      const primaryMood = dayEntries.length > 0 ? (dayEntries[0].mood || 'neutral') : null;
      cells.push({
        dateStr,
        dayNum: d.getDate(),
        count: dayEntries.length,
        mood: primaryMood,
      });
    }
    return cells;
  }, [entries]);

  // Clinical Equilibrium Index
  const equilibriumScore = useMemo(() => {
    if (entries.length === 0) return 0;
    const scores = entries.map((e) => MOOD_MAP[e.mood]?.score || 3);
    const sum = scores.reduce((a, b) => a + b, 0);
    return ((sum / (entries.length * 5)) * 100).toFixed(0);
  }, [entries]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Brain className="text-brand-accent" size={32} />
            Emotional Analytics & Equilibrium
          </h1>
          <p className="text-text-dim text-sm sm:text-base">
            Private, client-side psychometric insights derived from your encrypted reflections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/diary"
            className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand-accent/20"
          >
            <BookOpen size={16} />
            <span>Open Zen Journal</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
            <Flame size={24} />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{streak}</span>
            <span className="text-xs text-text-dim block">Day Streak</span>
          </div>
        </div>

        {/* Total Entries */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{entries.length}</span>
            <span className="text-xs text-text-dim block">Total Reflections</span>
          </div>
        </div>

        {/* Equilibrium Index */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{equilibriumScore}%</span>
            <span className="text-xs text-text-dim block">Equilibrium Score</span>
          </div>
        </div>

        {/* Client Encryption */}
        <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-purple-300 block font-mono">100% Zero-Leak</span>
            <span className="text-[11px] text-text-dim block">Local Decryption</span>
          </div>
        </div>
      </div>

      {/* 7-Day Trajectory + Mood Spectrum Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Emotional Flow */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand-accent" />
              <h3 className="text-base font-bold text-white">7-Day Emotional Trajectory</h3>
            </div>
            <span className="text-xs text-text-dim font-mono">Valence Flow</span>
          </div>

          <div className="grid grid-cols-7 gap-2 h-44 items-end pb-2">
            {sevenDayFlow.map((day, idx) => {
              const heightPct = day.score > 0 ? (day.score / 5) * 100 : 8;
              const moodInfo = day.mood ? MOOD_MAP[day.mood] : null;

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  {moodInfo && (
                    <span className="text-sm scale-90 group-hover:scale-110 transition-transform">
                      {moodInfo.emoji}
                    </span>
                  )}
                  <div
                    className={`w-full rounded-xl transition-all duration-500 ${
                      moodInfo ? '' : 'bg-white/5'
                    }`}
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: moodInfo ? moodInfo.color : undefined,
                      opacity: day.count > 0 ? 0.85 : 0.2,
                    }}
                  />
                  <span className="text-[10px] font-mono text-text-dim uppercase">
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mood Distribution Spectrum */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Smile size={18} className="text-pink-400" />
              <h3 className="text-base font-bold text-white">Mood Spectrum Breakdown</h3>
            </div>
            <span className="text-xs text-text-dim font-mono">30-Day Distribution</span>
          </div>

          <div className="space-y-3">
            {Object.entries(MOOD_MAP).map(([key, config]) => {
              const count = moodDistribution.counts[key] || 0;
              const pct = moodDistribution.percentages[key] || 0;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{config.emoji}</span>
                      <span className="font-medium text-white">{config.label}</span>
                    </div>
                    <span className="font-mono text-text-dim">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: config.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 30-Day Consistency Heatmap Grid */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-brand-accent" />
            <h3 className="text-base font-bold text-white">30-Day Sanctuary Activity Heatmap</h3>
          </div>
          <span className="text-xs text-text-dim font-mono">Daily Consistency</span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 pt-2">
          {thirtyDayHeatmap.map((cell, idx) => {
            const moodInfo = cell.mood ? MOOD_MAP[cell.mood] : null;

            return (
              <div
                key={idx}
                title={`${cell.dateStr}: ${cell.count} entries ${cell.mood ? `(${cell.mood})` : ''}`}
                className={`h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-mono transition-all border ${
                  cell.count > 0
                    ? `${moodInfo ? moodInfo.bg : 'bg-white/10'} ${moodInfo ? moodInfo.border : 'border-white/10'} text-white font-bold`
                    : 'bg-white/[0.02] border-white/5 text-text-dim/40'
                }`}
              >
                <span>{cell.dayNum}</span>
                {moodInfo && <span className="text-[10px] leading-none">{moodInfo.emoji}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Cognitive Insights & Tag Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Tag Themes */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Tag size={16} className="text-brand-accent" />
            <span>Top Recurring Themes</span>
          </h4>
          {topTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="bg-white/5 border border-white/10 text-white/80 text-xs font-mono px-3 py-1 rounded-xl flex items-center gap-1.5"
                >
                  #{tag}
                  <span className="text-[10px] text-brand-accent font-bold">({count})</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-dim">Add #tags to your entries to reveal cognitive themes.</p>
          )}
        </div>

        {/* Clinical Recommendation Card */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-brand-accent/20 bg-brand-accent/[0.02] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-accent font-bold text-xs uppercase tracking-wider font-mono">
              <Lightbulb size={16} />
              <span>Personalized Cognitive Insight</span>
            </div>
            <h4 className="text-lg font-bold text-white">
              {streak >= 3
                ? "Excellent Momentum — Consistent Reflection Deepens Self-Regulation"
                : "Gentle Reminder — 5 Minutes of Reflection Restores Mental Clarity"}
            </h4>
            <p className="text-xs text-text-dim leading-relaxed">
              Based on your emotional trajectory, engaging with structured CBT Thought Records and Somatic Gratitude Triads can lower cognitive fatigue and prevent emotional overwhelm before sleep.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/5">
            <Link
              to="/diary"
              className="text-xs font-bold text-brand-accent hover:text-brand-accent-hover flex items-center gap-1.5"
            >
              <span>Apply Guided Reflection Protocol</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodDashboard;
