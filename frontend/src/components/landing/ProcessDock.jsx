import React from "react";

export default function ProcessDock() {
  const steps = [
    {
      id: "post",
      icon: (
        <div className="w-10 h-10 rounded-xl bg-sky-100/90 flex items-center justify-center text-sky-600 shadow-sm border border-sky-200/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
      ),
      title: "Post Requirements",
      description: "Share your video needs in just a few steps.",
    },
    {
      id: "match",
      icon: (
        <div className="w-10 h-10 rounded-xl bg-indigo-100/90 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
      ),
      title: "Get Matched",
      description: "We connect you with the right editor for your project.",
    },
    {
      id: "collaborate",
      icon: (
        <div className="w-10 h-10 rounded-xl bg-blue-100/90 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="12" y2="14" />
          </svg>
        </div>
      ),
      title: "Collaborate",
      description: "Communicate, review and get updates in real-time.",
    },
    {
      id: "delivery",
      icon: (
        <div className="w-10 h-10 rounded-xl bg-sky-100/90 flex items-center justify-center text-sky-600 shadow-sm border border-sky-200/60">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 10 11 15 8 12" />
          </svg>
        </div>
      ),
      title: "Get Delivery",
      description: "Receive your final edit on time, every time.",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 -mt-8 relative z-30">
      <div className="glass-dock rounded-3xl p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 transition-all duration-300">
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 hover:bg-white/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] cursor-pointer group"
          >
            <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
              {step.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[13.5px] font-bold text-slate-800 tracking-tight transition-colors group-hover:text-slate-950">
                {step.title}
              </h4>
              <p className="text-[11.5px] text-slate-500 leading-snug mt-0.5 font-normal line-clamp-2">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
