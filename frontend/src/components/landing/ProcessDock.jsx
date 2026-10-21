import React, { useRef } from "react";
import { motion, useInView } from "motion/react";

export default function ProcessDock() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-60px" });

  const steps = [
    {
      id: "post",
      stepNum: "01",
      badgeColor: "bg-[#FFEBAA] text-[#382322]",
      iconBg: "bg-[#B1C8EA]/40 text-[#382322]",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      title: "Post Requirements",
      description: "Share your video needs in just a few steps.",
      tag: "BRIEF & ASSETS",
    },
    {
      id: "match",
      stepNum: "02",
      badgeColor: "bg-[#B1C8EA] text-[#382322]",
      iconBg: "bg-[#FFEBAA]/50 text-[#382322]",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Get Matched",
      description: "We connect you with the right editor for your project.",
      tag: "AI MATCHING",
    },
    {
      id: "collaborate",
      stepNum: "03",
      badgeColor: "bg-[#FDEBDE] text-[#382322]",
      iconBg: "bg-[#B1C8EA]/40 text-[#382322]",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="12" y2="14" />
        </svg>
      ),
      title: "Collaborate",
      description: "Communicate, review and get updates in real-time.",
      tag: "TIME-CODED CHAT",
    },
    {
      id: "delivery",
      stepNum: "04",
      badgeColor: "bg-[#FFEBAA] text-[#382322]",
      iconBg: "bg-[#FFEBAA]/60 text-[#382322]",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="16 10 11 15 8 12" />
        </svg>
      ),
      title: "Get Delivery",
      description: "Receive your final edit on time, every time.",
      tag: "ESCROW RELEASE",
    },
  ];

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto px-4 sm:px-6 relative z-30 pt-4">
      {/* Editorial Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBAA] border border-[#382322] shadow-[2px_2px_0_#382322] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#382322]" />
          <span className="font-mono text-[11px] font-bold text-[#382322] uppercase tracking-wider">
            Production Roadmap
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#382322] font-display tracking-tight">
          How It <span className="italic font-serif">Works</span>
        </h3>
        <p className="text-[#382322]/70 text-sm sm:text-base mt-2">
          From initial creator brief to cinema-grade final delivery in four tactile steps.
        </p>
      </div>

      {/* ─── DESKTOP CONNECTING SVG ROADMAP PATH ─── */}
      <div className="relative">
        <div className="hidden lg:block absolute top-[4.5rem] left-[8%] right-[8%] h-12 z-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 50" fill="none" preserveAspectRatio="none">
            {/* Background path dashed */}
            <path
              d="M 50 25 C 200 45, 300 5, 450 25 C 600 45, 750 5, 950 25"
              stroke="#382322"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              strokeOpacity="0.25"
            />
            {/* Animated draw path */}
            <motion.path
              d="M 50 25 C 200 45, 300 5, 450 25 C 600 45, 750 5, 950 25"
              stroke="#382322"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </svg>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 relative z-10">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
              transition={{ duration: 0.45, delay: idx * 0.12 }}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#FFF9F3] border-2 border-[#382322] shadow-[3px_3px_0_#382322] hover:shadow-[6px_6px_0_#382322] hover:-translate-y-1.5 transition-all duration-200 cursor-pointer"
            >
              {/* Tape Sticker on Card 1 and 3 */}
              {idx % 2 === 0 && (
                <div className="absolute -top-2.5 right-6 w-11 h-3.5 bg-[#FFEBAA] border border-[#382322]/40 rotate-[-2deg] pointer-events-none shadow-xs" />
              )}

              <div>
                {/* Step Top Bar: Number Pill & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-extrabold border border-[#382322] shadow-[1px_1px_0_#382322] ${step.badgeColor}`}>
                    {step.stepNum}
                  </span>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 border-[#382322] shadow-[2px_2px_0_#382322] transition-transform duration-200 group-hover:scale-105 ${step.iconBg}`}>
                    {step.icon}
                  </div>
                </div>

                {/* Tag */}
                <div className="text-[10px] font-mono font-bold tracking-widest text-[#382322]/60 uppercase mb-1">
                  {step.tag}
                </div>

                {/* Title */}
                <h4 className="text-base font-extrabold text-[#382322] tracking-tight group-hover:text-[#261615] transition-colors">
                  {step.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-[#382322]/75 leading-relaxed mt-1.5 font-normal">
                  {step.description}
                </p>
              </div>

              {/* Bottom connecting arrow indicator */}
              <div className="mt-4 pt-3 border-t border-[#382322]/15 flex items-center justify-between text-[11px] font-bold text-[#382322]">
                <span className="font-mono text-[10px] text-[#382322]/50 uppercase">Step {idx + 1} of 4</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
