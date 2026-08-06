import React from 'react';

export const OverlayShell: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-[999999] bg-slate-900/90 text-white backdrop-blur-md p-4 rounded-xl shadow-2xl border border-slate-700/50 max-w-sm pointer-events-auto select-none">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h3 className="font-bold text-sm tracking-wide text-slate-100">FactCheck AI</h3>
        </div>
        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">v1.0.0</span>
      </div>
      <p className="text-xs text-slate-300">Syncing with HTML5 video timeline...</p>
    </div>
  );
};
