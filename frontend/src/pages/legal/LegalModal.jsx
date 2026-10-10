import React from 'react';
import { X, CheckCircle2, DollarSign, Award, ShieldAlert, Shield, Lock, Eye, FileText, ExternalLink } from 'lucide-react';

export default function LegalModal({ type, isOpen, onClose, onAccept, role = 'creator' }) {
  if (!isOpen || !type) return null;

  const isTerms = type === 'terms';
  const isCreator = role === 'creator';
  const accentColor = isCreator ? 'purple' : 'blue';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isCreator ? 'text-purple-600' : 'text-blue-600'
              }`}
            >
              {isTerms ? 'User Agreement' : 'Data Protection'}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              {isTerms ? 'Terms and Conditions' : 'Privacy Policy'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Effective Date: October 10, 2026 · Collabo Video Collaboration Platform
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          {isTerms ? (
            <>
              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  1. Acceptance of Terms
                </h3>
                <p>
                  By creating an account, browsing open gigs, posting video production briefs, or submitting project
                  proposals on Collabo, you agree to be bound by these Terms and Conditions and our Privacy Policy.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                  2. Escrow Funding & Milestone Release
                </h3>
                <p>
                  Creators agree that upon accepting an editor's proposal, funds for the agreed bid are secured in
                  project escrow. Once a final cut delivery is approved by the creator, escrow is automatically
                  disbursed to the editor's available balance. Revisions must be requested within 14 calendar days of
                  delivery cut submission.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                  3. Intellectual Property Rights & Showreels
                </h3>
                <p>
                  Upon final payment clearance, all final deliverable video copyrights transfer to the Creator.
                  Freelance editors retain the limited right to showcase snippets of completed cuts in their personal
                  portfolios and showreels, unless a mutual Non-Disclosure Agreement (NDA) was explicitly stipulated in
                  the brief.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  4. Prohibited Conduct
                </h3>
                <p>
                  Users may not attempt to extract private API credentials, execute SQL or NoSQL injections, transmit
                  malware via workspace assets, bypass platform escrow for off-platform payment circumvention, or
                  upload copyrighted material without appropriate licensing.
                </p>
              </section>

              <section className="space-y-1.5 border-t border-slate-100 pt-3 text-slate-500">
                <h4 className="font-semibold text-slate-700">5. Governing Law & Inquiries</h4>
                <p>
                  Questions regarding these Terms may be directed to our operations desk at{' '}
                  <a href="mailto:legal@collabo.app" className="text-purple-600 font-medium hover:underline">
                    legal@collabo.app
                  </a>.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                  1. Information We Collect
                </h3>
                <p>
                  When you register on Collabo as a Creator or Editor, we collect basic profile details including your
                  full name, email address, username, profile photo, and bio. For editors, we also record professional
                  portfolio links, verified software tools, and client feedback ratings.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                  2. Video Assets & Workspace Confidentiality
                </h3>
                <p>
                  All raw video footage, audio stems, project briefs, and draft deliverables uploaded to workspace
                  Space are stored securely in isolated ImageKit storage partitions. Only authorized participants
                  assigned to the project workspace have read or write access to these assets. Collabo will never
                  monetize, train external foundation models on, or publicly distribute your private footage without
                  explicit written consent.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                  3. AI Service Data Usage
                </h3>
                <p>
                  Our AI assistance features (Budget suggestions, Candidate ranking, and Pitch generation) transmit
                  minimal contextual metadata (category, required tools, brief description) to our inference provider
                  strictly for live response formatting. User prompts are sanitized to remove sensitive personal
                  identifiers prior to inference.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                  4. Escrow & Payment Security
                </h3>
                <p>
                  Escrow deposits and editor payouts are managed using industry-standard encrypted banking
                  integrations. Sensitive payment card credentials are never saved onto Collabo's primary application
                  databases.
                </p>
              </section>

              <section className="space-y-1.5 border-t border-slate-100 pt-3 text-slate-500">
                <h4 className="font-semibold text-slate-700">5. Contact Our Privacy Office</h4>
                <p>
                  If you have questions regarding data retention, account deletion, or asset privacy, please reach out
                  directly to{' '}
                  <a href="mailto:privacy@collabo.app" className="text-purple-600 font-medium hover:underline">
                    privacy@collabo.app
                  </a>.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <a
            href={isTerms ? '/terms' : '/privacy'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Open in full tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Close
            </button>
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow transition-all duration-200 cursor-pointer ${
                  isCreator
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                }`}
              >
                I Accept & Agree
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
