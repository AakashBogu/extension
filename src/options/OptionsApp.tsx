import React from 'react';

export const OptionsApp: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-100">Extension Settings</h1>
        <p className="text-sm text-slate-400">Configure AI Providers, Search Providers, and Fact-Checking Sensitivity</p>
      </header>
      <main className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-sm">
        <h2 className="text-lg font-semibold text-slate-200 mb-2">Module 1A Foundation Shell</h2>
        <p className="text-slate-400">Settings framework initialized and ready for module configuration inputs.</p>
      </main>
    </div>
  );
};
