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

      {/* Content */}
      <main className="max-w-3xl mx-auto px-5 pt-10 space-y-8">
        <div className="space-y-2 border-b border-white/[0.06] pb-6">
          <span className="text-xs uppercase font-bold tracking-wider text-purple-400">Legal Agreement</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Effective Date: October 10, 2026 · Last Updated</p>
        </div>

        <section className="space-y-3.5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            1. Information We Collect
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            When you register on Collabo as a Creator or Editor, we collect basic profile details including your full name, email address, username, profile photo, and bio. For editors, we also record professional portfolio links, verified software tools, and client feedback ratings.
          </p>
        </section>

        <section className="space-y-3.5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            2. Video Assets & Workspace Confidentiality
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            All raw video footage, audio stems, project briefs, and draft deliverables uploaded to workspace Space are stored securely in isolated ImageKit storage partitions. Only authorized participants assigned to the project workspace have read or write access to these assets. Collabo will never monetize, train external foundation models on, or publicly distribute your private footage without explicit written consent.
          </p>
        </section>

        <section className="space-y-3.5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            3. AI Service Data Usage
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our AI assistance features (Budget suggestions, Candidate ranking, and Pitch generation) transmit minimal contextual metadata (category, required tools, brief description) to our inference provider strictly for live response formatting. User prompts are sanitized to remove sensitive personal identifiers prior to inference.
          </p>
        </section>

        <section className="space-y-3.5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            4. Escrow & Payment Security
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Escrow deposits and editor payouts are managed using industry-standard encrypted banking integrations. Sensitive payment card credentials are never saved onto Collabo's primary application databases.
          </p>
        </section>

        <section className="space-y-3.5 border-t border-white/[0.06] pt-6">
          <h2 className="text-base font-bold text-white">5. Contact Our Privacy Office</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            If you have questions regarding data retention, account deletion, or asset privacy, please reach out directly to{' '}
            <a href="mailto:privacy@collabo.app" className="text-purple-400 hover:underline">
              privacy@collabo.app
            </a>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
