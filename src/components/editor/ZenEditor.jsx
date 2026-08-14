import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import EditorToolbar from './EditorToolbar';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ZenEditor — Commercial-Grade Markdown & Distraction-Free Reflection Canvas
 */
const ZenEditor = ({
  content,
  onChange,
  placeholder = "Write your reflections freely...",
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isTypewriter, setIsTypewriter] = useState(false);

  const textareaRef = useRef(null);

  /**
   * Apply Markdown formatting to current cursor selection or line.
   */
  const handleFormat = useCallback((type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);
    let replacement = '';
    let newCursorPos = start;

    switch (type) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        newCursorPos = selected ? end + 4 : start + 2;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        newCursorPos = selected ? end + 2 : start + 1;
        break;
      case 'strike':
        replacement = `~~${selected || 'strikethrough'}~~`;
        newCursorPos = selected ? end + 4 : start + 2;
        break;
      case 'h1':
        replacement = `\n# ${selected || 'Heading 1'}\n`;
        newCursorPos = start + 3;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Heading 2'}\n`;
        newCursorPos = start + 4;
        break;
      case 'bullet':
        replacement = `\n- ${selected || 'List item'}\n`;
        newCursorPos = start + 3;
        break;
      case 'number':
        replacement = `\n1. ${selected || 'List item'}\n`;
        newCursorPos = start + 4;
        break;
      case 'task':
        replacement = `\n- [ ] ${selected || 'New task'}\n`;
        newCursorPos = start + 7;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Quote reflection'}\n`;
        newCursorPos = start + 3;
        break;
      case 'code':
        if (selected.includes('\n')) {
          replacement = `\n\`\`\`\n${selected || 'code block'}\n\`\`\`\n`;
        } else {
          replacement = `\`${selected || 'code'}\``;
        }
        newCursorPos = start + (selected ? end + 2 : 1);
        break;
      case 'hr':
        replacement = `\n\n---\n\n`;
        newCursorPos = start + 7;
        break;
      default:
        return;
    }

    const updated = content.slice(0, start) + replacement + content.slice(end);
    onChange(updated);

    // Restore focus & cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  }, [content, onChange]);

  /**
   * Keyboard shortcuts listener (Ctrl+B, Ctrl+I, Ctrl+K, Tab).
   */
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      handleFormat('bold');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      handleFormat('italic');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = content.slice(start, end);
      const link = `[${selected || 'title'}](https://)`;
      const updated = content.slice(0, start) + link + content.slice(end);
      onChange(updated);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const updated = content.slice(0, start) + '  ' + content.slice(end);
      onChange(updated);
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 10);
    }
  };

  /**
   * Typewriter scrolling effect: keeps cursor line vertically centered.
   */
  const handleInput = () => {
    if (isTypewriter && textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorY = textarea.selectionStart;
      const lineCount = content.slice(0, cursorY).split('\n').length;
      const lineHeight = 24; // approx px per line
      const targetScroll = (lineCount * lineHeight) - (textarea.clientHeight / 2);
      textarea.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  };

  /**
   * Live statistics calculation.
   */
  const stats = useMemo(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = content.length;
    const readingMins = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readingMins };
  }, [content]);

  /**
   * Clean built-in Markdown to HTML parser for instant preview mode.
   */
  const renderMarkdown = (raw) => {
    if (!raw) return '<p class="text-text-dim italic">Empty reflection...</p>';

    let html = raw
      // Escape HTML tags to prevent injection
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-5 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-white mt-6 mb-3">$1</h1>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-brand-accent/60 pl-4 py-1 italic text-text-dim my-3 bg-white/[0.02] rounded-r-lg">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-white/10 my-6" />')
      // Bold & Italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em class="text-white/90 italic">$1</em>')
      .replace(/~~(.*?)~~/gim, '<del class="line-through text-text-dim">$1</del>')
      // Task lists
      .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center gap-2 my-1"><input type="checkbox" disabled class="rounded" /> <span>$1</span></div>')
      .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center gap-2 my-1"><input type="checkbox" checked disabled class="rounded text-brand-accent" /> <span class="line-through text-text-dim">$1</span></div>')
      // Bullet lists
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-white/90">$1</li>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-white/10 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>')
      // Line breaks
      .replace(/\n/gim, '<br />');

    return html;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Editor Toolbar */}
      <EditorToolbar
        onFormat={handleFormat}
        isPreview={isPreview}
        onTogglePreview={() => setIsPreview(!isPreview)}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        isTypewriter={isTypewriter}
        onToggleTypewriter={() => setIsTypewriter(!isTypewriter)}
      />

      {/* Editor / Preview Body */}
      <div className="flex-1 min-h-0 flex flex-col py-3 overflow-hidden">
        {isPreview ? (
          <div
            className="flex-1 overflow-y-auto pr-2 text-sm sm:text-base leading-relaxed text-white/90 prose prose-invert max-w-none font-inter select-text"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              onChange(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`flex-1 w-full bg-transparent text-white/95 outline-none resize-none text-sm sm:text-base leading-relaxed placeholder:text-white/20 font-inter transition-opacity duration-300 ${
              isFocusMode ? 'focus:opacity-100 opacity-80' : 'opacity-100'
            }`}
          />
        )}
      </div>

      {/* Live Reading Telemetry Bar */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-text-dim font-mono select-none">
        <div className="flex items-center gap-4">
          <span>{stats.words} words</span>
          <span className="hidden sm:inline">{stats.chars} characters</span>
          <span>~{stats.readingMins} min read</span>
        </div>
        <div className="flex items-center gap-2">
          {isFocusMode && (
            <span className="text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded text-[10px] font-bold">
              Focus Active
            </span>
          )}
          {isTypewriter && (
            <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
              Typewriter
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZenEditor;
