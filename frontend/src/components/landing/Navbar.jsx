import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CollaboLogo from "./CollaboLogo";

export default function Navbar({ activeTab = "Home", onTabChange }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: "Home", label: "Home" },
    { id: "Clients", label: "For Clients" },
    { id: "Editors", label: "For Editors" },
    { id: "HowItWorks", label: "How it works" },
  ];

  const handleTabClick = (tabId) => {
    setMobileMenuOpen(false);
    if (tabId === "Clients") {
      navigate('/login?role=creator');
    } else if (tabId === "Editors") {
      navigate('/login?role=editor');
    } else if (tabId === "HowItWorks") {
      if (window.location.pathname === '/') {
        const el = document.getElementById("how-it-works");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById("how-it-works");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 120);
      }
    } else if (tabId === "Home") {
      if (window.location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      onTabChange?.("Home");
    } else {
      onTabChange?.(tabId);
    }
  };

  return (
    <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto flex items-center justify-between gap-2 px-3 py-1.5 rounded-full bg-[#FFF9F3]/95 border-2 border-[#382322] shadow-[3px_3px_0_#382322] backdrop-blur-md transition-all duration-300 max-w-4xl"
      >
        {/* Brand Mark */}
        <button
          onClick={() => handleTabClick("Home")}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#FDEBDE]/60 transition-colors cursor-pointer group"
          aria-label="Collabo Home"
        >
          <CollaboLogo size={26} variant="isometric" animated={true} />
          <span className="font-extrabold text-sm tracking-tight text-[#382322] font-display hidden sm:inline">
            Collabo<span className="text-[#382322]">.</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 rounded-full select-none cursor-pointer ${
                  isActive
                    ? "bg-[#FFEBAA] text-[#382322] font-bold border border-[#382322]/40 shadow-[1px_1px_0_#382322]"
                    : "text-[#382322]/75 hover:text-[#382322] hover:bg-[#FDEBDE]/70"
                }`}
              >
                {tab.label}
                {isActive && <span className="sr-only">(current page)</span>}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Dedicated Sign In Button */}
          <button
            onClick={() => navigate('/login')}
            className="group px-4 py-1.5 text-[13px] font-bold text-[#FFF9F3] bg-[#382322] hover:bg-[#261615] rounded-full border border-[#382322] shadow-[2px_2px_0_#FFEBAA] hover:shadow-[1px_1px_0_#FFEBAA] hover:translate-x-0.5 transition-all duration-150 cursor-pointer flex items-center gap-1.5"
          >
            <span>Sign In</span>
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-full text-[#382322] hover:bg-[#FDEBDE] border border-[#382322]/20 transition-colors cursor-pointer"
            aria-label="Toggle mobile navigation"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 left-4 right-4 z-50 pointer-events-auto p-4 rounded-2xl bg-[#FFF9F3] border-2 border-[#382322] shadow-[4px_4px_0_#382322] flex flex-col gap-2 animate-fadeIn">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FFEBAA] text-[#382322] border border-[#382322]/30"
                    : "text-[#382322]/80 hover:bg-[#FDEBDE] hover:text-[#382322]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-[#382322]/15 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="flex-1 py-2 text-center text-sm font-bold text-[#FFF9F3] bg-[#382322] rounded-xl border border-[#382322] shadow-[2px_2px_0_#FFEBAA]"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/signup');
              }}
              className="flex-1 py-2 text-center text-sm font-bold text-[#382322] bg-[#FFEBAA] rounded-xl border border-[#382322] shadow-[2px_2px_0_#382322]"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
