import React from 'react';

export const PopupApp: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h1 className="text-base font-bold text-slate-100">Video Fact-Checker</h1>
        <span className="text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">Active</span>
      </div>
      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300">
        <p className="font-semibold text-slate-200">Status: Foundation Initialized</p>
        <p className="mt-1 text-slate-400">Ready for audio capture pipeline registration.</p>
      </div>
    </div>
  );
};
