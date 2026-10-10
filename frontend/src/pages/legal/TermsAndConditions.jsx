import React from 'react';
import { ArrowLeft, CheckCircle2, ShieldAlert, Award, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import SEO from '../../components/common/SEO';
import Button from '../../components/common/Button';

export const TermsAndConditions = () => {
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
        title="Terms & Conditions"
        description="Collabo user agreement, milestone approvals, delivery policies, and freelancer code of conduct."
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

      {/* Content */}
      <main className="max-w-3xl mx-auto px-5 pt-10 space-y-8">
        <div className="space-y-2 border-b border-white/[0.06] pb-6">
          <span className="text-xs uppercase font-bold tracking-wider text-purple-400">User Agreement</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms and Conditions</h1>
          <p className="text-xs text-slate-400">Effective Date: October 10, 2026 · Collabo Marketplace</p>
        </div>

        <section className="space-y-3.5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
            1. Acceptance of Terms
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            By creating an account, browsing open gigs, posting video production briefs, or submitting project proposals on Collabo, you agree to be bound by these Terms and Conditions and our Privacy Policy.
          </p>
        </section>

        <section className="space-y-3.5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            2. Escrow Funding & Milestone Release
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Creators agree that upon accepting an editor's proposal, funds for the agreed bid are secured in project escrow. Once a final cut delivery is approved by the creator, escrow is automatically disbursed to the editor's available balance. Revisions must be requested within 14 calendar days of delivery cut submission.
          </p>
        </section>

        <section className="space-y-3.5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            3. Intellectual Property Rights & Showreels
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upon final payment clearance, all final deliverable video copyrights transfer to the Creator. Freelance editors retain the limited right to showcase snippets of completed cuts in their personal portfolios and showreels, unless a mutual Non-Disclosure Agreement (NDA) was explicitly stipulated in the brief.
          </p>
        </section>

        <section className="space-y-3.5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            4. Prohibited Conduct
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Users may not attempt to extract private API credentials, execute SQL or NoSQL injections, transmit malware via workspace assets, bypass platform escrow for off-platform payment circumvention, or upload copyrighted material without appropriate licensing.
          </p>
        </section>

        <section className="space-y-3.5 border-t border-white/[0.06] pt-6">
          <h2 className="text-base font-bold text-white">5. Governing Law & Inquiries</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Questions regarding these Terms may be directed to our operations desk at{' '}
            <a href="mailto:legal@collabo.app" className="text-purple-400 hover:underline">
              legal@collabo.app
            </a>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermsAndConditions;
