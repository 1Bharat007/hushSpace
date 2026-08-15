import React, { Component } from 'react';
import { ShieldAlert, RefreshCw, Database, Home } from 'lucide-react';
import { clearVaultDB } from '../../lib/storage/indexedDb';

/**
 * hushSpace v0.0.1 — Enterprise React Error Boundary
 * 
 * Catches unhandled runtime crashes, prevents white-screen freezes,
 * and provides safe recovery mechanisms with zero telemetry leakage.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Zero third-party telemetry: log strictly to local dev console
    console.error('[hushSpace ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearCacheAndRestart = async () => {
    try {
      await clearVaultDB();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error('Failed to clear cache:', err);
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6 font-inter select-none">
          <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-white/10 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto">
              <ShieldAlert size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Sanctuary Paused</h2>
              <p className="text-sm text-text-dim leading-relaxed">
                An unexpected interface exception occurred. Your encrypted reflections and private data remain safe and untouched in your vault.
              </p>
            </div>

            {/* Error Message Snippet */}
            {this.state.error && (
              <div className="p-3 bg-black/40 border border-white/5 rounded-xl font-mono text-[11px] text-red-300/80 text-left overflow-x-auto max-h-24">
                {this.state.error.toString()}
              </div>
            )}

            {/* Recovery Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full bg-brand-accent hover:bg-brand-accent-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-accent/20 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw size={16} />
                <span>Reload Sanctuary</span>
              </button>

              <button
                onClick={this.handleClearCacheAndRestart}
                className="w-full bg-white/5 hover:bg-white/10 text-text-dim hover:text-white font-medium py-2.5 rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Database size={14} />
                <span>Clear Local Cache & Restart</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
