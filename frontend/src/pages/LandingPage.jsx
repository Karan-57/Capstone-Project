import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CollaboLogo from "../components/landing/CollaboLogo";
import FloatingSoftwareIcons from "../components/landing/FloatingSoftwareIcons";
import HeroCardsShowcase from "../components/landing/HeroCardsShowcase";
import ProcessDock from "../components/landing/ProcessDock";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import StartupLoader from "../components/landing/StartupLoader";
import CursorDoodles from "../components/landing/CursorDoodles";
import ScrollStoryline from "../components/landing/ScrollStoryline";
import SEO from "../components/common/SEO";
import { Magnetic } from "../components/core/magnetic";
import { InkStar, InkArrow, InkScribble, TapeSticker } from "../components/dashboard/CollageDecoration";
import wavyLinesImg from "../assets/images/wavy-lines.jpg";

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
    <div className="relative min-h-screen bg-[#FDEBDE] text-[#382322] overflow-x-hidden font-sans selection:bg-[#FFEBAA] selection:text-[#382322]">
      <SEO
        title="AI-Powered Video Collaboration Platform"
        description="Connect top creators with elite video editors. Milestone escrow payments, AI proposal analysis, and interactive real-time review workspace."
      />

      {/* ─── TACTILE EDITORIAL STARTUP LOADER ─── */}
      {showLoader && <StartupLoader onComplete={handleLoaderComplete} />}

      {/* ─── CURSOR REACTIVE DOODLES ─── */}
      <CursorDoodles />

      {/* ─── SCROLL GUIDED STORYBOARD CONNECTING PATH ─── */}
      <ScrollStoryline />

      {/* ─── REFINED EDITORIAL PILL NAVBAR ─── */}
      <Navbar activeTab="Home" />

      {/* ─── ANALOG SOUNDWAVE & PAPER TEXTURE BACKGROUND ─── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0">
        {/* Paper Grain Overlay */}
        <div className="absolute inset-0 paper-grain opacity-60" />

        {/* Ambient Subtle Waveform Bars */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex items-center justify-between px-4 sm:px-12 opacity-25 filter blur-[0.4px]">
          {Array.from({ length: 42 }).map((_, i) => {
            const h = Math.sin((i / 42) * Math.PI) * 110 + 20;
            const delay = (i * 0.08).toFixed(2);
            return (
              <div
                key={i}
                className="w-[2px] sm:w-[3px] bg-[#382322] rounded-full"
                style={{
                  height: `${h}px`,
                  animation: `pulseGlow 4s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>

        {/* Tactile Pastel Color Fields in corners */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#B1C8EA]/30 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FFEBAA]/35 rounded-full blur-3xl" />
      </div>

      {/* ─── RIGHT VERTICAL EDITORIAL DOT INDICATOR ─── */}
      <aside
        aria-label="Section Indicator"
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3 pointer-events-auto"
      >
        {[
          { id: "hero", label: "Top" },
          { id: "ecosystem", label: "Ecosystem" },
          { id: "how-it-works", label: "Workflow" },
          { id: "software-studio", label: "Studio" },
          { id: "cta", label: "Join" },
          { id: "footer", label: "Credits" },
        ].map((item, idx) => (
          <button
            key={item.id}
            onClick={() => {
              const el = document.getElementById(item.id);
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label={`Jump to ${item.label}`}
            className={`w-2.5 rounded-full transition-all duration-300 cursor-pointer border border-[#382322] ${
              activeDot === idx
                ? "h-9 bg-[#FFEBAA] shadow-[2px_2px_0_#382322]"
                : "h-2.5 bg-[#FFF9F3] hover:bg-[#FFEBAA]"
            }`}
          />
        ))}
      </aside>

      {/* ─── HERO SECTION ─── */}
      <main id="hero" className="relative z-10 pt-28 sm:pt-36 pb-16 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* Step 1: Subtitle Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF9F3] border-2 border-[#382322] shadow-[2px_2px_0_#382322] mb-6">
          <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-xs font-bold tracking-wide text-[#382322]">
            Next-Gen Video Collaboration Platform
          </span>
          <span className="text-[11px] font-extrabold text-[#382322] bg-[#FFEBAA] px-2 py-0.5 rounded-full border border-[#382322]">
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
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-[#382322] font-display">
          Collabo<span className="text-[#382322]">.</span>
        </h1>

        {/* Step 4: Tagline with Italic Serif Accents */}
        <p className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#382322] font-display">
          Where <span className="italic font-serif underline decoration-[#B1C8EA] decoration-4 font-normal">ideas</span> meet{" "}
          <span className="italic font-serif underline decoration-[#FFEBAA] decoration-4 font-normal">editors.</span>
        </p>

        {/* Step 5: Subtitle Copy */}
        <div className="mt-4 max-w-xl text-sm sm:text-base text-[#382322]/80 font-medium leading-relaxed space-y-0.5">
          <p>Connect with skilled freelance video editors.</p>
          <p>Share your requirements, get matched, and bring your vision to life.</p>
        </div>

        {/* Handwritten Annotation Arrow */}
        <div className="hidden sm:flex items-center gap-2 mt-4 font-hand text-base font-bold text-[#382322] rotate-[-2deg]">
          <InkArrow color="#382322" />
          <span>find cinema-grade talent in minutes</span>
        </div>

        {/* Step 6: CTA Button "Login →" with Brutalist Paper Design & Magnetic Attraction */}
        <div className="mt-6 flex items-center justify-center">
          <Magnetic intensity={0.2} range={35}>
            <button
              onClick={() => navigate("/login")}
              className="group px-8 py-3.5 flex items-center gap-3 text-[#FFF9F3] text-[15px] font-extrabold bg-[#382322] hover:bg-[#261615] rounded-full border-2 border-[#382322] shadow-[4px_4px_0_#FFEBAA] hover:shadow-[2px_2px_0_#FFEBAA] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150 cursor-pointer"
            >
              <span>Login</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </Magnetic>
        </div>

        {/* ─── 5-CARD 3D HERO FANOUT SHOWCASE ─── */}
        <div className="w-full mt-4">
          <HeroCardsShowcase mousePos={mousePos} />
        </div>

        {/* ─── HOW IT WORKS PROCESS ROADMAP ─── */}
        <div id="how-it-works" className="w-full">
          <ProcessDock />
        </div>
      </main>

      {/* ─── WORKFLOW & FEATURE SHOWCASE SECTION ─── */}
      <section id="ecosystem" className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B1C8EA] border border-[#382322] shadow-[2px_2px_0_#382322] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#382322]" />
            <span className="font-mono text-[11px] font-bold text-[#382322] uppercase tracking-wider">
              The Production Ecosystem
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#382322] font-display tracking-tight mt-1">
            Built for modern <span className="italic font-serif">video storytellers</span>
          </h2>
          <div className="flex justify-center -mt-1 mb-3">
            <InkScribble color="#FFEBAA" />
          </div>
          <p className="text-[#382322]/80 mt-1 text-sm sm:text-base leading-relaxed">
            From raw clips to cinema-grade final masters. Everything creators and editors need in one seamless workspace.
          </p>
        </div>

        {/* Two-Column Feature Cards: For Creators vs For Editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Creator Card */}
          <div className="relative rounded-3xl p-8 bg-[#FFF9F3] border-2 border-[#382322] shadow-[5px_5px_0_#382322] transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[7px_7px_0_#382322]">
            {/* Corner Tape */}
            <div className="absolute -top-3 left-10 w-14 h-4 bg-[#FFEBAA] border border-[#382322]/40 rotate-[-2deg] pointer-events-none shadow-xs" />
            
            {/* Top Icon Badge */}
            <div className="w-13 h-13 rounded-2xl bg-[#FFEBAA] text-[#382322] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>

            <div className="inline-block text-xs font-mono font-extrabold text-[#382322] bg-[#FFEBAA] border border-[#382322] px-2.5 py-0.5 rounded-md mb-2 shadow-xs">
              For Creators
            </div>

            <h3 className="text-2xl font-extrabold text-[#382322] tracking-tight font-display">
              Post projects, hire top tier editors
            </h3>
            <p className="text-[#382322]/75 text-sm mt-2 leading-relaxed">
              Find proven talent for YouTube, Reels, TikTok, Podcasts, and Commercials. Track applications, review portfolios, and pay securely upon completion.
            </p>

            <div className="mt-6 pt-6 border-t-2 border-[#382322]/15 flex items-center justify-between">
              <button
                onClick={() => navigate("/login?role=creator")}
                className="group text-sm font-extrabold text-[#382322] hover:text-[#261615] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Explore Creator Portal</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
              <span className="text-xs font-mono font-bold text-[#382322]/60 bg-[#FDEBDE] px-2.5 py-1 rounded-md border border-[#382322]/20">
                8 active applications
              </span>
            </div>
          </div>

          {/* Editor Card */}
          <div className="relative rounded-3xl p-8 bg-[#FFF9F3] border-2 border-[#382322] shadow-[5px_5px_0_#382322] transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[7px_7px_0_#382322]">
            {/* Corner Tape */}
            <div className="absolute -top-3 right-10 w-14 h-4 bg-[#B1C8EA] border border-[#382322]/40 rotate-[3deg] pointer-events-none shadow-xs" />

            {/* Top Icon Badge */}
            <div className="w-13 h-13 rounded-2xl bg-[#B1C8EA] text-[#382322] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>

            <div className="inline-block text-xs font-mono font-extrabold text-[#382322] bg-[#B1C8EA] border border-[#382322] px-2.5 py-0.5 rounded-md mb-2 shadow-xs">
              For Editors
            </div>

            <h3 className="text-2xl font-extrabold text-[#382322] tracking-tight font-display">
              Find projects, edit freely, get paid
            </h3>
            <p className="text-[#382322]/75 text-sm mt-2 leading-relaxed">
              Showcase your DaVinci Resolve & Premiere Pro chops. Match with top creators offering competitive budgets and instant milestones.
            </p>

            <div className="mt-6 pt-6 border-t-2 border-[#382322]/15 flex items-center justify-between">
              <button
                onClick={() => navigate("/login?role=editor")}
                className="group text-sm font-extrabold text-[#382322] hover:text-[#261615] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Explore Editor Portal</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
              <span className="text-xs font-mono font-bold text-[#382322]/60 bg-[#FDEBDE] px-2.5 py-1 rounded-md border border-[#382322]/20">
                20+ available gigs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SURREAL COLLAGE & WORKSPACE STUDIO SECTION ─── */}
      <section id="software-studio" className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="relative rounded-3xl p-8 sm:p-12 bg-[#FFF9F3] border-2 border-[#382322] shadow-[6px_6px_0_#382322] overflow-hidden">
          {/* Subtle Wavy Lines Pattern strip in background */}
          <div
            className="absolute top-0 right-0 w-full sm:w-1/3 h-full opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${wavyLinesImg})`,
              backgroundSize: "cover",
            }}
          />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBAA] border border-[#382322] text-[#382322] font-mono text-[11px] font-bold uppercase tracking-wider mb-4 shadow-xs">
              <InkStar size={14} color="#382322" />
              <span>Studio Workstation</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#382322] font-display tracking-tight leading-tight">
              A studio workspace designed for <span className="italic font-serif">precision.</span>
            </h3>

            <p className="mt-3 text-[#382322]/80 text-sm sm:text-base leading-relaxed">
              Native integration with DaVinci Resolve color suites and Premiere Pro sequences. Track video revisions directly with frame-accurate timestamp notes and verified escrow milestones.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-[#FDEBDE] border-2 border-[#382322] text-xs font-extrabold text-[#382322] shadow-[2px_2px_0_#382322] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Frame-accurate Timestamps
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#B1C8EA]/50 border-2 border-[#382322] text-xs font-extrabold text-[#382322] shadow-[2px_2px_0_#382322] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Automated Escrow Releases
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] text-xs font-extrabold text-[#382322] shadow-[2px_2px_0_#382322] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Lossless 4K File Bin
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL STAMPED CTA BANNER ─── */}
      <section id="cta" className="relative z-10 max-w-4xl mx-auto px-6 py-12 pb-24 text-center">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-[#FFF9F3] border-2 border-[#382322] shadow-[6px_6px_0_#382322]">
          {/* Top Tape Sticker */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#FFEBAA] border border-[#382322]/50 rotate-[1deg] shadow-xs" />

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#382322] font-display tracking-tight">
            Where great cuts <span className="italic font-serif underline decoration-[#FFEBAA] decoration-4">begin.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#382322]/80 max-w-lg mx-auto leading-relaxed">
            Join hundreds of creators and elite video editors collaborating with confidence and artistic freedom.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Magnetic intensity={0.2} range={35}>
              <button
                onClick={() => navigate("/signup")}
                className="group px-7 py-3 text-sm font-extrabold text-[#FFF9F3] bg-[#382322] hover:bg-[#261615] rounded-full border-2 border-[#382322] shadow-[4px_4px_0_#FFEBAA] hover:shadow-[2px_2px_0_#FFEBAA] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Get Started Now</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </button>
            </Magnetic>

            <Magnetic intensity={0.2} range={35}>
              <button
                onClick={() => navigate("/login")}
                className="px-7 py-3 text-sm font-extrabold text-[#382322] bg-[#FFEBAA] hover:bg-[#FFF5D4] rounded-full border-2 border-[#382322] shadow-[4px_4px_0_#382322] hover:shadow-[2px_2px_0_#382322] transition-all cursor-pointer"
              >
                Sign In to Studio
              </button>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL FOOTER ─── */}
      <Footer />
    </div>
  );
}
