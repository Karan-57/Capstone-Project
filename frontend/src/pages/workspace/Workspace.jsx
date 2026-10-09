import React, { useState, useRef } from 'react';
import {
  FolderGit2,
  UploadCloud,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  FileText,
  Paperclip,
  Send,
  Users,
  User,
  Search,
  Download,
  Layers,
  ChevronRight,
  ArrowLeft,
  X,
  Grid3X3,
} from 'lucide-react';
import { DEFAULT_PFP } from '../../constants/assets';

/* ─────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────── */
const mockWorkspaceProjects = [
  {
    id: 'proj-1',
    title: 'E-Commerce Brand Launch (4K Reel)',
    category: 'Commercial Video',
    badge: 'In Progress',
    badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    deadline: 'Oct 15, 2026',
    members: [
      { id: 'u1', name: 'Karan Sharma',  role: 'Creator / Director',  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', online: true },
      { id: 'u2', name: 'Alex Rivera',   role: 'Lead Video Editor',   avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', online: true },
      { id: 'u3', name: 'Elena Rostova', role: 'Colorist & VFX',      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', online: false },
    ],
    spaceFiles: [
      { id: 'f1', name: 'A-Roll_Interview_4K_ProRes.mov', size: '1.4 GB', type: 'video', date: '2h ago',      uploader: 'Karan' },
      { id: 'f2', name: 'Product_Macro_Shots.mp4',        size: '420 MB', type: 'video', date: '5h ago',      uploader: 'Alex'  },
      { id: 'f3', name: 'Master_Soundtrack_96kHz.wav',    size: '84 MB',  type: 'audio', date: 'Yesterday',   uploader: 'Elena' },
      { id: 'f4', name: 'Color_Grade_LUT_v2.cube',        size: '12 MB',  type: 'doc',   date: '2 days ago',  uploader: 'Elena' },
      { id: 'f5', name: 'Storyboard_Keyframes.png',       size: '18 MB',  type: 'image', date: '3 days ago',  uploader: 'Karan' },
    ],
    groupChat: [
      { id: 'gc-1', sender: 'Karan Sharma',  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', text: 'Hey team! Just uploaded the raw A-roll into Space.', time: '10:15 AM', attachment: null },
      { id: 'gc-2', sender: 'Alex Rivera',   avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', text: 'Got them! Footage looks crisp. Starting the assembly cut now.', time: '10:20 AM', attachment: null },
      { id: 'gc-3', sender: 'Alex Rivera',   avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', text: 'Here is the draft audio sync:', time: '10:45 AM', attachment: { name: 'Rough_Sync_Sample.mp3', size: '4.2 MB' } },
      { id: 'gc-4', sender: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', text: 'Balanced the contrast on LUT v2. Dropped in Space!', time: '11:02 AM', attachment: null },
    ],
    directChats: {
      u2: [
        { id: 'dc-1', sender: 'them', text: 'Hey, 9:16 or 16:9 for the main campaign cut?', time: '09:30 AM' },
        { id: 'dc-2', sender: 'me',   text: "16:9 master first, then 9:16 reels from best hooks!", time: '09:40 AM' },
      ],
      u3: [
        { id: 'dc-3', sender: 'them', text: 'Sent updated color palette notes. Let me know!', time: 'Yesterday' },
        { id: 'dc-4', sender: 'me',   text: 'Looks vibrant — matches our brand tone perfectly!', time: 'Yesterday' },
      ],
    },
  },
  {
    id: 'proj-2',
    title: 'YouTube 4K Documentary Cut',
    category: 'YouTube Production',
    badge: 'Review Stage',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    deadline: 'Oct 22, 2026',
    members: [
      { id: 'u1', name: 'Karan Sharma',    role: 'Producer',             avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', online: true },
      { id: 'u4', name: 'Sophia Martinez', role: 'Documentary Editor',   avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', online: true },
    ],
    spaceFiles: [
      { id: 'f21', name: 'Rough_Cut_v2_Watermarked.mp4', size: '2.1 GB', type: 'video', date: '1d ago', uploader: 'Sophia' },
      { id: 'f22', name: 'Archival_Footage_Pack.zip',    size: '850 MB', type: 'doc',   date: '3d ago', uploader: 'Karan'  },
    ],
    groupChat: [
      { id: 'gc-21', sender: 'Sophia Martinez', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', text: 'Uploaded Rough Cut v2 with ambient audio!', time: '2:15 PM', attachment: null },
    ],
    directChats: {
      u4: [
        { id: 'dc-21', sender: 'them', text: 'Pushed timestamped markers at 03:40 for chapter 2.', time: '2:30 PM' },
      ],
    },
  },
  {
    id: 'proj-3',
    title: 'SaaS Walkthrough & Kinetic Motion Graphics',
    category: 'Motion Design',
    badge: 'Asset Ingestion',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    deadline: 'Nov 02, 2026',
    members: [
      { id: 'u1', name: 'Karan Sharma', role: 'Client',                 avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', online: true },
      { id: 'u5', name: 'Devon Vance',  role: 'Motion Graphic Artist',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', online: false },
    ],
    spaceFiles: [
      { id: 'f31', name: 'Figma_SVG_Assets.zip', size: '45 MB', type: 'doc', date: 'Just now', uploader: 'Karan' },
    ],
    groupChat: [
      { id: 'gc-31', sender: 'Devon Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', text: 'Reviewing Figma SVGs now. Starting After Effects comp.', time: '1:00 PM', attachment: null },
    ],
    directChats: {
      u5: [
        { id: 'dc-31', sender: 'them', text: 'Got all vector assets. Will share a 10s preview by tomorrow.', time: '1:10 PM' },
      ],
    },
  },
];

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */
function FileIcon({ type }) {
  if (type === 'video') return <FileVideo className="w-4 h-4 text-rose-400" />;
  if (type === 'audio') return <FileAudio className="w-4 h-4 text-emerald-400" />;
  if (type === 'image') return <ImageIcon className="w-4 h-4 text-sky-400" />;
  return <FileText className="w-4 h-4 text-amber-400" />;
}

function FileRow({ file }) {
  return (
    <div className="p-3 rounded-xl bg-[#111625] border border-white/[0.06] hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[#182033] border border-white/5 flex items-center justify-center shrink-0">
          <FileIcon type={file.type} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">{file.name}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{file.size} · {file.uploader} · {file.date}</p>
        </div>
      </div>
      <button title="Download" className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white opacity-60 group-hover:opacity-100 transition-all">
        <Download className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CHAT PANEL (shared by Group & DM)
───────────────────────────────────────────────────── */
function ChatPanel({ title, subtitle, avatar, messages, onSend, onBack, attachFile }) {
  const [input, setInput] = useState('');
  const [localMsgs, setLocalMsgs] = useState(messages);
  const bottomRef = useRef(null);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const msg = { id: Date.now(), sender: 'me', text: input.trim(), time: 'Just now', attachment: null };
    setLocalMsgs((p) => [...p, msg]);
    onSend?.(msg);
    setInput('');
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleAttach = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const msg = {
      id: Date.now(),
      sender: 'me',
      text: '',
      time: 'Just now',
      attachment: { name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` },
    };
    setLocalMsgs((p) => [...p, msg]);
  };

  return (
    <div className="flex flex-col h-full bg-[#090C16]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] bg-[#0E1322] flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </button>
        {avatar
          ? <img
              src={avatar || DEFAULT_PFP}
              alt={title}
              onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
              className="w-8 h-8 rounded-full object-cover border border-white/10"
            />
          : <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400"><Users className="w-4 h-4" /></div>
        }
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localMsgs.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">No messages yet. Say hello! 👋</div>
        )}
        {localMsgs.map((msg) => {
          const isMe = msg.sender === 'me' || msg.sender === 'Karan Sharma' || msg.sender === 'You';
          return (
            <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && (
                <img
                  src={msg.avatar || avatar || DEFAULT_PFP}
                  alt={msg.sender}
                  onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                  className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
                />
              )}
              <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMe && <span className="text-[11px] font-semibold text-slate-400 px-1">{msg.sender}</span>}
                {msg.text && (
                  <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${isMe ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm' : 'bg-[#151C2C] text-slate-200 border border-white/[0.06] rounded-tl-sm'}`}>
                    {msg.text}
                  </div>
                )}
                {msg.attachment && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${isMe ? 'bg-indigo-700/40 border-indigo-500/30 text-white' : 'bg-[#151C2C] border-white/[0.06] text-slate-200'}`}>
                    <Paperclip className="w-3.5 h-3.5 shrink-0 text-purple-300" />
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{msg.attachment.name}</p>
                      <p className="text-[10px] opacity-70">{msg.attachment.size}</p>
                    </div>
                    <Download className="w-3 h-3 shrink-0 opacity-70 cursor-pointer hover:opacity-100" />
                  </div>
                )}
                <span className="text-[10px] text-slate-500 font-mono px-1">{msg.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={send} className="p-3 border-t border-white/[0.06] bg-[#0E1322] flex items-center gap-2 shrink-0">
        <label className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-colors" title="Attach file">
          <Paperclip className="w-4 h-4" />
          <input type="file" className="hidden" onChange={handleAttach} />
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message..."
          className="flex-1 px-4 py-2 text-xs rounded-xl bg-[#151C2C] text-slate-100 border border-white/[0.07] focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   ALL FILES MEDIA GALLERY (WhatsApp-style grid)
───────────────────────────────────────────────────── */
function MediaGallery({ files, onClose }) {
  const typeLabel = { video: 'Videos', audio: 'Audio', image: 'Images', doc: 'Docs' };

  const grouped = files.reduce((acc, f) => {
    acc[f.type] = acc[f.type] || [];
    acc[f.type].push(f);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-[#090C16]">
      <div className="px-4 py-3 border-b border-white/[0.06] bg-[#0E1322] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Grid3X3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Project Media</p>
            <p className="text-[11px] text-slate-400">{files.length} total files</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.entries(grouped).map(([type, group]) => (
          <div key={type}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{typeLabel[type] || type}</p>
            <div className="grid grid-cols-1 gap-2">
              {group.map((file) => (
                <div
                  key={file.id}
                  className="p-3 rounded-xl bg-[#111625] border border-white/[0.06] hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#182033] border border-white/5 flex items-center justify-center shrink-0">
                      <FileIcon type={file.type} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">{file.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{file.size} · {file.uploader} · {file.date}</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white opacity-60 group-hover:opacity-100 transition-all">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PROJECT WORKSPACE (Right Panel)
───────────────────────────────────────────────────── */
function ProjectWorkspace({ project, onBack }) {
  const [projects, setProjects] = useState([project]);
  const currentProject = projects.find((p) => p.id === project.id) || project;

  // Space drag-drop
  const [isDraggingOverSpace, setIsDraggingOverSpace] = useState(false);
  const fileInputRef = useRef(null);

  // Media gallery / recent files
  const [showAllMedia, setShowAllMedia] = useState(false);

  // Chat views: null | 'group' | memberId
  const [chatView, setChatView] = useState(null);

  /* File upload handler */
  const handleUploadFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    Array.from(fileList).forEach((file, idx) => {
      const newFile = {
        id: `f-${Date.now()}-${idx}`,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : file.type.startsWith('image') ? 'image' : 'doc',
        date: 'Just now',
        uploader: 'You',
      };
      setProjects((prev) =>
        prev.map((p) =>
          p.id === currentProject.id ? { ...p, spaceFiles: [newFile, ...p.spaceFiles] } : p
        )
      );
    });
  };

  const recentFiles = currentProject.spaceFiles.slice(0, 3);

  // CHAT VIEW — Group
  if (chatView === 'group') {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <ChatPanel
          title={`${currentProject.title} — Team Group`}
          subtitle={`${currentProject.members.length} members`}
          avatar={null}
          messages={currentProject.groupChat}
          onBack={() => setChatView(null)}
        />
      </div>
    );
  }

  // CHAT VIEW — DM with a member
  if (chatView && chatView !== 'group') {
    const member = currentProject.members.find((m) => m.id === chatView);
    const dms = currentProject.directChats?.[chatView] || [];
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <ChatPanel
          title={member?.name || 'Team Member'}
          subtitle={member?.role}
          avatar={member?.avatar}
          messages={dms}
          onBack={() => setChatView(null)}
        />
      </div>
    );
  }

  // MEDIA GALLERY VIEW
  if (showAllMedia) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <MediaGallery files={currentProject.spaceFiles} onClose={() => setShowAllMedia(false)} />
      </div>
    );
  }

  // ── DEFAULT PROJECT VIEW ──
  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#09090E]">
      {/* Header */}
      <header className="px-5 py-4 border-b border-white/[0.06] bg-[#0C101C]/90 backdrop-blur-md flex items-center gap-3 shrink-0 sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer lg:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
          <FolderGit2 className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-sm font-bold text-white truncate">{currentProject.title}</h1>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${currentProject.badgeColor}`}>
              {currentProject.badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
            <span>{currentProject.category}</span>
            <span>·</span>
            <span>Due {currentProject.deadline}</span>
            <span>·</span>
            <span className="text-purple-300">{currentProject.members.map((m) => m.name.split(' ')[0]).join(', ')}</span>
          </p>
        </div>
      </header>

      <div className="p-5 space-y-7">

        {/* ── SECTION 1: SPACE (Drop Zone) ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              Space <span className="text-xs font-normal text-slate-400">— Project Media & Assets</span>
            </h3>
          </div>

          {/* Hidden input */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            className="hidden"
            onChange={(e) => handleUploadFiles(e.target.files)}
          />

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOverSpace(true); }}
            onDragLeave={() => setIsDraggingOverSpace(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOverSpace(false);
              if (e.dataTransfer.files?.length > 0) handleUploadFiles(e.dataTransfer.files);
            }}
            onPaste={(e) => {
              if (e.clipboardData.files?.length > 0) handleUploadFiles(e.clipboardData.files);
            }}
            tabIndex={0}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 outline-none select-none ${
              isDraggingOverSpace
                ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
                : 'border-white/10 hover:border-purple-500/40 bg-[#0E1322]/80 hover:bg-[#10152A]'
            }`}
          >
            <div className="flex flex-col items-center max-w-xs mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/25 to-indigo-600/25 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3.5 shadow-lg shadow-purple-900/20">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {isDraggingOverSpace ? 'Drop to upload into Space' : 'Drop files here to add to Space'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supports MP4, ProRes, WAV, LUTs, PNGs and more. Files are instantly shared with the whole team.
              </p>
              <div className="flex items-center gap-2 mt-3 text-[11px] text-purple-400 font-medium flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer"
                >
                  Browse Files
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">⌘V / Ctrl+V</span>
              </div>
            </div>
          </div>

          {/* Recent 3 Files */}
          {currentProject.spaceFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {recentFiles.map((file) => <FileRow key={file.id} file={file} />)}

              {currentProject.spaceFiles.length > 3 && (
                <button
                  onClick={() => setShowAllMedia(true)}
                  className="w-full py-2.5 text-xs font-semibold text-purple-400 hover:text-purple-300 border border-white/[0.06] hover:border-purple-500/30 rounded-xl bg-[#0E1322] hover:bg-[#11182A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  View all {currentProject.spaceFiles.length} files
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </section>

        {/* ── SECTION 2: GROUP CHAT (Instagram DM row) ── */}
        <section>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            Team Group
          </h3>

          <div
            onClick={() => setChatView('group')}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-purple-500/30 cursor-pointer transition-all group"
          >
            {/* Group avatar */}
            <div className="relative w-11 h-11 shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-600/40 to-indigo-600/40 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Users className="w-5 h-5" />
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0E1322] absolute bottom-0 right-0 shadow-[0_0_6px_#34D399]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  {currentProject.title} — Team
                </p>
                <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                  {currentProject.groupChat[currentProject.groupChat.length - 1]?.time || ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                {currentProject.groupChat[currentProject.groupChat.length - 1]?.text || 'No messages yet'}
              </p>
              <p className="text-[11px] text-purple-400 mt-0.5">{currentProject.members.length} members</p>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 shrink-0 transition-colors" />
          </div>
        </section>

        {/* ── SECTION 3: ONE-ON-ONE DM LIST ── */}
        <section>
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Team Members
          </h3>

          <div className="space-y-2">
            {currentProject.members.map((member) => {
              const lastMsg = (currentProject.directChats?.[member.id] || []).slice(-1)[0];
              return (
                <div
                  key={member.id}
                  onClick={() => setChatView(member.id)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-indigo-500/30 cursor-pointer transition-all group"
                >
                  <div className="relative w-11 h-11 shrink-0">
                    <img
                      src={member.avatar || DEFAULT_PFP}
                      alt={member.name}
                      onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                      className="w-full h-full rounded-full object-cover border border-white/10"
                    />
                    {member.online && (
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0E1322] absolute bottom-0 right-0 shadow-[0_0_6px_#34D399]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {member.name}
                      </p>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{lastMsg.time}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-purple-400 font-medium">{member.role}</p>
                    {lastMsg && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {lastMsg.sender === 'me' ? 'You: ' : ''}{lastMsg.text}
                      </p>
                    )}
                    {!lastMsg && (
                      <p className="text-xs text-slate-500 mt-0.5">Tap to start a private chat</p>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </main>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN WORKSPACE PAGE
───────────────────────────────────────────────────── */
export const Workspace = ({ role = 'creator' }) => {
  const [projects] = useState(mockWorkspaceProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(null); // 1. No project open by default
  const [searchQuery, setSearchQuery] = useState('');

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#07090E]">

      {/* ── LEFT: PROJECTS LIST ── */}
      <aside
        className={`${selectedProjectId ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 xl:w-96 border-r border-white/[0.07] bg-[#07090F] flex-col shrink-0`}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06] bg-[#0B0E18]/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Workspace</h2>
                <p className="text-[11px] text-slate-400">Ongoing team productions</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[11px] font-semibold font-mono rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {projects.length} Active
            </span>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#141A28] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500 placeholder:text-slate-500 transition-all"
            />
          </div>
        </div>

        {/* Project rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
          {filtered.map((p) => {
            const isSelected = p.id === selectedProjectId;
            const lastGroupMsg = p.groupChat[p.groupChat.length - 1];
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition-all ${
                  isSelected ? 'bg-purple-950/30 border-l-4 border-purple-500' : 'hover:bg-white/[0.025] border-l-4 border-transparent'
                }`}
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <FolderGit2 className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <p className="text-xs font-bold text-white truncate leading-snug">{p.title}</p>
                    {lastGroupMsg && (
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 mt-0.5">{lastGroupMsg.time}</span>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block ${p.badgeColor}`}>
                    {p.badge}
                  </span>
                  {lastGroupMsg && (
                    <p className="text-[11px] text-slate-400 truncate mt-1">{lastGroupMsg.text}</p>
                  )}
                  {/* Avatars */}
                  <div className="flex items-center gap-1 mt-1.5">
                    {p.members.slice(0, 3).map((m) => (
                      <img
                        key={m.id}
                        src={m.avatar || DEFAULT_PFP}
                        alt={m.name}
                        title={m.name}
                        onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                        className="w-4 h-4 rounded-full border border-[#07090F] object-cover ring-1 ring-white/10"
                      />
                    ))}
                    <span className="text-[10px] text-slate-500 ml-1">{p.members.length} members</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── RIGHT: PROJECT WORKSPACE or EMPTY STATE ── */}
      {selectedProject ? (
        <ProjectWorkspace
          key={selectedProject.id}
          project={selectedProject}
          onBack={() => setSelectedProjectId(null)}
        />
      ) : (
        <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-center bg-[#0A0D15]/80 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Select a Project</h3>
            <p className="text-sm text-slate-400 mt-1">Click any ongoing project from the left to open its workspace.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Workspace;
