import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import CustomCursor from "../components/landing/CustomCursor";
import SectionHeading from "../components/landing/SectionHeading";
import Workflow from "../components/landing/Workflow";
import MatchPreview from "../components/landing/MatchPreview";
import CollaborationPreview from "../components/landing/CollaborationPreview";
import Footer from "../components/landing/Footer";

const PROBLEMS = [
  {
    index: "01",
    title: "Discovery",
    detail:
      "Creators scroll through hundreds of generic profiles trying to guess who can actually cut a cinematic travel reel versus a fast-paced gaming highlight — the two require completely different skills.",
  },
  {
    index: "02",
    title: "Compatibility",
    detail:
      "A polished portfolio doesn't say whether an editor is free this week, comfortable with your footage format, or has done this specific style of edit before.",
  },
  {
    index: "03",
    title: "Collaboration",
    detail:
      "Once work starts, feedback lives in one app, files in another, and revisions get tracked in a spreadsheet — so nothing about the project's status is in one place.",
  },
];

const GENERIC = [
  "Broad freelancer discovery",
  "Generic, unverified portfolios",
  "Fragmented communication via email/chat",
  "No timeline-specific review tools",
  "Uncertain revision management",
];

const COLLABO_DIFF = [
  "Editor-focused skill discovery",
  "Format & style algorithmic matching",
  "Portfolio & reel verified selection",
  "Dedicated timeline workspace",
  "Timestamped video feedback",
  "End-to-end milestone management",
];

const PRINCIPLES = [
  {
    title: "Better Discovery",
    detail: "Editors are found by what they're actually specialized in, not just a generic freelance headline.",
  },
  {
    title: "Meaningful Collaboration",
    detail: "Feedback, raw assets, and cut versions stay attached to the project, never scattered across messaging apps.",
  },
  {
    title: "Clear Project Velocity",
    detail: "Both creators and editors see exactly what stage a production is in at any time.",
  },
];

const IMPACT = [
  {
    heading: "For Creators",
    points: [
      "Frictionless editor discovery",
      "Style-matched talent recommendations",
      "Real-time timestamped video feedback",
      "Structured milestone approvals",
    ],
  },
  {
    heading: "For Editors",
    points: [
      "High-ticket creator editing projects",
      "Showcase DaVinci & Premiere reels",
      "Clear, concrete creative requirements",
      "Guaranteed milestone payments",
    ],
  },
  {
    heading: "For the Industry",
    points: [
      "Consolidated video production lifecycle",
      "True creator-editor artistic synergy",
      "Professional standard review protocols",
    ],
  },
];

export default function About() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#fafbfc] text-slate-900 overflow-x-hidden font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* ─── VISION PRO GLASS CURSOR ─── */}
      <CustomCursor />

      {/* ─── FLOATING PILL NAVBAR ─── */}
      <Navbar activeTab="About" />

      {/* ─── AMBIENT BACKGROUND GLOWS ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-purple-100/40 via-sky-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 pt-28 sm:pt-36 pb-20">
        {/* ─── HERO SECTION ─── */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 pb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs uppercase tracking-widest font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                About Collabo
              </span>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[54px] leading-[1.1] mt-4 text-slate-900 tracking-tight">
                Video collaboration, built around the <span className="text-purple-600">people</span> behind the work.
              </h1>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 max-w-lg">
                Collabo connects creators with video editors through a focused platform designed specifically around discovery, timeline collaboration, feedback, and delivery.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/login?role=creator')}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-md shadow-purple-900/20 transition-all cursor-pointer"
                >
                  Find an Editor
                </button>
                <button
                  onClick={() => navigate('/login?role=editor')}
                  className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 text-sm font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  Join as Video Editor
                </button>
              </div>
            </div>

            {/* Hero visual: Live active projects card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-md">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Productions</span>
                </div>
                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  3 in progress
                </span>
              </div>
              <div className="space-y-3.5">
                {[
                  { title: "Cinematic Travel Reel — Bali (4K)", stage: "Revision 02", pct: 75, badge: "color" },
                  { title: "Tech Product Launch Teaser", stage: "First Cut", pct: 40, badge: "cut" },
                  { title: "Wedding Highlight Film", stage: "Delivered", pct: 100, badge: "done" },
                ].map((p) => (
                  <div key={p.title} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">{p.title}</span>
                      <span className="text-xs font-semibold text-slate-500">{p.stage}</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          p.pct === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-purple-600 to-indigo-600"
                        }`}
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── THE PROBLEM ─── */}
        <section className="border-t border-slate-200/80 py-20 bg-white/40">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <SectionHeading
              size="lg"
              index="The Challenge"
              title="Finding the right editor shouldn't feel like finding a needle in a marketplace."
            />

            <div className="mt-12 grid md:grid-cols-3 gap-8">
              {PROBLEMS.map((p) => (
                <div key={p.index} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:border-purple-200 transition-colors">
                  <span className="font-display text-sm font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                    {p.index}
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-4 tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {p.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── WORKFLOW / JOURNEY ─── */}
        <section className="border-t border-slate-200/80 py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 grid md:grid-cols-2 gap-16 items-start">
            <div className="sticky top-28">
              <SectionHeading
                index="Production Lifecycle"
                title="One platform. A complete editing collaboration journey."
                description="Collabo is built specifically around the way modern video editing projects actually move — from a creator's raw vision to a polished master render."
              />
              <div className="mt-8">
                <button
                  onClick={() => navigate('/login?role=creator')}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20 cursor-pointer"
                >
                  Start a Project Now →
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-sm">
              <Workflow />
            </div>
          </div>
        </section>

        {/* ─── COMPARISON: GENERIC VS COLLABO ─── */}
        <section className="border-t border-slate-200/80 py-20 bg-white/40">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <SectionHeading
              index="Why Collabo"
              title="Built specifically for video collaboration, not generic freelancing."
              align="center"
            />

            <div className="mt-12 grid md:grid-cols-2 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
              <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                  Generic Freelance Platforms
                </p>
                <ul className="space-y-4">
                  {GENERIC.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-500">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 bg-gradient-to-br from-purple-500/5 via-white to-blue-500/5">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                    Collabo Ecosystem
                  </p>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    Dedicated Workspace
                  </span>
                </div>
                <ul className="space-y-4">
                  {COLLABO_DIFF.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── INTELLIGENT MATCHING ─── */}
        <section className="border-t border-slate-200/80 py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeading
                index="Matchmaking"
                title="Don't just find an editor. Find the exact right fit."
                description="A creator defines project parameters — video style, editing software (Premiere / DaVinci), turnaround time, and references. Collabo scores available editors based on verified style capability."
              />
            </div>
            <MatchPreview />
          </div>
        </section>

        {/* ─── TIMELINE COLLABORATION ─── */}
        <section className="border-t border-slate-200/80 py-20 bg-white/40">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <SectionHeading
              index="Review Workspace"
              title="The collaboration continues after the editor is chosen."
              description="Every project maintains its footage links, cut iterations, timestamped feedback, and milestone approvals in one shared workspace."
              align="center"
            />
            <div className="mt-12 max-w-4xl mx-auto">
              <CollaborationPreview />
            </div>
          </div>
        </section>

        {/* ─── CORE PRINCIPLES ─── */}
        <section className="border-t border-slate-200/80 py-20">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <SectionHeading
              index="Our Vision"
              title="Making video collaboration frictionless and transparent."
              align="center"
            />

            <div className="mt-12 grid md:grid-cols-3 gap-8">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {p.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── PROJECT IMPACT ─── */}
        <section className="border-t border-slate-200/80 py-20 bg-white/40">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <SectionHeading
              index="Capstone Scope"
              title="What this project sets out to improve."
              align="center"
            />

            <div className="mt-12 grid md:grid-cols-3 gap-8">
              {IMPACT.map((group) => (
                <div key={group.heading} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs">
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-4">{group.heading}</p>
                  <ul className="space-y-3">
                    {group.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FINAL CALL TO ACTION ─── */}
        <section className="border-t border-slate-200/80 py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Ready to create something worth sharing?
            </h2>
            <p className="mt-3 text-slate-500 text-base">
              Join top YouTube creators and motion editors building the next generation of video content.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/login?role=creator')}
                className="px-7 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-md shadow-purple-900/25 transition-all cursor-pointer"
              >
                Find an Editor Now →
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-800 text-sm font-semibold shadow-2xs transition-all cursor-pointer"
              >
                Create Free Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  );
}
