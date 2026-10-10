import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import SEO from '../../components/common/SEO';
import Button from '../../components/common/Button';

export const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-300 pb-16">
      <SEO
        title="Privacy Policy"
        description="Collabo's commitment to protecting creator media assets, personal information, and escrow transactions."
      />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0A0D15]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Logo size="md" />
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={handleBack}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            Back
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-5 pt-10 pb-8 border-b border-white/[0.06]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>Security & Data Protection</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Collabo Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">
          Last updated: October 10, 2026 • Effective immediately for all registered creators & editors.
        </p>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-5 py-8 space-y-8 text-xs sm:text-sm leading-relaxed text-slate-300">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            1. Information We Collect
          </h2>
          <p>
            When you register as a Creator or Editor on Collabo, we collect information necessary to deliver collaborative editing workflows:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li><strong className="text-slate-200">Account Credentials:</strong> Full name, verified email address, role, and profile media.</li>
            <li><strong className="text-slate-200">Production Media Assets:</strong> Raw footage, timeline markers, audio tracks, and revision cuts uploaded to Workspace storage.</li>
            <li><strong className="text-slate-200">Escrow & Milestone Transactions:</strong> Project budgets, milestone states, and payment releases.</li>
            <li><strong className="text-slate-200">Collaboration Communication:</strong> Team chat messages, timestamps, and delivery changelogs.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-400" />
            2. How We Protect Your Media
          </h2>
          <p>
            Your intellectual property is sacred. All media files uploaded to Workspace storage are encrypted in transit via TLS 1.3 and at rest with AES-256 encryption. Only authorized project members (the hiring Creator and assigned Editors) are granted signed access tokens to stream or download project footage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            3. Financial & Escrow Data Protection
          </h2>
          <p>
            Payment transactions and security PINs are processed using zero-trust financial architecture. Your 4-digit Security PIN is cryptographically hashed with bcrypt and never stored in plain text. Card details and banking credentials are handled strictly through certified PCI-DSS compliant payment gateways (Razorpay).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">4. Contact Privacy Operations</h2>
          <p className="text-slate-400">
            If you have questions regarding your data or wish to request data deletion, contact our security team at{' '}
            <a href="mailto:privacy@collabo.io" className="text-purple-400 hover:text-purple-300 underline">
              privacy@collabo.io
            </a>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
