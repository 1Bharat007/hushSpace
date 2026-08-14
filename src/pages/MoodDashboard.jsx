import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
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
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MOOD_MAP = {
  anxious: { score: 1, emoji: '😫', label: 'Overwhelmed', color: '#f87171' },
  down: { score: 2, emoji: '😕', label: 'Low', color: '#fbbf24' },
  neutral: { score: 3, emoji: '😐', label: 'Calm', color: '#60a5fa' },
  good: { score: 4, emoji: '🙂', label: 'Clear', color: '#34d399' },
  peaceful: { score: 5, emoji: '😊', label: 'Serene', color: '#c084fc' },
};

const MoodDashboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'entries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Streak Calculation
  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    const entryDates = new Set(
      entries
        .map((e) => e.createdAt?.toDate?.()?.toISOString()?.slice(0, 10))
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
        break; // Streak broken
      }
    }
    return count;
  }, [entries]);

  // Mood distribution counts
  const moodDistribution = useMemo(() => {
    const counts = { anxious: 0, down: 0, neutral: 0, good: 0, peaceful: 0 };
    entries.forEach((e) => {
      if (e.mood && counts[e.mood] !== undefined) {
        counts[e.mood]++;
      }
    });
    return counts;
  }, [entries]);

  // Tag frequency
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
      .slice(0, 8);
  }, [entries]);

  // Last 7 days mood trend
  const sevenDayTrend = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayEntries = entries.filter(
        (e) => e.createdAt?.toDate?.()?.toISOString()?.slice(0, 10) === dateStr
      );

      let avgScore = 0;
      let dominantMood = null;
      if (dayEntries.length > 0) {
        const scores = dayEntries
          .map((e) => MOOD_MAP[e.mood]?.score || 3)
          .filter(Boolean);
        avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        dominantMood = dayEntries[0].mood;
      }

      days.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        avgScore,
        dominantMood,
        count: dayEntries.length,
      });
    }
    return days;
  }, [entries]);

  // 30-day activity calendar
  const thirtyDayHeatmap = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = entries.filter(
        (e) => e.createdAt?.toDate?.()?.toISOString()?.slice(0, 10) === dateStr
      ).length;

      days.push({ date: dateStr, count, dayNum: d.getDate() });
    }
    return days;
  }, [entries]);

  const totalEntries = entries.length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="text-brand-accent" size={32} />
            Emotional Analytics
          </h1>
          <p className="text-text-dim text-sm sm:text-base">
            Understand your psychological rhythms and self-reflection patterns.
          </p>
        </div>

        <Link
          to="/diary"
          className="flex items-center gap-2 bg-brand-accent hover:bg-brand-accent-hover text-white px-6 py-3 rounded-[var(--radius-custom)] font-bold text-sm transition-all shadow-lg shadow-brand-accent/20"
        >
          <BookOpen size={18} />
          <span>Write Reflection</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Streak Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 shrink-0">
            <Flame size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{streak} Days</div>
            <p className="text-xs text-text-dim mt-0.5">Active Reflection Streak</p>
          </div>
        </div>

        {/* Total Entries */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
            <BookOpen size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{totalEntries}</div>
            <p className="text-xs text-text-dim mt-0.5">Encrypted Reflections</p>
          </div>
        </div>

        {/* Milestone */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
            <Award size={28} />
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {streak >= 7 ? 'Master of Mind' : streak >= 3 ? 'Gaining Rhythm' : 'Mindful Starter'}
            </div>
            <p className="text-xs text-text-dim mt-0.5">Consistency Milestone</p>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Line & Mood Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Mood Trend */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp size={20} className="text-brand-accent" />
              7-Day Emotional Flow
            </h3>
            <p className="text-xs text-text-dim mb-6">
              Track your trajectory across recent days (1 = Overwhelmed, 5 = Serene).
            </p>

            {/* Custom SVG Chart */}
            <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
              {sevenDayTrend.map((day, idx) => {
                const heightPct = day.avgScore > 0 ? (day.avgScore / 5) * 100 : 8;
                const moodObj = day.dominantMood ? MOOD_MAP[day.dominantMood] : null;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Emoji tooltip indicator */}
                    <div className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {moodObj?.emoji || '—'}
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[36px] bg-white/5 rounded-xl flex items-end p-1 h-32 relative overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.08 }}
                        className="w-full rounded-lg"
                        style={{
                          backgroundColor: moodObj?.color || '#3b82f6',
                          opacity: day.avgScore > 0 ? 0.85 : 0.2,
                        }}
                      />
                    </div>

                    {/* Day label */}
                    <span className="text-[11px] font-mono text-text-dim font-bold mt-1">
                      {day.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-text-dim">
            <span>Higher bars indicate serene & clear states.</span>
            <span className="text-brand-accent font-bold">Updated Live</span>
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Smile size={20} className="text-purple-400" />
            Mood Distribution
          </h3>
          <p className="text-xs text-text-dim">Proportion of moods across all entries.</p>

          <div className="space-y-3 pt-2">
            {Object.entries(MOOD_MAP).map(([key, item]) => {
              const count = moodDistribution[key] || 0;
              const pct = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-white flex items-center gap-1.5">
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </span>
                    <span className="font-mono text-text-dim">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 30-Day Activity Heatmap & Top Tags */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Heatmap */}
        <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Calendar size={20} className="text-blue-400" />
            30-Day Consistency Map
          </h3>
          <p className="text-xs text-text-dim mb-6">
            Visualizing your daily habit of unloading mental clutter.
          </p>

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {thirtyDayHeatmap.map((day, idx) => {
              let bg = 'bg-white/5';
              if (day.count === 1) bg = 'bg-brand-accent/40 border border-brand-accent/60 text-white font-bold';
              else if (day.count > 1) bg = 'bg-brand-accent text-white font-bold shadow-lg shadow-brand-accent/20';

              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] font-mono transition-all ${bg}`}
                  title={`${day.date}: ${day.count} entries`}
                >
                  <span>{day.dayNum}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Tags */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/5">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Tag size={20} className="text-emerald-400" />
            Core Reflection Themes
          </h3>
          <p className="text-xs text-text-dim mb-4">Most frequent topics in your sanctuary.</p>

          {topTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="bg-white/5 border border-white/10 text-white text-xs font-mono px-3 py-1.5 rounded-xl flex items-center gap-2"
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] text-brand-accent bg-brand-accent/10 px-1.5 py-0.5 rounded-md">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-dim italic py-8 text-center">
              Add tags (e.g. #gratitude, #work) to your diary entries to surface themes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodDashboard;
