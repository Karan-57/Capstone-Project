import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CollaboLogo from "../components/landing/CollaboLogo";
import FloatingSoftwareIcons from "../components/landing/FloatingSoftwareIcons";
import HeroCardsShowcase from "../components/landing/HeroCardsShowcase";
import ProcessDock from "../components/landing/ProcessDock";
import Navbar from "../components/landing/Navbar";
import CustomCursor from "../components/landing/CustomCursor";
import StartupLoader from "../components/landing/StartupLoader";

export default function LandingPage() {
  const navigate = useNavigate();
  const [showLoader, setShowLoader] = useState(() => {
    return !sessionStorage.getItem("collabo_loader_shown");
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeDot, setActiveDot] = useState(0);

  const handleLoaderComplete = () => {
    setShowLoader(false);
    sessionStorage.setItem("collabo_loader_shown", "true");
  };

  // Mouse move parallax listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      // Normalized between -1 and 1
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Scroll listener for dot indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? scrolled / total : 0;
      setActiveDot(Math.min(5, Math.floor(pct * 6)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#fafbfc] text-slate-900 overflow-x-hidden font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* ─── APPLE STARTUP LOADER ─── */}
      {showLoader && <StartupLoader onComplete={handleLoaderComplete} />}

      {/* ─── VISION PRO GLASS CURSOR ─── */}
      <CustomCursor />

      {/* ─── FLOATING PILL NAVBAR ─── */}
      <Navbar activeTab="Home" />

      {/* ─── SOUNDWAVE & AMBIENT AUDIO VISUALIZER BACKGROUND ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center justify-between px-4 sm:px-12 opacity-35 filter blur-[0.5px]">
          {Array.from({ length: 42 }).map((_, i) => {
            const h = Math.sin((i / 42) * Math.PI) * 110 + 20;
            const delay = (i * 0.08).toFixed(2);
            return (
              <div
                key={i}
                className="soundwave-bar w-[2px] sm:w-[3px] bg-gradient-to-t from-transparent via-purple-400/40 to-transparent rounded-full"
                style={{
                  height: `${h}px`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>

        {/* Ambient Radial Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-purple-100/40 via-sky-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/25 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-sky-200/25 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />
      </div>

      {/* ─── RIGHT VERTICAL APPLE DOT PROGRESS INDICATOR ─── */}
      <aside
        aria-label="Section Indicator"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3 pointer-events-auto"
      >
        {[0, 1, 2, 3, 4, 5].map((idx) => (
          <button
            key={idx}
            onClick={() => {
              const targets = ["hero", "process", "features", "workflow", "stats", "cta"];
              const el = document.getElementById(targets[idx]);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label={`Jump to section ${idx + 1}`}
            className={`w-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeDot === idx
                ? "h-8 bg-gradient-to-b from-purple-600 to-indigo-600 shadow-sm shadow-purple-500/30"
                : "h-2 bg-slate-300/80 hover:bg-slate-400"
            }`}
          />
        ))}
      </aside>

      {/* ─── HERO SECTION ─── */}
      <main id="hero" className="relative z-10 pt-28 sm:pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Step 1: Subtitle Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md mb-6 animate-fadeIn">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-slate-700">
            Next-Gen Video Collaboration Platform
          </span>
          <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
            2.0 Live
          </span>
        </div>

        {/* Step 2: Collabo Logo with Floating Software Icons */}
        <div className="relative mb-3 flex items-center justify-center">
          <CollaboLogo size={68} variant="isometric" animated={true} />
          {/* Floating Premiere Pro, DaVinci Resolve & 3D Project Assets */}
          <FloatingSoftwareIcons mousePos={mousePos} />
        </div>

        {/* Step 3: Main Headline "Collabo." */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 font-display">
          Collabo<span className="text-purple-600">.</span>
        </h1>

        {/* Step 4: Tagline */}
        <p className="mt-3 text-2xl sm:text-3xl md:text-[34px] font-semibold tracking-tight text-slate-800">
          Where <span className="text-[#38bdf8] font-bold">ideas</span> meet{" "}
          <span className="text-[#a855f7] font-bold">editors.</span>
        </p>

        {/* Step 5: Subtitle */}
        <div className="mt-4 max-w-xl text-sm sm:text-base text-slate-500 font-normal leading-relaxed space-y-0.5">
          <p>Connect with skilled freelance video editors.</p>
          <p>Share your requirements, get matched, and bring your vision to life.</p>
        </div>

        {/* Step 6: CTA Button "Login →" with Glowing Purple-Blue Edge */}
        <div className="mt-7 flex items-center justify-center">
          <button
            onClick={() => navigate("/login")}
            className="glow-btn-border group px-8 py-3.5 flex items-center gap-3 text-white text-[15px] font-semibold cursor-pointer shadow-lg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97]"
          >
            <span>Login</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* ─── 5-CARD 3D HERO FANOUT SHOWCASE ─── */}
        <div className="w-full mt-6">
          <HeroCardsShowcase mousePos={mousePos} />
        </div>

        {/* ─── FROSTED PROCESS DOCK (4 STEPS) ─── */}
        <div id="how-it-works" className="w-full">
          <ProcessDock />
        </div>
      </main>

      {/* ─── WORKFLOW & FEATURE SHOWCASE SECTION ─── */}
      <section id="ecosystem" className="relative z-10 max-w-6xl mx-auto px-6 py-28 md:py-36">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            The Production Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
            Built for modern video storytellers
          </h2>
          <p className="text-slate-500 mt-3 text-base">
            From raw clips to cinema-grade final masters. Everything creators and editors need in one seamless workspace.
          </p>
        </div>

        {/* Two-Column Feature Cards: For Creators vs For Editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Creator Card */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-br from-purple-500/5 via-white to-purple-500/10 border border-purple-200/70 shadow-[0_10px_30px_rgba(168,85,247,0.08)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(168,85,247,0.15)] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div className="inline-block text-xs font-bold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-md mb-2">
              For Creators
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Post projects, hire top tier editors</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Find proven talent for YouTube, Reels, TikTok, Podcasts, and Commercials. Track applications, review portfolios, and pay securely upon completion.
            </p>
            <div className="mt-6 pt-6 border-t border-purple-100 flex items-center justify-between">
              <button
                onClick={() => navigate("/login?role=creator")}
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Explore Creator Portal</span>
                <span>→</span>
              </button>
              <span className="text-xs text-slate-400 font-medium">8 active applications</span>
            </div>
          </div>

          {/* Editor Card */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-br from-sky-500/5 via-white to-blue-500/10 border border-blue-200/70 shadow-[0_10px_30px_rgba(59,130,246,0.08)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <div className="inline-block text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-md mb-2">
              For Editors
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Find projects, edit freely, get paid</h3>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              Showcase your DaVinci Resolve & Premiere Pro chops. Match with top creators offering competitive budgets and instant milestones.
            </p>
            <div className="mt-6 pt-6 border-t border-blue-100 flex items-center justify-between">
              <button
                onClick={() => navigate("/login?role=editor")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Explore Editor Portal</span>
                <span>→</span>
              </button>
              <span className="text-xs text-slate-400 font-medium">20+ available gigs</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <CollaboLogo size={32} variant="isometric" animated={false} />
            <span className="font-display font-bold text-lg text-slate-900">Collabo.</span>
            <span className="text-xs text-slate-400">© 2026 Collabo Inc. Capstone Project.</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
            <button onClick={() => navigate("/login?role=creator")} className="hover:text-purple-600 transition-colors cursor-pointer">
              Creator Portal
            </button>
            <button onClick={() => navigate("/login?role=editor")} className="hover:text-blue-600 transition-colors cursor-pointer">
              Editor Portal
            </button>
            <button onClick={() => navigate("/login")} className="hover:text-slate-900 transition-colors cursor-pointer font-semibold">
              Sign In
            </button>
            <button onClick={() => navigate("/signup")} className="hover:text-slate-900 transition-colors cursor-pointer font-semibold">
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
