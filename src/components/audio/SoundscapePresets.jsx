import React, { useState, useEffect } from 'react';
import { CURATED_PRESETS } from '../../lib/ambientEngine';
import { Sparkles, Bookmark, Plus, Trash2, Check } from 'lucide-react';

/**
 * SoundscapePresets — Quick preset selector and custom mix creator
 */
const SoundscapePresets = ({ onApplyPreset, currentMix }) => {
  const [customPresets, setCustomPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('hushspace_custom_sound_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleSaveCustomPreset = (e) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const preset = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      desc: 'Custom user atmosphere mix',
      tracks: { ...currentMix.volumes },
      pans: { ...currentMix.pans },
      active: { ...currentMix.active },
    };

    const updated = [...customPresets, preset];
    setCustomPresets(updated);
    try {
      localStorage.setItem('hushspace_custom_sound_presets', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not persist custom preset:', err);
    }

    setNewPresetName('');
    setIsCreating(false);
  };

  const handleDeleteCustomPreset = (id, e) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem('hushspace_custom_sound_presets', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not persist custom preset deletion:', err);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Sparkles size={12} className="text-brand-accent" />
          Curated Soundscape Presets
        </span>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-xs text-brand-accent hover:text-brand-accent-hover flex items-center gap-1 font-bold"
        >
          <Plus size={13} />
          <span>Save Current Mix</span>
        </button>
      </div>

      {/* Save Custom Mix Form */}
      {isCreating && (
        <form onSubmit={handleSaveCustomPreset} className="flex gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Name your custom mix..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-text-dim outline-none px-2 font-medium"
            autoFocus
          />
          <button
            type="submit"
            className="bg-brand-accent text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm"
          >
            Save
          </button>
        </form>
      )}

      {/* Preset Chips Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CURATED_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onApplyPreset(preset)}
            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-left transition-all group active:scale-98 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-brand-accent transition-colors flex items-center gap-1">
                <span>{preset.name}</span>
              </div>
              <p className="text-[10px] text-text-dim line-clamp-2 mt-0.5">{preset.desc}</p>
            </div>
          </button>
        ))}

        {/* Custom Presets */}
        {customPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onApplyPreset(preset)}
            className="p-2.5 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 text-left transition-all group active:scale-98 flex items-center justify-between"
          >
            <div className="min-w-0 flex-1 pr-1">
              <div className="text-xs font-bold text-purple-300 truncate flex items-center gap-1">
                <Bookmark size={11} className="shrink-0" />
                <span>{preset.name}</span>
              </div>
            </div>
            <button
              onClick={(e) => handleDeleteCustomPreset(preset.id, e)}
              className="text-text-dim hover:text-red-400 p-1 rounded transition-colors shrink-0"
              title="Delete Preset"
            >
              <Trash2 size={12} />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SoundscapePresets;
