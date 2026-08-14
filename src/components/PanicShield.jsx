import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PanicShield — Instant Discretion Mask
 * 
 * When triggered (via Escape key or toolbar shield button), instantly covers 
 * the entire screen with an authentic, interactive VS Code code editor simulation.
 * 
 * Perfect for maintaining privacy in shared spaces, cafes, libraries, or offices.
 * Press Escape again to return to your sanctuary.
 */
const PanicShield = ({ isActive, onDismiss }) => {
  const [activeTab, setActiveTab] = useState('dataPipeline.ts');
  const [cursorPos, setCursorPos] = useState({ line: 24, col: 18 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isActive) {
          onDismiss();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onDismiss]);

  if (!isActive) return null;

  const files = [
    { name: 'dataPipeline.ts', lang: 'typescript' },
    { name: 'schema.prisma', lang: 'prisma' },
    { name: 'analytics.py', lang: 'python' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="fixed inset-0 z-[9999] bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs select-none flex flex-col cursor-text"
      >
        {/* VS Code Titlebar */}
        <div className="h-8 bg-[#323233] border-b border-[#252526] flex items-center justify-between px-3 text-[#cccccc] text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block cursor-pointer" onClick={onDismiss} title="Close Disguise (Esc)" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block" />
            <span className="ml-4 text-white/50">workspace — Visual Studio Code</span>
          </div>
          <button
            onClick={onDismiss}
            className="text-[10px] text-white/30 hover:text-white/80 transition-colors"
            title="Press Esc to exit"
          >
            [Press Esc to resume]
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Activity Bar */}
          <div className="w-12 bg-[#333333] flex flex-col items-center py-3 gap-5 text-white/40 border-r border-[#252526]">
            <div className="text-white border-l-2 border-white pl-2 w-full flex justify-center py-1">📁</div>
            <div>🔍</div>
            <div>🌿</div>
            <div>🐞</div>
            <div>🧩</div>
          </div>

          {/* Sidebar */}
          <div className="w-56 bg-[#252526] border-r border-[#1e1e1e] p-3 text-[11px] hidden sm:block">
            <div className="font-bold text-white/60 uppercase tracking-wider text-[10px] mb-3">Explorer</div>
            <div className="space-y-1 text-white/70">
              <div className="font-semibold text-white/90">▼ CORE-SERVICES</div>
              <div className="pl-3 space-y-1">
                <div className="text-emerald-400">📄 dataPipeline.ts</div>
                <div className="text-amber-400">📄 schema.prisma</div>
                <div className="text-blue-400">📄 analytics.py</div>
                <div className="text-white/40">📄 package.json</div>
                <div className="text-white/40">📄 tsconfig.json</div>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            {/* Tab bar */}
            <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto">
              {files.map((f) => (
                <div
                  key={f.name}
                  onClick={() => setActiveTab(f.name)}
                  className={`px-4 py-2 flex items-center gap-2 cursor-pointer border-r border-[#1e1e1e] ${
                    activeTab === f.name
                      ? 'bg-[#1e1e1e] text-white border-t border-t-[#007acc]'
                      : 'text-white/50 hover:bg-[#2a2d2e]'
                  }`}
                >
                  <span>{f.name}</span>
                  <span className="text-[10px] opacity-40 hover:opacity-100">✕</span>
                </div>
              ))}
            </div>

            {/* Code lines */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[13px] leading-relaxed flex gap-4">
              {/* Line numbers */}
              <div className="text-white/20 select-none text-right w-6 space-y-0.5">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code content */}
              <div className="flex-1 space-y-0.5 text-[#d4d4d4]">
                <div><span className="text-[#569cd6]">import</span> {'{'} <span className="text-[#9cdcfe]">Worker</span>, <span className="text-[#9cdcfe]">Queue</span>, <span className="text-[#9cdcfe]">Job</span> {'}'} <span className="text-[#569cd6]">from</span> <span className="text-[#ce9178]">'bullmq'</span>;</div>
                <div><span className="text-[#569cd6]">import</span> {'{'} <span className="text-[#9cdcfe]">RedisClient</span> {'}'} <span className="text-[#569cd6]">from</span> <span className="text-[#ce9178]">'@infra/cache'</span>;</div>
                <div><span className="text-[#569cd6]">import</span> {'{'} <span className="text-[#9cdcfe]">MetricsService</span> {'}'} <span className="text-[#569cd6]">from</span> <span className="text-[#ce9178]">'../telemetry/metrics'</span>;</div>
                <div className="text-transparent">.</div>
                <div><span className="text-[#6a9955]">// High-throughput async stream partition consumer</span></div>
                <div><span className="text-[#569cd6]">export class</span> <span className="text-[#4ec9b0]">DataPipelineWorker</span> {'{'}</div>
                <div className="pl-4"><span className="text-[#569cd6]">private</span> <span className="text-[#9cdcfe]">queue</span>: <span className="text-[#4ec9b0]">Queue</span>;</div>
                <div className="pl-4"><span className="text-[#569cd6]">private</span> <span className="text-[#9cdcfe]">metrics</span>: <span className="text-[#4ec9b0]">MetricsService</span>;</div>
                <div className="pl-4"><span className="text-[#569cd6]">private</span> <span className="text-[#9cdcfe]">batchThreshold</span> = <span className="text-[#b5cea8]">10_000</span>;</div>
                <div className="text-transparent">.</div>
                <div className="pl-4"><span className="text-[#569cd6]">constructor</span>(<span className="text-[#9cdcfe]">redis</span>: <span className="text-[#4ec9b0]">RedisClient</span>) {'{'}</div>
                <div className="pl-8"><span className="text-[#569cd6]">this</span>.<span className="text-[#9cdcfe]">queue</span> = <span className="text-[#569cd6]">new</span> <span className="text-[#4ec9b0]">Queue</span>(<span className="text-[#ce9178]">'telemetry_stream'</span>, {'{'} <span className="text-[#9cdcfe]">connection:</span> <span className="text-[#9cdcfe]">redis</span> {'}'});</div>
                <div className="pl-8"><span className="text-[#569cd6]">this</span>.<span className="text-[#9cdcfe]">metrics</span> = <span className="text-[#569cd6]">new</span> <span className="text-[#4ec9b0]">MetricsService</span>();</div>
                <div className="pl-4">{'}'}</div>
                <div className="text-transparent">.</div>
                <div className="pl-4"><span className="text-[#569cd6]">public async</span> <span className="text-[#dcdcaa]">processBatch</span>(<span className="text-[#9cdcfe]">job</span>: <span className="text-[#4ec9b0]">Job</span>): <span className="text-[#4ec9b0]">Promise</span>&lt;<span className="text-[#4ec9b0]">void</span>&gt; {'{'}</div>
                <div className="pl-8"><span className="text-[#569cd6]">const</span> <span className="text-[#9cdcfe]">startTime</span> = <span className="text-[#4ec9b0]">Date</span>.<span className="text-[#dcdcaa]">now</span>();</div>
                <div className="pl-8"><span className="text-[#569cd6]">const</span> {'{'} <span className="text-[#9cdcfe]">records</span>, <span className="text-[#9cdcfe]">partitionId</span> {'}'} = <span className="text-[#9cdcfe]">job</span>.<span className="text-[#9cdcfe]">data</span>;</div>
                <div className="pl-8"><span className="text-[#569cd6]">await this</span>.<span className="text-[#9cdcfe]">metrics</span>.<span className="text-[#dcdcaa]">recordGauge</span>(<span className="text-[#ce9178]">'records_received'</span>, <span className="text-[#9cdcfe]">records</span>.<span className="text-[#9cdcfe]">length</span>);</div>
                <div className="pl-8 flex items-center">
                  <span><span className="text-[#569cd6]">const</span> <span className="text-[#9cdcfe]">transformed</span> = <span className="text-[#9cdcfe]">records</span>.<span className="text-[#dcdcaa]">map</span>(<span className="text-[#9cdcfe]">r</span> =&gt; ({'{'} ...<span className="text-[#9cdcfe]">r</span>, <span className="text-[#9cdcfe]">syncedAt:</span> <span className="text-[#569cd6]">new</span> <span className="text-[#4ec9b0]">Date</span>() {'}'}));</span>
                  <span className="w-2 h-4 bg-white/70 ml-1 animate-pulse" />
                </div>
                <div className="pl-8"><span className="text-[#569cd6]">await this</span>.<span className="text-[#dcdcaa]">flushToParquet</span>(<span className="text-[#9cdcfe]">transformed</span>, <span className="text-[#9cdcfe]">partitionId</span>);</div>
                <div className="pl-4">{'}'}</div>
              </div>
            </div>

            {/* Status bar */}
            <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px]">
              <div className="flex items-center gap-4">
                <span>🌿 main*</span>
                <span>↻ 0</span>
                <span>0 errors, 0 warnings</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Ln 20, Col 45</span>
                <span>Spaces: 2</span>
                <span>UTF-8</span>
                <span>TypeScript</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PanicShield;
