import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Trash2,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Star,
  Video,
  RefreshCw,
  Play,
} from 'lucide-react';
import { DEFAULT_PFP } from '../../constants/assets';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import SEO from '../../components/common/SEO';
import api from '../../services/api';

/* ─────────────────────────────────────────────────────
   HELPERS & FORMATTERS
   (Real data formatters for bytes, dates & file types)
───────────────────────────────────────────────────── */
function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileType(file) {
  const mime = (file?.fileType || '').toLowerCase();
  const name = (file?.fileName || file?.title || '').toLowerCase();
  if (mime.startsWith('video') || /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(name)) return 'video';
  if (mime.startsWith('audio') || /\.(mp3|wav|aac|ogg|flac|m4a)$/i.test(name)) return 'audio';
  if (mime.startsWith('image') || /\.(png|jpe?g|webp|gif|svg)$/i.test(name)) return 'image';
  return 'doc';
}

function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      };
    case 'in_progress':
    case 'active':
    case 'assigned':
      return {
        label: 'In Progress',
        className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      };
    case 'review':
    case 'revision':
      return {
        label: 'Review Stage',
        className: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      };
    default:
      return {
        label: status || 'Active',
        className: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
      };
  }
}

function getWorkspaceMembers(ws) {
  const map = new Map();
  if (ws.creatorId && (ws.creatorId._id || ws.creatorId)) {
    const cid = (ws.creatorId._id || ws.creatorId).toString();
    map.set(cid, {
      _id: cid,
      name: ws.creatorId.name || 'Project Creator',
      role: 'Project Creator',
      avatar: ws.creatorId.profileImage || DEFAULT_PFP,
    });
  }
  if (ws.editorId && (ws.editorId._id || ws.editorId)) {
    const eid = (ws.editorId._id || ws.editorId).toString();
    if (!map.has(eid)) {
      map.set(eid, {
        _id: eid,
        name: ws.editorId.name || 'Lead Video Editor',
        role: 'Lead Video Editor',
        avatar: ws.editorId.profileImage || DEFAULT_PFP,
      });
    }
  }
  if (Array.isArray(ws.members)) {
    ws.members.forEach((m) => {
      const u = m.user;
      if (u && (u._id || u)) {
        const uid = (u._id || u).toString();
        const roleLabel =
          m.projectRole === 'creator'
            ? 'Project Creator'
            : m.projectRole === 'lead_editor'
            ? 'Lead Video Editor'
            : m.projectRole || 'Team Member';
        if (!map.has(uid)) {
          map.set(uid, {
            _id: uid,
            name: u.name || 'Team Member',
            role: roleLabel,
            avatar: u.profileImage || DEFAULT_PFP,
          });
        }
      }
    });
  }
  return Array.from(map.values());
}

/* ─────────────────────────────────────────────────────
   FILE ICON & ROW
───────────────────────────────────────────────────── */
function FileIcon({ type }) {
  if (type === 'video') return <FileVideo className="w-4 h-4 text-rose-400" />;
  if (type === 'audio') return <FileAudio className="w-4 h-4 text-emerald-400" />;
  if (type === 'image') return <ImageIcon className="w-4 h-4 text-sky-400" />;
  return <FileText className="w-4 h-4 text-amber-400" />;
}

function FileRow({ file, onDelete, canDelete }) {
  const fileType = getFileType(file);
  const fileName = file.fileName || file.title || 'Asset';
  const fileSize = formatFileSize(file.fileSize);
  const uploaderName = file.uploadedBy?.name || 'Collaborator';
  const fileDate = formatTime(file.createdAt);

  return (
    <div className="p-3 rounded-xl bg-[#111625] border border-white/[0.06] hover:border-purple-500/30 transition-all flex items-center justify-between gap-3 group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[#182033] border border-white/5 flex items-center justify-center shrink-0">
          <FileIcon type={fileType} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {fileName}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            {fileSize} · {uploaderName} · {fileDate}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {file.fileUrl && (
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Download / View"
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        )}
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(file._id)}
            title="Delete file"
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   CHAT PANEL (Real backend conversation & messaging)
───────────────────────────────────────────────────── */
function ChatPanel({
  title,
  subtitle,
  avatar,
  conversationId,
  workspaceId,
  currentUserId,
  onBack,
}) {
  const { showAlert } = useAlert();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get(`/api/conversations/${conversationId}/messages`);
      const msgs = res.data?.messages || [];
      setMessages(msgs);
    } catch (err) {
      console.warn('[ChatPanel] Failed to load messages:', err.message);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 6000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending || !conversationId) return;

    const textToSend = input.trim();
    setInput('');
    setSending(true);

    try {
      const res = await api.post(`/api/conversations/${conversationId}/messages`, {
        text: textToSend,
      });
      const newMsg = res.data?.data;
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg]);
      } else {
        await fetchMessages();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleAttachFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !workspaceId || !conversationId) return;

    setIsAttaching(true);
    try {
      const formData = new FormData();
      formData.append('files', f);

      const uploadRes = await api.post(`/api/workspace/${workspaceId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedFiles = uploadRes.data?.files || (uploadRes.data?.file ? [uploadRes.data.file] : []);
      const fileRecord = uploadedFiles[0];

      if (fileRecord) {
        await api.post(`/api/conversations/${conversationId}/messages`, {
          text: `Uploaded "${fileRecord.fileName || f.name}" to Space`,
          messageType: 'file',
          attachments: [
            {
              name: fileRecord.fileName || f.name,
              url: fileRecord.fileUrl,
              size: fileRecord.fileSize,
              type: fileRecord.fileType,
            },
          ],
        });
        showAlert(`File "${f.name}" uploaded and shared to chat! ✓`, 'success');
        await fetchMessages();
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to attach file', 'error');
    } finally {
      setIsAttaching(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090C16]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] bg-[#0E1322] flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        {avatar ? (
          <img
            src={avatar || DEFAULT_PFP}
            alt={title ? `${title} workspace` : 'Workspace avatar'}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PFP;
            }}
            className="w-8 h-8 rounded-full object-cover border border-white/10"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Users className="w-4 h-4" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-12 text-xs text-slate-500 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            Loading messages...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            No messages yet. Say hello to kick off collaboration! 👋
          </div>
        )}

        {messages.map((msg) => {
          const senderId = (msg.sender?._id || msg.sender)?.toString();
          const isMe = currentUserId && senderId === currentUserId.toString();
          const senderName = msg.sender?.name || (isMe ? 'You' : 'Collaborator');
          const senderAvatar = msg.sender?.profileImage || DEFAULT_PFP;
          const msgTime = formatTime(msg.createdAt);

          return (
            <div key={msg._id || msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && (
                <img
                  src={senderAvatar}
                  alt={senderName ? `${senderName} avatar` : 'Chat participant avatar'}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PFP;
                  }}
                  className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
                />
              )}
              <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMe && (
                  <span className="text-[11px] font-semibold text-slate-400 px-1">{senderName}</span>
                )}
                {msg.text && (
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-sm'
                        : 'bg-[#151C2C] text-slate-200 border border-white/[0.06] rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
                {Array.isArray(msg.attachments) &&
                  msg.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${
                        isMe
                          ? 'bg-indigo-700/40 border-indigo-500/30 text-white'
                          : 'bg-[#151C2C] border-white/[0.06] text-slate-200'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5 shrink-0 text-purple-300" />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{att.name || 'Attachment'}</p>
                        {att.size && <p className="text-[10px] opacity-70">{formatFileSize(att.size)}</p>}
                      </div>
                      {att.url && (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open file"
                          className="shrink-0 opacity-80 hover:opacity-100"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                <span className="text-[10px] text-slate-500 font-mono px-1">{msgTime}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={send}
        className="p-3 border-t border-white/[0.06] bg-[#0E1322] flex items-center gap-2 shrink-0"
      >
        <label
          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
          title="Attach file to Space & Chat"
        >
          {isAttaching ? (
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={isAttaching}
            onChange={handleAttachFile}
          />
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message team..."
          className="flex-1 px-4 py-2 text-xs rounded-xl bg-[#151C2C] text-slate-100 border border-white/[0.07] focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white transition-all cursor-pointer"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   ALL FILES MEDIA GALLERY (Real workspace files)
───────────────────────────────────────────────────── */
function MediaGallery({ files, onClose, onDelete, currentUserId, isCreator }) {
  const typeLabel = { video: 'Videos', audio: 'Audio', image: 'Images', doc: 'Documents & Assets' };

  const grouped = (files || []).reduce((acc, f) => {
    const t = getFileType(f);
    acc[t] = acc[t] || [];
    acc[t].push(f);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full bg-[#090C16]">
      <div className="px-4 py-3 border-b border-white/[0.06] bg-[#0E1322] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Grid3X3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Project Media & Space Files</p>
            <p className="text-[11px] text-slate-400">{files.length} total files</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {files.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No files uploaded to Space yet.
          </div>
        ) : (
          Object.entries(grouped).map(([type, group]) => (
            <div key={type}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                {typeLabel[type] || type} ({group.length})
              </p>
              <div className="grid grid-cols-1 gap-2">
                {group.map((file) => {
                  const uploaderId = (file.uploadedBy?._id || file.uploadedBy)?.toString();
                  const canDelete =
                    isCreator || (currentUserId && uploaderId === currentUserId.toString());
                  return (
                    <FileRow
                      key={file._id}
                      file={file}
                      canDelete={canDelete}
                      onDelete={onDelete}
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   PROJECT WORKSPACE (Right Panel)
───────────────────────────────────────────────────── */
function ProjectWorkspace({ workspace, onBack, currentUserId }) {
  const { showAlert } = useAlert();
  const fileInputRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOverSpace, setIsDraggingOverSpace] = useState(false);

  // Group chat conversation
  const [groupConvId, setGroupConvId] = useState(workspace.conversationId || null);
  const [groupLastMsg, setGroupLastMsg] = useState(null);

  // Direct DM state
  const [activeDmMember, setActiveDmMember] = useState(null);
  const [activeDmConvId, setActiveDmConvId] = useState(null);
  const [loadingDm, setLoadingDm] = useState(false);

  // Views: null | 'group' | 'dm'
  const [activeView, setActiveView] = useState(null);
  const [showAllMedia, setShowAllMedia] = useState(false);

  // Deliveries, Revisions & Review state
  const [deliveries, setDeliveries] = useState([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliverUrl, setDeliverUrl] = useState('');
  const [deliverTitle, setDeliverTitle] = useState('');
  const [deliverNotes, setDeliverNotes] = useState('');
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  const [revisionDeliveryId, setRevisionDeliveryId] = useState(null);
  const [revisionDesc, setRevisionDesc] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const isCreator =
    (workspace.creatorId?._id || workspace.creatorId)?.toString() ===
    currentUserId?.toString();

  // Load workspace files
  const fetchFiles = useCallback(async () => {
    try {
      const res = await api.get(`/api/workspace/${workspace._id}/files`);
      setFiles(res.data?.files || []);
    } catch (err) {
      console.warn('[Workspace] Failed to fetch files:', err.message);
    } finally {
      setLoadingFiles(false);
    }
  }, [workspace._id]);

  // Load deliveries
  const fetchDeliveries = useCallback(async () => {
    try {
      const res = await api.get(`/api/workspace/${workspace._id}/deliveries`);
      setDeliveries(res.data?.deliveries || []);
    } catch (err) {
      console.warn('[Workspace] Failed to fetch deliveries:', err.message);
    } finally {
      setLoadingDeliveries(false);
    }
  }, [workspace._id]);

  // Load or ensure project group conversation
  const fetchGroupConv = useCallback(async () => {
    try {
      const res = await api.get(`/api/conversations/project/${workspace._id}`);
      const conv = res.data?.conversation;
      if (conv) {
        setGroupConvId(conv._id);
        setGroupLastMsg(conv.lastMessage || null);
      }
    } catch (err) {
      console.warn('[Workspace] Failed to fetch project conversation:', err.message);
    }
  }, [workspace._id]);

  useEffect(() => {
    fetchFiles();
    fetchDeliveries();
    fetchGroupConv();
  }, [fetchFiles, fetchDeliveries, fetchGroupConv]);

  const handleSubmitDelivery = async (e) => {
    e.preventDefault();
    if (!deliverUrl.trim()) {
      showAlert('Please provide a video URL or link to the cut.', 'warning');
      return;
    }
    setSubmittingDelivery(true);
    try {
      await api.post(`/api/workspace/${workspace._id}/deliver`, {
        videoUrl: deliverUrl.trim(),
        title: deliverTitle.trim() || undefined,
        notes: deliverNotes.trim() || undefined,
      });
      showAlert('Final video cut submitted for creator review! ✓', 'success');
      setShowDeliverModal(false);
      setDeliverUrl('');
      setDeliverTitle('');
      setDeliverNotes('');
      fetchDeliveries();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to submit delivery', 'error');
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const handleApproveDelivery = async (deliveryId) => {
    try {
      await api.post(`/api/workspace/${deliveryId}/approve`);
      showAlert('Delivery approved! Project marked as completed and escrow cleared! 🎉', 'success');
      fetchDeliveries();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to approve delivery', 'error');
    }
  };

  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    if (!revisionDesc.trim() || !revisionDeliveryId) {
      showAlert('Please enter feedback / revision description.', 'warning');
      return;
    }
    setSubmittingRevision(true);
    try {
      await api.post(`/api/workspace/${revisionDeliveryId}/revision`, {
        description: revisionDesc.trim(),
      });
      showAlert('Revision requested! The editor has been notified.', 'info');
      setRevisionDeliveryId(null);
      setRevisionDesc('');
      fetchDeliveries();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to request revision', 'error');
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const projectId = workspace.projectId?._id || workspace.projectId;
    if (!projectId) return;
    setSubmittingReview(true);
    try {
      await api.post(`/api/projects/${projectId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim() || 'Great collaboration!',
      });
      showAlert('Review submitted successfully! Thank you!', 'success');
      setShowReviewModal(false);
      setReviewSubmitted(true);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle uploading files directly to ImageKit via backend
  const handleUploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      Array.from(fileList).forEach((file) => {
        formData.append('files', file);
      });

      const res = await api.post(`/api/workspace/${workspace._id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showAlert(res.data?.message || 'Files uploaded to Space successfully! ✓', 'success');
      await fetchFiles();
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to upload files', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle delete file
  const handleDeleteFile = async (fileId) => {
    try {
      await api.delete(`/api/workspace/${workspace._id}/files/${fileId}`);
      showAlert('File removed from Space', 'info');
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to delete file', 'error');
    }
  };

  // Open 1-on-1 DM with a team member
  const handleOpenDm = async (member) => {
    setActiveDmMember(member);
    setLoadingDm(true);
    setActiveView('dm');

    try {
      const res = await api.post('/api/conversations', { recipientId: member._id });
      const conv = res.data?.conversation;
      if (conv) {
        setActiveDmConvId(conv._id);
      }
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to start chat with member', 'error');
    } finally {
      setLoadingDm(false);
    }
  };

  const projectTitle = workspace.projectId?.title || 'Creative Production Workspace';
  const projectCategory = workspace.projectId?.category || 'Video Editing';
  const projectDeadline = workspace.projectId?.deadline
    ? new Date(workspace.projectId.deadline).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Ongoing';
  const badgeInfo = getStatusBadge(workspace.status || workspace.projectId?.status);
  const members = getWorkspaceMembers(workspace);
  const otherMembers = members.filter(
    (m) => currentUserId && m._id.toString() !== currentUserId.toString()
  );
  const recentFiles = files.slice(0, 3);

  // CHAT VIEW — Group
  if (activeView === 'group') {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <ChatPanel
          title={`${projectTitle} — Team Group`}
          subtitle={`${members.length} member${members.length > 1 ? 's' : ''}`}
          avatar={null}
          conversationId={groupConvId}
          workspaceId={workspace._id}
          currentUserId={currentUserId}
          onBack={() => {
            setActiveView(null);
            fetchGroupConv();
          }}
        />
      </div>
    );
  }

  // CHAT VIEW — DM with a team member
  if (activeView === 'dm' && activeDmMember) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {loadingDm ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            Connecting chat with {activeDmMember.name}...
          </div>
        ) : (
          <ChatPanel
            title={activeDmMember.name}
            subtitle={activeDmMember.role}
            avatar={activeDmMember.avatar}
            conversationId={activeDmConvId}
            workspaceId={workspace._id}
            currentUserId={currentUserId}
            onBack={() => {
              setActiveView(null);
              setActiveDmMember(null);
              setActiveDmConvId(null);
            }}
          />
        )}
      </div>
    );
  }

  // MEDIA GALLERY VIEW
  if (showAllMedia) {
    return (
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <MediaGallery
          files={files}
          currentUserId={currentUserId}
          isCreator={isCreator}
          onDelete={handleDeleteFile}
          onClose={() => setShowAllMedia(false)}
        />
      </div>
    );
  }

  // ── DEFAULT PROJECT WORKSPACE VIEW ──
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
            <h1 className="text-sm font-bold text-white truncate">{projectTitle}</h1>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${badgeInfo.className}`}>
              {badgeInfo.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
            <span>{projectCategory}</span>
            <span>·</span>
            <span>Due {projectDeadline}</span>
            <span>·</span>
            <span className="text-purple-300">
              {members.map((m) => m.name.split(' ')[0]).join(', ')}
            </span>
          </p>
        </div>
      </header>

      <div className="p-5 space-y-7">
        {/* ── SECTION 1: SPACE (Drop Zone & Files) ── */}
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
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOverSpace(true);
            }}
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
                {isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-purple-400" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>
              <h4 className="text-sm font-bold text-white mb-1">
                {isUploading
                  ? 'Uploading assets to Space...'
                  : isDraggingOverSpace
                  ? 'Drop to upload into Space'
                  : 'Drop files here to add to Space'}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Directly uploads to ImageKit storage. Supports MP4, MOV, WAV, LUTs, PNGs and more.
              </p>
              <div className="flex items-center gap-2 mt-3 text-[11px] text-purple-400 font-medium flex-wrap justify-center">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Browse Files
                </button>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  ⌘V / Ctrl+V
                </span>
              </div>
            </div>
          </div>

          {/* Recent Files List */}
          {loadingFiles ? (
            <div className="mt-4 flex items-center justify-center py-6 text-xs text-slate-500 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              Loading Space assets...
            </div>
          ) : files.length > 0 ? (
            <div className="mt-4 space-y-2">
              {recentFiles.map((file) => {
                const uploaderId = (file.uploadedBy?._id || file.uploadedBy)?.toString();
                const canDelete =
                  isCreator || (currentUserId && uploaderId === currentUserId.toString());
                return (
                  <FileRow
                    key={file._id}
                    file={file}
                    canDelete={canDelete}
                    onDelete={handleDeleteFile}
                  />
                );
              })}

              {files.length > 3 && (
                <button
                  onClick={() => setShowAllMedia(true)}
                  className="w-full py-2.5 text-xs font-semibold text-purple-400 hover:text-purple-300 border border-white/[0.06] hover:border-purple-500/30 rounded-xl bg-[#0E1322] hover:bg-[#11182A] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  View all {files.length} files in Media Gallery
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-[#0E1322]/50 border border-white/[0.04] text-center text-xs text-slate-500">
              No files uploaded to Space yet. Drop raw video assets, music, or notes above.
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
            onClick={() => setActiveView('group')}
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
                  {projectTitle} — Team
                </p>
                {groupLastMsg?.createdAt && (
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">
                    {formatTime(groupLastMsg.createdAt)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                {groupLastMsg?.text || 'Tap to open project team chat'}
              </p>
              <p className="text-[11px] text-purple-400 mt-0.5">{members.length} members</p>
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
            {otherMembers.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#0E1322]/50 border border-white/[0.04] text-center text-xs text-slate-500">
                {isCreator
                  ? 'Waiting for editor assignment. Once an editor is accepted for this gig, their 1-on-1 chat will appear here.'
                  : 'No other collaborators in this workspace yet.'}
              </div>
            ) : (
              otherMembers.map((member) => (
                <div
                  key={member._id}
                  onClick={() => handleOpenDm(member)}
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-indigo-500/30 cursor-pointer transition-all group"
                >
                  <div className="relative w-11 h-11 shrink-0">
                    <img
                      src={member.avatar || DEFAULT_PFP}
                      alt={member.name ? `${member.name} avatar` : 'Member avatar'}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_PFP;
                      }}
                      className="w-full h-full rounded-full object-cover border border-white/10"
                    />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0E1322] absolute bottom-0 right-0 shadow-[0_0_6px_#34D399]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {member.name}
                      </p>
                    </div>
                    <p className="text-[11px] text-purple-400 font-medium">{member.role}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tap to start a private chat</p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── SECTION 4: DELIVERABLES & PRODUCTION APPROVALS ── */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-400" />
              Final Cut Deliverables & Approvals
            </h3>
            <div className="flex items-center gap-2">
              {!isCreator && (
                <button
                  type="button"
                  onClick={() => setShowDeliverModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  Deliver Final Cut
                </button>
              )}
              {(workspace.status === 'completed' || deliveries.some((d) => d.status === 'approved')) && !reviewSubmitted && (
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-black" />
                  Leave Review
                </button>
              )}
            </div>
          </div>

          {loadingDeliveries ? (
            <div className="p-4 rounded-xl bg-[#0E1322]/50 border border-white/[0.04] text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> Loading deliverables...
            </div>
          ) : deliveries.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#0E1322]/50 border border-white/[0.04] text-center text-xs text-slate-500">
              No final cuts delivered yet. When the editor submits a cut, it will appear here for review and milestone approval.
            </div>
          ) : (
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div
                  key={delivery._id}
                  className="p-4 rounded-2xl bg-[#0E1322] border border-white/[0.06] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          v{delivery.version || 1}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate">{delivery.title || `Cut v${delivery.version}`}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Delivered by <span className="text-slate-200 font-medium">{delivery.editorId?.name || 'Editor'}</span> · {formatTime(delivery.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize border ${
                          delivery.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : delivery.status === 'revision_requested'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {delivery.status?.replace('_', ' ') || 'Pending Review'}
                      </span>
                      {delivery.videoUrl && (
                        <a
                          href={delivery.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
                        >
                          <Play className="w-3 h-3 text-emerald-400" /> Watch
                        </a>
                      )}
                    </div>
                  </div>

                  {delivery.notes && (
                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-300 leading-relaxed">
                      {delivery.notes}
                    </div>
                  )}

                  {/* Creator Action Buttons for Pending Review */}
                  {isCreator && delivery.status === 'pending_review' && (
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.04]">
                      <button
                        type="button"
                        onClick={() => {
                          setRevisionDeliveryId(delivery._id);
                          setRevisionDesc('');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                      >
                        Request Revision
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveDelivery(delivery._id)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer"
                      >
                        Approve & Clear Escrow
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── MODAL: SUBMIT FINAL DELIVERY (Editor) ── */}
      {showDeliverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-card p-6 border border-white/[0.1] rounded-2xl bg-[#0B0E17]/95 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" />
                Deliver Final Cut
              </h3>
              <button
                type="button"
                onClick={() => setShowDeliverModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDelivery} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Video Link / Stream URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://drive.google.com/... or Vimeo/Frame.io link"
                  value={deliverUrl}
                  onChange={(e) => setDeliverUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] text-white border border-white/[0.08] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cut Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Master Final Cut (Color Graded)"
                  value={deliverTitle}
                  onChange={(e) => setDeliverTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] text-white border border-white/[0.08] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delivery Notes / Changeground</label>
                <textarea
                  rows={3}
                  placeholder="Added cinematic sound design and corrected color at 02:15 timestamp..."
                  value={deliverNotes}
                  onChange={(e) => setDeliverNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] text-white border border-white/[0.08] focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeliverModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDelivery}
                  className="px-4 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                >
                  {submittingDelivery ? 'Submitting...' : 'Submit Cut'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: REQUEST REVISION (Creator) ── */}
      {revisionDeliveryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-card p-6 border border-white/[0.1] rounded-2xl bg-[#0B0E17]/95 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-rose-400" />
                Request Revision
              </h3>
              <button
                type="button"
                onClick={() => setRevisionDeliveryId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Detailed Revision Notes <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please increase audio volume on dialogue around 01:20 and speed up transitions between clips."
                  value={revisionDesc}
                  onChange={(e) => setRevisionDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] text-white border border-white/[0.08] focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRevisionDeliveryId(null)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRevision}
                  className="px-4 py-1.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
                >
                  {submittingRevision ? 'Sending...' : 'Send Revision Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SUBMIT REVIEW (Creator or Editor) ── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md glass-card p-6 border border-white/[0.1] rounded-2xl bg-[#0B0E17]/95 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                Leave Collaboration Review
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-white ml-2">{reviewRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Feedback & Recommendation</label>
                <textarea
                  rows={3}
                  placeholder="Great communication, delivered ahead of schedule with top-notch video editing quality!"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141A28] text-white border border-white/[0.08] focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-1.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN WORKSPACE PAGE (Connects all views to backend)
───────────────────────────────────────────────────── */
export const Workspace = () => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?._id;

  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all accessible workspaces from backend
  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await api.get('/api/workspace');
      const list = res.data?.workspaces || [];
      setWorkspaces(list);

      // If user had a selected workspace that is still valid, keep it;
      // otherwise, if user has workspaces and is on desktop, can preserve selection
      setSelectedWorkspaceId((prev) => {
        if (prev && list.some((w) => w._id === prev)) return prev;
        return null;
      });
    } catch (err) {
      console.warn('[Workspace] Failed to fetch workspaces:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const selectedWorkspace = workspaces.find((w) => w._id === selectedWorkspaceId) || null;

  const filtered = workspaces.filter((w) => {
    const title = w.projectId?.title || '';
    const category = w.projectId?.category || '';
    const query = searchQuery.toLowerCase();
    return title.toLowerCase().includes(query) || category.toLowerCase().includes(query);
  });

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#07090E]">
      <SEO
        title="Production Workspace"
        description="Collaborative video production workspace with direct messaging, versioned file delivery, and timestamped feedback."
      />

      {/* ── LEFT: WORKSPACES LIST ── */}
      <aside
        className={`${
          selectedWorkspaceId ? 'hidden lg:flex' : 'flex'
        } w-full lg:w-80 xl:w-96 border-r border-white/[0.07] bg-[#07090F] flex-col shrink-0`}
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
              {workspaces.length} Active
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

        {/* Workspace rows */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-xs text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              Loading workspaces...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-xs text-slate-500 gap-2">
              <FolderGit2 className="w-8 h-8 text-slate-600 mb-1" />
              <p className="font-semibold text-slate-400">No workspaces found</p>
              <p className="text-[11px] text-slate-600">
                Workspaces are automatically set up when a project is created or an application is accepted.
              </p>
            </div>
          ) : (
            filtered.map((ws) => {
              const isSelected = ws._id === selectedWorkspaceId;
              const title = ws.projectId?.title || 'Creative Production Workspace';
              const badgeInfo = getStatusBadge(ws.status || ws.projectId?.status);
              const members = getWorkspaceMembers(ws);

              return (
                <div
                  key={ws._id}
                  onClick={() => setSelectedWorkspaceId(ws._id)}
                  className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/30 border-l-4 border-purple-500'
                      : 'hover:bg-white/[0.025] border-l-4 border-transparent'
                  }`}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <FolderGit2 className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-white truncate leading-snug">{title}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block ${badgeInfo.className}`}>
                        {badgeInfo.label}
                      </span>
                      {ws.fileCount > 0 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {ws.fileCount} file{ws.fileCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Members avatars */}
                    <div className="flex items-center gap-1 mt-2">
                      {members.slice(0, 3).map((m) => (
                        <img
                          key={m._id}
                          src={m.avatar || DEFAULT_PFP}
                          alt={m.name ? `${m.name} avatar` : 'Member avatar'}
                          title={m.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_PFP;
                          }}
                          className="w-4 h-4 rounded-full border border-[#07090F] object-cover ring-1 ring-white/10"
                        />
                      ))}
                      <span className="text-[10px] text-slate-500 ml-1">
                        {members.length} member{members.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── RIGHT: PROJECT WORKSPACE or EMPTY STATE ── */}
      {selectedWorkspace ? (
        <ProjectWorkspace
          key={selectedWorkspace._id}
          workspace={selectedWorkspace}
          currentUserId={currentUserId}
          onBack={() => setSelectedWorkspaceId(null)}
        />
      ) : (
        <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-center bg-[#0A0D15]/80 gap-4 p-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Select a Workspace</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Click any active project workspace from the left sidebar to access Space assets, team group chat, and private collaborator DMs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
