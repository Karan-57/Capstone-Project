import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, UserPlus, UploadCloud, CreditCard, X, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';

export const QuickActions = () => {
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  const actions = [
    {
      title: 'Create Project',
      desc: 'Post new gig with budget & brief',
      icon: PlusCircle,
      action: () => navigate('/creator/create-project'),
      color: 'from-purple-600/20 to-indigo-600/20 text-purple-300 border-purple-500/30 hover:border-purple-400',
      iconColor: 'text-purple-400',
    },
    {
      title: 'Invite Editor',
      desc: 'Browse verified video creators',
      icon: UserPlus,
      action: () => navigate('/creator/applications'),
      color: 'from-blue-600/20 to-cyan-600/20 text-blue-300 border-blue-500/30 hover:border-blue-400',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Upload Assets',
      desc: 'Sync B-Roll & raw 4K footage',
      icon: UploadCloud,
      action: () => {
        setUploadSuccess(false);
        setSelectedFileName('');
        setShowUploadModal(true);
      },
      color: 'from-emerald-600/20 to-teal-600/20 text-emerald-300 border-emerald-500/30 hover:border-emerald-400',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Release Payment',
      desc: 'Approve milestones & payout',
      icon: CreditCard,
      action: () => navigate('/creator/payments'),
      color: 'from-amber-600/20 to-orange-600/20 text-amber-300 border-amber-500/30 hover:border-amber-400',
      iconColor: 'text-amber-400',
    },
  ];

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setUploadSuccess(true);
    setTimeout(() => {
      setShowUploadModal(false);
      setUploadSuccess(false);
    }, 1200);
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-2">
        {actions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} border text-left transition-all duration-200 hover:-translate-y-0.5 group`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${item.iconColor} group-hover:scale-110 transition-transform`} />
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Quick</span>
              </div>
              <h4 className="text-sm font-semibold text-white group-hover:text-purple-200 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Upload Cloud Vault Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card p-6 border border-white/[0.1] shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-emerald-400" />
                  Cloud Asset Vault
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload raw A-roll, B-roll clips, audio stems, and project briefs for your editors
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Assets Uploaded Successfully!</h4>
                <p className="text-xs text-slate-400">Syncing with editor workspace...</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div
                  onClick={() => document.getElementById('vault-file-input')?.click()}
                  className="border-2 border-dashed border-emerald-500/30 rounded-2xl p-6 text-center bg-emerald-950/10 hover:border-emerald-400 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-9 h-9 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">
                    {selectedFileName || 'Click to browse footage or drag & drop files'}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Supports 4K/8K ProRes, MP4, WAV, ZIP up to 50GB per file
                  </span>
                  <input
                    id="vault-file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        setSelectedFileName(`${e.target.files.length} file(s) selected: ${e.target.files[0].name}`);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Target Project</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500">
                    <option>Tech Review: M3 MacBook Pro</option>
                    <option>Weekly Vlog: Tokyo Edition</option>
                    <option>Brand Deal: NordVPN Promo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Editor Instructions / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Raw clips are in LOG, please apply official Rec.709 LUT."
                    className="w-full px-3 py-2 rounded-xl bg-[#141A28] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    Sync to Vault
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
