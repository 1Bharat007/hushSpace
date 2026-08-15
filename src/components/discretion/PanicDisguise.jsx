import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PanicDisguise — Multi-Environment Enterprise Discretion Camouflage
 * 
 * Provides 3 authentic disguises:
 * 1. VS Code TypeScript / Cloud Architecture IDE
 * 2. Excel Financial Projections & Analytics Spreadsheet
 * 3. Technical Cloud Architecture API Documentation
 * 
 * Includes dynamic document.title masking and instant Escape key dismiss.
 */
const PanicDisguise = ({ isActive, onDismiss }) => {
  const [theme, setTheme] = useState('vscode'); // 'vscode' | 'spreadsheet' | 'docs'
  const [activeCodeTab, setActiveCodeTab] = useState('dataPipeline.ts');
  const [selectedCell, setSelectedCell] = useState({ r: 3, c: 2 });

  const originalTitleRef = useRef('');

  // Manage browser tab title masking
  useEffect(() => {
    if (isActive) {
      originalTitleRef.current = document.title;
      if (theme === 'vscode') document.title = 'dataPipeline.ts — Visual Studio Code';
      else if (theme === 'spreadsheet') document.title = 'Q3_Financial_Projections_Model.xlsx — Excel';
      else if (theme === 'docs') document.title = 'API Reference — Cloud Infrastructure';
    } else if (originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
  }, [isActive, theme]);

  // Global hotkey listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isActive) {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onDismiss]);

  if (!isActive) return null;

  /* ------------------- DISGUISE 1: VS CODE ------------------- */
  const renderVSCode = () => {
    const files = [
      { name: 'dataPipeline.ts', lang: 'typescript' },
      { name: 'authMiddleware.ts', lang: 'typescript' },
      { name: 'database.ts', lang: 'typescript' },
    ];

    return (
      <div className="flex-1 flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs select-none">
        {/* Titlebar */}
        <div className="h-8 bg-[#323233] border-b border-[#252526] flex items-center justify-between px-3 text-[#cccccc] text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block cursor-pointer" onClick={onDismiss} title="Close Disguise" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block" />
            <span className="ml-4 text-white/50">core-engine — Visual Studio Code</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setTheme('spreadsheet')} className="hover:text-white text-[10px] text-white/40">Excel Mode</button>
            <button onClick={() => setTheme('docs')} className="hover:text-white text-[10px] text-white/40">Docs Mode</button>
            <button onClick={onDismiss} className="text-[10px] text-amber-400/70 hover:text-amber-300 font-bold">[Esc to return]</button>
          </div>
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
            <div className="font-bold text-white/60 uppercase tracking-wider text-[10px] mb-3">Explorer: core-engine</div>
            <div className="space-y-1 text-white/70">
              <div className="font-semibold text-white/90">▼ SRC / SERVICES</div>
              <div className="pl-3 space-y-1">
                <div className="text-emerald-400 cursor-pointer" onClick={() => setActiveCodeTab('dataPipeline.ts')}>📄 dataPipeline.ts</div>
                <div className="text-blue-400 cursor-pointer" onClick={() => setActiveCodeTab('authMiddleware.ts')}>📄 authMiddleware.ts</div>
                <div className="text-amber-400 cursor-pointer" onClick={() => setActiveCodeTab('database.ts')}>📄 database.ts</div>
                <div className="text-white/40">📄 package.json</div>
                <div className="text-white/40">📄 tsconfig.json</div>
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col bg-[#1e1e1e]">
            {/* Tab Bar */}
            <div className="flex items-center bg-[#252526] border-b border-[#1e1e1e] overflow-x-auto">
              {files.map((f) => (
                <div
                  key={f.name}
                  onClick={() => setActiveCodeTab(f.name)}
                  className={`px-4 py-2 flex items-center gap-2 cursor-pointer border-r border-[#1e1e1e] ${
                    activeCodeTab === f.name
                      ? 'bg-[#1e1e1e] text-white border-t border-t-[#007acc]'
                      : 'text-white/50 hover:bg-[#2a2d2e]'
                  }`}
                >
                  <span>{f.name}</span>
                </div>
              ))}
            </div>

            {/* Code Lines */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-[13px] leading-relaxed text-[#d4d4d4]">
              {activeCodeTab === 'dataPipeline.ts' ? (
                <div>
                  <p><span className="text-[#569cd6]">import</span> {'{'} <span className="text-[#9cdcfe]">Worker</span>, <span className="text-[#9cdcfe]">Queue</span> {'}'} <span className="text-[#569cd6]">from</span> <span className="text-[#ce9178]">'bullmq'</span>;</p>
                  <p><span className="text-[#569cd6]">import</span> <span className="text-[#9cdcfe]">Redis</span> <span className="text-[#569cd6]">from</span> <span className="text-[#ce9178]">'ioredis'</span>;</p>
                  <p className="text-[#6a9955]">// High-throughput asynchronous batch processing pipeline</p>
                  <p><span className="text-[#569cd6]">export class</span> <span className="text-[#4ec9b0]">DataIngestionPipeline</span> {'{'}</p>
                  <p className="pl-4"><span className="text-[#569cd6]">private</span> <span className="text-[#9cdcfe]">queue</span>: <span className="text-[#4ec9b0]">Queue</span>;</p>
                  <p className="pl-4"><span className="text-[#569cd6]">private</span> <span className="text-[#9cdcfe]">redis</span>: <span className="text-[#4ec9b0]">Redis</span>;</p>
                  <p className="pl-4">&nbsp;</p>
                  <p className="pl-4"><span className="text-[#569cd6]">constructor</span>(<span className="text-[#9cdcfe]">config</span>: <span className="text-[#4ec9b0]">PipelineConfig</span>) {'{'}</p>
                  <p className="pl-8"><span className="text-[#569cd6]">this</span>.<span className="text-[#9cdcfe]">redis</span> = <span className="text-[#569cd6]">new</span> <span className="text-[#4ec9b0]">Redis</span>(<span className="text-[#9cdcfe]">config</span>.<span className="text-[#9cdcfe]">redisUrl</span>);</p>
                  <p className="pl-8"><span className="text-[#569cd6]">this</span>.<span className="text-[#9cdcfe]">queue</span> = <span className="text-[#569cd6]">new</span> <span className="text-[#4ec9b0]">Queue</span>(<span className="text-[#ce9178]">'event_stream'</span>, {'{'} connection: <span className="text-[#569cd6]">this</span>.<span className="text-[#9cdcfe]">redis</span> {'}'});</p>
                  <p className="pl-4">{'}'}</p>
                  <p className="pl-4">&nbsp;</p>
                  <p className="pl-4"><span className="text-[#569cd6]">public async</span> <span className="text-[#dcdcaa]">dispatchBatch</span>(<span className="text-[#9cdcfe]">payloads</span>: <span className="text-[#4ec9b0]">Record</span>&lt;<span className="text-[#4ec9b0]">string</span>, <span className="text-[#4ec9b0]">any</span>&gt;[]): <span className="text-[#4ec9b0]">Promise</span>&lt;<span className="text-[#4ec9b0]">void</span>&gt; {'{'}</p>
                  <p className="pl-8"><span className="text-[#569cd6]">const</span> <span className="text-[#9cdcfe]">jobs</span> = <span className="text-[#9cdcfe]">payloads</span>.<span className="text-[#dcdcaa]">map</span>((<span className="text-[#9cdcfe]">data</span>) =&gt; ({'{'} name: <span className="text-[#ce9178]">'process'</span>, <span className="text-[#9cdcfe]">data</span> {'}'}));</p>
                  <p className="pl-8"><span className="text-[#c586c0]">await</span> <span className="text-[#569cd6]">this</span>.<span className="text-[#9cdcfe]">queue</span>.<span className="text-[#dcdcaa]">addBulk</span>(<span className="text-[#9cdcfe]">jobs</span>);</p>
                  <p className="pl-4">{'}'}</p>
                  <p>{'}'}</p>
                </div>
              ) : (
                <div>
                  <p><span className="text-[#569cd6]">import</span> {'{'} <span className="text-[#9cdcfe]">Request</span>, <span className="text-[#9cdcfe]">Response</span>, <span className="text-[#9cdcfe]">NextFunction</span> {'}'} <span className="text-[#569cd6]">from</span> <span className="text-[#ce9178]">'express'</span>;</p>
                  <p className="text-[#6a9955]">// Scoped JWT and Authorization context validator</p>
                  <p><span className="text-[#569cd6]">export const</span> <span className="text-[#dcdcaa]">authenticateBearerToken</span> = <span className="text-[#569cd6]">async</span> (<span className="text-[#9cdcfe]">req</span>: <span className="text-[#4ec9b0]">Request</span>, <span className="text-[#9cdcfe]">res</span>: <span className="text-[#4ec9b0]">Response</span>, <span className="text-[#9cdcfe]">next</span>: <span className="text-[#4ec9b0]">NextFunction</span>) =&gt; {'{'}</p>
                  <p className="pl-4"><span className="text-[#569cd6]">const</span> <span className="text-[#9cdcfe]">header</span> = <span className="text-[#9cdcfe]">req</span>.<span className="text-[#9cdcfe]">headers</span>.<span className="text-[#9cdcfe]">authorization</span>;</p>
                  <p className="pl-4"><span className="text-[#c586c0]">if</span> (!<span className="text-[#9cdcfe]">header</span> || !<span className="text-[#9cdcfe]">header</span>.<span className="text-[#dcdcaa]">startsWith</span>(<span className="text-[#ce9178]">'Bearer '</span>)) {'{'}</p>
                  <p className="pl-8"><span className="text-[#c586c0]">return</span> <span className="text-[#9cdcfe]">res</span>.<span className="text-[#dcdcaa]">status</span>(<span className="text-[#b5cea8]">401</span>).<span className="text-[#dcdcaa]">json</span>({'{'} error: <span className="text-[#ce9178]">'Unauthorized payload'</span> {'}'});</p>
                  <p className="pl-4">{'}'}</p>
                  <p className="pl-4"><span className="text-[#dcdcaa]">next</span>();</p>
                  <p>{'}'};</p>
                </div>
              )}
            </div>

            {/* Terminal Bar */}
            <div className="h-28 bg-[#181818] border-t border-[#252526] p-3 text-[12px] text-white/80 font-mono">
              <div className="flex items-center gap-3 text-white/50 text-[10px] uppercase font-bold border-b border-white/5 pb-1 mb-2">
                <span className="text-white border-b-2 border-white pb-1">Terminal</span>
                <span>Output</span>
                <span>Problems (0)</span>
              </div>
              <div className="text-emerald-400 font-bold">$ npm run worker:cluster</div>
              <div className="text-white/60">[Worker #1] Processed 14,250 ingestion events in 340ms. Status: healthy.</div>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[10px]">
              <div className="flex items-center gap-3">
                <span>⚡ master*</span>
                <span>TypeScript 5.4</span>
                <span>UTF-8</span>
              </div>
              <div>Ln 24, Col 18 • Spaces: 2</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------- DISGUISE 2: EXCEL SPREADSHEET ------------------- */
  const renderSpreadsheet = () => {
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const rows = [
      ['Metric', 'Q1 Actual', 'Q2 Actual', 'Q3 Target', 'Q4 Forecast', 'YoY Growth', 'Variance', 'Status'],
      ['ARR ($M)', '$12.4', '$14.8', '$17.2', '$20.5', '+42.5%', '+$0.6M', 'ON TRACK'],
      ['Gross Margin', '78.2%', '79.1%', '80.0%', '81.2%', '+3.0%', '+0.9%', 'OPTIMAL'],
      ['Net Retention', '118%', '121%', '124%', '126%', '+8.0%', '+3.0%', 'STRONG'],
      ['CAC Payback', '11.2 mo', '10.8 mo', '9.5 mo', '8.9 mo', '-20.5%', '-1.3 mo', 'EFFICIENT'],
      ['EBITDA ($M)', '$1.8', '$2.4', '$3.1', '$4.2', '+85.0%', '+$0.7M', 'AHEAD'],
      ['Burn Multiple', '0.42x', '0.38x', '0.32x', '0.28x', '-33.3%', '-0.06x', 'HEALTHY'],
    ];

    return (
      <div className="flex-1 flex flex-col bg-[#f3f2f1] text-[#323130] font-sans text-xs select-none">
        {/* Ribbon Header */}
        <div className="bg-[#107c41] text-white p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm">AutoSave (On)</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px]">Q3_Financial_Projections_Model.xlsx</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button onClick={() => setTheme('vscode')} className="hover:underline">VS Code Mode</button>
            <button onClick={() => setTheme('docs')} className="hover:underline">Docs Mode</button>
            <button onClick={onDismiss} className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded font-bold">
              Exit [Esc]
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-[#f3f2f1] border-b border-[#e1dfdd] p-2 flex items-center gap-4 text-xs">
          <span className="font-bold text-[#107c41]">File</span>
          <span>Home</span>
          <span>Insert</span>
          <span>Formulas</span>
          <span>Data</span>
          <span>Review</span>
          <span>View</span>
        </div>

        {/* Formula Bar */}
        <div className="bg-white border-b border-[#e1dfdd] px-3 py-1.5 flex items-center gap-3 font-mono text-xs">
          <span className="text-[#605e5c] font-bold">D3</span>
          <span className="text-[#a19f9d]">fx</span>
          <span className="text-[#323130]">=SUM(D$1:D$2)*1.15</span>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#f3f2f1] text-[#605e5c]">
                <th className="w-10 border border-[#e1dfdd] py-1 text-center font-normal">#</th>
                {columns.map((c) => (
                  <th key={c} className="border border-[#e1dfdd] px-3 py-1 text-center font-normal">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  <td className="bg-[#f3f2f1] text-[#605e5c] border border-[#e1dfdd] text-center font-bold">
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => {
                    const isSelected = selectedCell.r === rIdx && selectedCell.c === cIdx;
                    return (
                      <td
                        key={cIdx}
                        onClick={() => setSelectedCell({ r: rIdx, c: cIdx })}
                        className={`border border-[#e1dfdd] px-3 py-2 cursor-pointer ${
                          rIdx === 0 ? 'bg-[#f8f9fa] font-bold text-[#201f1e]' : 'text-[#323130]'
                        } ${isSelected ? 'outline outline-2 outline-[#107c41] bg-[#e8f5e9]' : ''}`}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sheet Tabs */}
        <div className="bg-[#f3f2f1] border-t border-[#e1dfdd] p-1.5 flex items-center gap-2 text-xs">
          <span className="bg-white border border-[#e1dfdd] border-b-white px-3 py-1 font-bold text-[#107c41] rounded-t">
            Summary P&L
          </span>
          <span className="text-[#605e5c] px-3 py-1 cursor-pointer">Cash Flow</span>
          <span className="text-[#605e5c] px-3 py-1 cursor-pointer">Headcount</span>
          <span className="text-[#605e5c] px-3 py-1 cursor-pointer">Cohort Retention</span>
        </div>
      </div>
    );
  };

  /* ------------------- DISGUISE 3: TECHNICAL DOCS ------------------- */
  const renderDocs = () => {
    return (
      <div className="flex-1 flex flex-col bg-[#0d1117] text-[#c9d1d9] font-sans text-sm select-none">
        {/* Nav */}
        <div className="h-14 bg-[#161b22] border-b border-[#30363d] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-white text-base">CLOUD ARCHITECTURE SPEC v4.2</span>
            <span className="bg-[#238636] text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">PRODUCTION</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <button onClick={() => setTheme('vscode')} className="hover:text-white text-white/50">VS Code</button>
            <button onClick={() => setTheme('spreadsheet')} className="hover:text-white text-white/50">Excel</button>
            <button onClick={onDismiss} className="text-amber-400 hover:text-amber-300 font-bold">[Esc to exit]</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 bg-[#161b22] border-r border-[#30363d] p-4 text-xs font-mono space-y-2 hidden md:block">
            <div className="font-bold text-white/50 uppercase">Architecture Guides</div>
            <div className="text-[#58a6ff] font-bold">1. Event Gateway & Auth</div>
            <div className="text-white/70">2. Real-Time WebSocket Broker</div>
            <div className="text-white/70">3. Sharded Storage Cluster</div>
            <div className="text-white/70">4. SLA & Disaster Recovery</div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto space-y-6 max-w-4xl">
            <h1 className="text-2xl font-bold text-white">Event Gateway & Microservice Authentication</h1>
            <p className="text-[#8b949e] leading-relaxed">
              All client ingress traffic terminates at the regional Edge Gateway with mTLS and token introspection before routing to inner cluster services.
            </p>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 font-mono text-xs text-[#79c0ff]">
              POST /v2/telemetry/ingest HTTP/1.1<br/>
              Host: api.internal.network<br/>
              Authorization: Bearer sec_tok_84920491024<br/>
              Content-Type: application/json
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.08 }}
        className="fixed inset-0 z-[99999] flex flex-col"
      >
        {theme === 'vscode' && renderVSCode()}
        {theme === 'spreadsheet' && renderSpreadsheet()}
        {theme === 'docs' && renderDocs()}
      </motion.div>
    </AnimatePresence>
  );
};

export default PanicDisguise;
