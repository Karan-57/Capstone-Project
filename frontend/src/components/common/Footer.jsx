import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import CollaboLogo from '../landing/CollaboLogo';

export const Footer = ({ className = '' }) => {
  return (
    <footer className={`mt-12 pt-8 border-t-2 border-[#382322]/15 dark:border-[#FDEBDE]/15 text-xs text-[#5C3A38] dark:text-[#D4B8A8] space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 group select-none">
            <CollaboLogo size={28} variant="isometric" animated={true} />
            <span className="font-serif font-black tracking-tight text-[#261615] dark:text-[#FDEBDE] text-base flex items-center">
              Collabo<span className="text-[#8A5200] dark:text-[#FFEBAA]">.</span>
            </span>
          </Link>
          <span className="hidden sm:inline text-[#382322]/30 dark:text-[#FDEBDE]/30">|</span>
          <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] font-sans">
            Intelligent Video Production & Escrow Platform
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5 text-[11px] font-mono font-bold">
          <Link to="/privacy" className="hover:text-[#261615] dark:hover:text-[#FFEBAA] hover:underline decoration-[#FFEBAA] transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-[#261615] dark:hover:text-[#FFEBAA] hover:underline decoration-[#FFEBAA] transition-colors">
            Terms & Conditions
          </Link>
          <a
            href="mailto:support@collabo.app"
            className="hover:text-[#261615] dark:hover:text-[#FFEBAA] hover:underline decoration-[#FFEBAA] transition-colors flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA]" />
            <span>support@collabo.app</span>
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-[#5C3A38]/70 dark:text-[#D4B8A8]/70 pt-4 border-t border-[#382322]/10 dark:border-[#FDEBDE]/10 font-mono">
        <p>© 2026 Collabo Technologies. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Designed for video creators & editors worldwide <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 inline" />
        </p>
      </div>
    </footer>
  );
};

export default Footer;
