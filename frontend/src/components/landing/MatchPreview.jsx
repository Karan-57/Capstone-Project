import React from "react";

const SCORES = [
  { label: "Skill compatibility", value: 96 },
  { label: "Style compatibility", value: 92 },
  { label: "Availability", value: 95 },
  { label: "Portfolio relevance", value: 93 },
];

export default function MatchPreview() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-md overflow-hidden">
      {/* Mockup chrome */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">Editor Matching Algorithm</span>
        </div>
        <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
          Match Recommendation
        </span>
      </div>

      <div className="p-6">
        {/* Project brief box */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Project Brief</p>
          <p className="text-sm font-medium text-slate-800 italic">
            "30-second cinematic travel reel for Instagram & YouTube Shorts."
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Cinematic editing", "Short-form", "Color grading", "4K 60fps", "3-day turnaround"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-white border border-slate-200/80 px-2.5 py-1 text-xs text-slate-600 font-medium shadow-2xs"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>

        {/* Matched Editor Info */}
        <div className="flex items-end justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Match Editor</p>
            <p className="font-display text-lg font-bold text-slate-900 mt-0.5">
              Priya Nair <span className="text-xs font-normal text-slate-400">(Senior Motion Editor)</span>
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-extrabold text-purple-600 leading-none">
              94%
            </p>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">compatibility</p>
          </div>
        </div>

        {/* Compatibility Breakdown Bars */}
        <div className="space-y-3.5">
          {SCORES.map((s) => (
            <div key={s.label}>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-slate-600">{s.label}</span>
                <span className="text-slate-900 font-bold">{s.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${s.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
