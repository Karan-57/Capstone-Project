import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Heart } from 'lucide-react';
import Logo from './Logo';

export const Footer = ({ className = '' }) => {
  return (
    <footer className={`mt-12 pt-8 border-t border-white/[0.06] text-xs text-slate-400 space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo size="sm" showText={true} />
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-[11px] text-slate-500">
            Intelligent Video Production & Escrow Platform
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 text-[11px]">
          <Link to="/about" className="hover:text-purple-300 transition-colors">
            About
          </Link>
          <Link to="/privacy" className="hover:text-purple-300 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-purple-300 transition-colors">
            Terms & Conditions
          </Link>
          <a
            href="mailto:support@collabo.app"
            className="hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            support@collabo.app
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 pt-4 border-t border-white/[0.03]">
        <p>© 2026 Collabo Technologies. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed for video creators & editors worldwide <ShieldCheck className="w-3 h-3 text-emerald-400 inline" />
        </p>
      </div>
    </footer>
  );
};

export default Footer;
