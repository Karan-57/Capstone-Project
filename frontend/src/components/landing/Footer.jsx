import React from "react";
import { Link } from "react-router-dom";
import CollaboLogo from "./CollaboLogo";
import wavyLinesImg from "../../assets/images/wavy-lines.jpg";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t-2 border-[#382322] bg-[#FFF9F3] text-[#382322]">
      {/* Decorative Wavy Lines Strip along top */}
      <div
        className="w-full h-3 border-b border-[#382322]/20 opacity-80"
        style={{
          backgroundImage: `url(${wavyLinesImg})`,
          backgroundSize: "200px auto",
          backgroundRepeat: "repeat-x",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-14 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2.5">
              <CollaboLogo size={32} variant="isometric" animated={false} />
              <span className="font-display text-xl font-extrabold text-[#382322] tracking-tight">
                Collabo<span className="text-[#382322]">.</span>
              </span>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-[#382322]/75 max-w-[240px] leading-relaxed">
              Next-generation video production ecosystem connecting top creators and editors through verified milestones.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFEBAA] text-[#382322] text-xs font-bold border border-[#382322] shadow-[1px_1px_0_#382322]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              v2.0 Production
            </div>
          </div>

          {/* Portals */}
          <div>
            <p className="text-xs font-extrabold text-[#382322] uppercase tracking-wider mb-3 font-mono">
              Portals
            </p>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link to="/login?role=creator" className="text-[#382322]/80 hover:text-[#382322] hover:underline transition-colors">
                  Creator Space
                </Link>
              </li>
              <li>
                <Link to="/login?role=editor" className="text-[#382322]/80 hover:text-[#382322] hover:underline transition-colors">
                  Editor Pro Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-[#382322]/80 hover:text-[#382322] hover:underline transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-[#382322]/80 hover:text-[#382322] hover:underline transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <p className="text-xs font-extrabold text-[#382322] uppercase tracking-wider mb-3 font-mono">
              Ecosystem
            </p>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <Link to="/" className="text-[#382322]/80 hover:text-[#382322] hover:underline transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="text-[#382322]/80 hover:text-[#382322] hover:underline transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#382322]/80 hover:text-[#382322] hover:underline transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#382322]/80 hover:text-[#382322] hover:underline transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Info & Contact */}
          <div>
            <p className="text-xs font-extrabold text-[#382322] uppercase tracking-wider mb-3 font-mono">
              Studio & Contact
            </p>
            <p className="text-xs text-[#382322]/75 leading-relaxed">
              Engineering Capstone Project. For inquiries, email:{" "}
              <a href="mailto:support@collabo.app" className="text-[#382322] font-bold underline decoration-[#FFEBAA] decoration-2 hover:text-[#261615]">
                support@collabo.app
              </a>
            </p>
            <div className="mt-3 p-3 rounded-xl bg-[#FDEBDE] border border-[#382322]/30 text-[11px] text-[#382322]">
              <span className="font-bold">Collabo Engine:</span> Automated Milestone Escrow, Frame-accurate Reviews & Portfolio AI.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#382322]/20 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs text-[#382322]/70 font-medium">
          <span>© {new Date().getFullYear()} Collabo Inc. Capstone Project. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[#382322] transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-[#382322] transition-colors">Terms</Link>
            <span>•</span>
            <span className="font-bold text-[#382322]">DIPEX Exhibition Build</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
