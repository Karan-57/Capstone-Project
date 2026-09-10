import React from "react";
import { Link } from "react-router-dom";
import CollaboLogo from "./CollaboLogo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <CollaboLogo size={30} variant="isometric" animated={false} />
              <span className="font-display text-lg font-bold text-slate-900 tracking-tight">
                Collabo.
              </span>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 max-w-[240px] leading-relaxed">
              Next-generation video production ecosystem connecting top creators and editors.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Portals</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login?role=creator" className="text-slate-600 hover:text-purple-600 transition-colors">
                  Creator Space
                </Link>
              </li>
              <li>
                <Link to="/login?role=editor" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Editor Pro Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ecosystem</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-600 hover:text-slate-950 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 hover:text-purple-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="text-slate-600 hover:text-slate-950 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Engineering Capstone Project. Designed for seamless freelance creative workflows and real-time review.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
              v2.0 Production
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row gap-3 justify-between text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Collabo Inc. Capstone Project. All rights reserved.</span>
          <span>DIPEX Exhibition Build</span>
        </div>
      </div>
    </footer>
  );
}
