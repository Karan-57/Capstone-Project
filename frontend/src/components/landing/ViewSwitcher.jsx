import React, { useState } from "react";

export default function ViewSwitcher({ currentView, onViewChange, onDownloadZip }) {
  const [collapsed, setCollapsed] = useState(false);

  const views = [
    { id: "landing", label: "🏠 Landing", color: "text-slate-800" },
    { id: "creator-auth", label: "🎬 Creator Auth", color: "text-purple-400" },
    { id: "editor-auth", label: "✂️ Editor Auth", color: "text-blue-400" },
    { id: "creator-dash", label: "💜 Creator Dashboard", color: "text-purple-400" },
    { id: "editor-dash", label: "💙 Editor Dashboard", color: "text-blue-400" },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[9995] flex items-end flex-col gap-2 pointer-events-auto select-none">
      {!collapsed ? (
        <div className="bg-slate-900/90 text-white rounded-2xl p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-slate-700/80 backdrop-blur-xl flex flex-col gap-1.5 animate-fadeIn text-xs">
          <div className="flex items-center justify-between px-2 pb-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-semibold">
            <span>✨ Live Preview Navigation</span>
            <button
              onClick={() => setCollapsed(true)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Minimize panel"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap gap-1 max-w-[340px]">
            {views.map((v) => {
              const active = currentView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onViewChange(v.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-purple-600 text-white shadow-sm font-semibold"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>

          {onDownloadZip && (
            <button
              onClick={onDownloadZip}
              className="mt-1 w-full py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11.5px] font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>📦 Download Complete Project (.zip)</span>
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => setCollapsed(false)}
          className="px-3 py-2 rounded-xl bg-slate-900/90 border border-purple-500/40 text-white text-xs font-bold shadow-lg backdrop-blur-md hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <span>⚡ Switch Views</span>
        </button>
      )}
    </div>
  );
}
