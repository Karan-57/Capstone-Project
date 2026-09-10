import React from "react";

const FILES = [
  { name: "travel_reel_v2.mp4", meta: "Latest export · 42s" },
  { name: "raw_footage_bali.zip", meta: "1.8 GB" },
  { name: "color_ref.jpg", meta: "Reference image" },
];

export default function CollaborationPreview() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-md overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span className="text-sm font-bold text-slate-800">Travel Reel — Revision 02</span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60">
          In review
        </span>
      </div>

      <div className="grid md:grid-cols-[1.3fr_1fr]">
        {/* Video / timeline pane */}
        <div className="p-5 border-b md:border-b-0 md:border-r border-slate-100">
          <div className="rounded-xl bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center relative shadow-inner overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="absolute bottom-2.5 right-3 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded">
              00:42
            </span>
          </div>

          {/* Timeline scrubber with a feedback marker */}
          <div className="mt-4 relative h-6">
            <div className="absolute top-1/2 -translate-y-1/2 h-1.5 w-full rounded-full bg-slate-100" />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
              style={{ width: "43%" }}
            />
            <div
              className="absolute -top-0.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-purple-600 bg-white shadow-sm ring-2 ring-purple-600/20"
              style={{ left: "43%" }}
              title="Feedback at 00:18"
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-1">
            <span>00:00</span>
            <span className="text-purple-600 font-semibold">Feedback @ 00:18</span>
            <span>00:42</span>
          </div>

          <p className="mt-5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Assets</p>
          <div className="space-y-1.5">
            {FILES.map((f) => (
              <div
                key={f.name}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-xs hover:border-purple-200 transition-colors"
              >
                <span className="font-medium text-slate-700">{f.name}</span>
                <span className="text-slate-400">{f.meta}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback / messages pane */}
        <div className="p-5 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Timestamped Feedback</p>

            <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-3.5 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-purple-900">Meera (Creator)</span>
                <span className="text-[11px] font-bold text-purple-600 bg-purple-100/80 px-2 py-0.5 rounded-md">@ 00:18</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adjust the speed ramp transition around 00:18 — it feels a little abrupt against the beat drop.
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">Priya (Editor)</span>
                <span className="text-[11px] text-slate-400">2h ago</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Got it! Applied a smoother optical flow crossfade. Pushing the render now.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Milestone Status</p>
            <div className="flex items-center gap-2">
              {["Brief Approved", "First Cut", "Final Master"].map((stage, i) => (
                <span key={stage} className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      i <= 1 ? "bg-purple-600" : "bg-slate-300"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      i <= 1 ? "text-slate-800 font-semibold" : "text-slate-400"
                    }`}
                  >
                    {stage}
                  </span>
                  {i < 2 && <span className="text-slate-300">→</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
