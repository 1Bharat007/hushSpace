import React from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code, 
  Minus, 
  Eye, 
  EyeOff, 
  Target, 
  AlignVerticalSpaceAround 
} from 'lucide-react';

/**
 * EditorToolbar — Rich Markdown action bar supporting formatting, preview, and immersion modes.
 */
const EditorToolbar = ({
  onFormat,
  isPreview,
  onTogglePreview,
  isFocusMode,
  onToggleFocusMode,
  isTypewriter,
  onToggleTypewriter,
}) => {
  const tools = [
    { icon: Bold, label: 'Bold (Ctrl+B)', action: 'bold' },
    { icon: Italic, label: 'Italic (Ctrl+I)', action: 'italic' },
    { icon: Strikethrough, label: 'Strikethrough', action: 'strike' },
    { type: 'divider' },
    { icon: Heading1, label: 'Heading 1', action: 'h1' },
    { icon: Heading2, label: 'Heading 2', action: 'h2' },
    { type: 'divider' },
    { icon: List, label: 'Bullet List', action: 'bullet' },
    { icon: ListOrdered, label: 'Numbered List', action: 'number' },
    { icon: CheckSquare, label: 'Task List', action: 'task' },
    { type: 'divider' },
    { icon: Quote, label: 'Blockquote', action: 'quote' },
    { icon: Code, label: 'Code Block', action: 'code' },
    { icon: Minus, label: 'Divider', action: 'hr' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-white/[0.02] border-b border-white/5 rounded-t-xl select-none">
      {/* Formatting Tools */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-0.5">
        {tools.map((tool, idx) => {
          if (tool.type === 'divider') {
            return <div key={idx} className="w-px h-4 bg-white/10 mx-1 shrink-0" />;
          }

          const Icon = tool.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onFormat(tool.action)}
              title={tool.label}
              className="p-1.5 rounded-lg text-text-dim hover:text-white hover:bg-white/5 transition-all active:scale-95 shrink-0"
            >
              <Icon size={15} />
            </button>
          );
        })}
      </div>

      {/* Immersion & Preview Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Focus Mode */}
        <button
          type="button"
          onClick={onToggleFocusMode}
          title={isFocusMode ? 'Exit Focus Mode' : 'Focus Mode (Paragraph Dimming)'}
          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-all ${
            isFocusMode
              ? 'bg-brand-accent text-white shadow-sm'
              : 'text-text-dim hover:bg-white/5 hover:text-white'
          }`}
        >
          <Target size={13} />
          <span className="hidden sm:inline">Focus</span>
        </button>

        {/* Typewriter Scrolling */}
        <button
          type="button"
          onClick={onToggleTypewriter}
          title={isTypewriter ? 'Disable Typewriter Scrolling' : 'Enable Typewriter Mode'}
          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-all ${
            isTypewriter
              ? 'bg-purple-500 text-white shadow-sm'
              : 'text-text-dim hover:bg-white/5 hover:text-white'
          }`}
        >
          <AlignVerticalSpaceAround size={13} />
          <span className="hidden sm:inline">Typewriter</span>
        </button>

        {/* Live Preview Toggle */}
        <button
          type="button"
          onClick={onTogglePreview}
          title={isPreview ? 'Switch to Raw Editor' : 'Live Markdown Preview'}
          className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-all ${
            isPreview
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-text-dim hover:bg-white/5 hover:text-white'
          }`}
        >
          {isPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          <span className="hidden sm:inline">{isPreview ? 'Edit' : 'Preview'}</span>
        </button>
      </div>
    </div>
  );
};

export default EditorToolbar;
