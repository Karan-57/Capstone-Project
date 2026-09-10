import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ activeTab = "Home", onTabChange }) {
  const navigate = useNavigate();

  const tabs = [
    { id: "Home", label: "Home" },
    { id: "Clients", label: "For Clients" },
    { id: "Editors", label: "For Editors" },
    { id: "HowItWorks", label: "How it works" },
    { id: "About", label: "About us" },
  ];

  const handleTabClick = (tabId) => {
    if (tabId === "Clients") {
      navigate('/login?role=creator');
    } else if (tabId === "Editors") {
      navigate('/login?role=editor');
    } else if (tabId === "About") {
      navigate('/about');
    } else if (tabId === "HowItWorks") {
      if (window.location.pathname === '/') {
        const el = document.getElementById("how-it-works");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById("how-it-works");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
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
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto flex items-center gap-1.5 px-2 py-1.5 rounded-full glass-pill border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.1)]"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative px-4 py-1.5 text-[13.5px] font-medium transition-all duration-300 rounded-full select-none cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-semibold"
                  : "text-slate-600 hover:text-slate-950 hover:bg-white/40"
              }`}
            >
              {tab.label}
              {isActive && <span className="sr-only">(current page)</span>}
            </button>
          );
        })}

        {/* Dedicated Sign In Pill Button */}
        <button
          onClick={() => navigate('/login')}
          className="ml-1 px-4 py-1.5 text-[13px] font-semibold text-white bg-slate-900 hover:bg-purple-600 rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
        >
          Sign In
        </button>
      </nav>
    </header>
  );
}
