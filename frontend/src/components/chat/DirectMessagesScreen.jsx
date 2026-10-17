import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Phone,
  Video,
  Search,
  CheckCheck,
  Smile,
  ArrowLeft,
  Sparkles,
  Briefcase,
  Layers,
  Circle,
  MessageSquare,
  ChevronRight,
  Film,
  ExternalLink,
  Download,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  FileText,
  X,
  Play,
  Grid3X3,
} from 'lucide-react';
import Button from '../common/Button';
import SEO from '../common/SEO';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PFP } from '../../constants/assets';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

function getFileType(nameOrUrl = '') {
  const str = String(nameOrUrl).toLowerCase();
  if (/\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(str) || str.includes('video')) return 'video';
  if (/\.(mp3|wav|aac|ogg|flac|m4a)$/i.test(str) || str.includes('audio')) return 'audio';
  if (/\.(png|jpe?g|webp|gif|svg)$/i.test(str) || str.includes('image')) return 'image';
  return 'doc';
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * DirectMessagesScreen
 * Instagram-style dedicated message view.
 * Default view: Clean, full list of chats.
 * Clicking a chat: Opens the messages view with Name • Role • Latest Project.
 * Header: Contains Media & Links icon to view all media & links exchanged between creator & editor.
 */
export const DirectMessagesScreen = ({ role: viewerRole = 'creator' }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserId = currentUser?._id || currentUser?.id;

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputMsg, setInputMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [showSharedMedia, setShowSharedMedia] = useState(false);
  const [workspaceFiles, setWorkspaceFiles] = useState([]);
  const [activeMediaTab, setActiveMediaTab] = useState('all');
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      const data = await messageService.getDMs(currentUserId);
      const convList = data || [];
      setConversations(convList);

      const targetConvId = location.state?.conversationId;
      const recipientUser = location.state?.recipientUser;
      if (targetConvId) {
        const found = convList.find((c) => String(c.id) === String(targetConvId));
        if (found) {
          setActiveChat(found);
        } else if (recipientUser) {
          const newConv = {
            id: targetConvId,
            sender: recipientUser.name || 'Collaborator',
            senderRole: recipientUser.role || 'Member',
            senderUsername: recipientUser.username || '',
            senderId: recipientUser._id || recipientUser.id,
            avatar: recipientUser.profileImage || DEFAULT_PFP,
            lastMessage: 'Started new direct message',
            timestamp: 'Just now',
            unread: false,
            online: false,
            project: null,
            projectId: null,
            type: 'private',
            participants: [recipientUser],
          };
          setConversations((prev) => [newConv, ...prev.filter((c) => String(c.id) !== String(targetConvId))]);
          setActiveChat(newConv);
        }
      }
    };
    loadConversations();
  }, [currentUserId, location.state]);

  // Load messages whenever user clicks a chat
  useEffect(() => {
    if (!activeChat?.id) return;
    setShowSharedMedia(false);
    const fetchChatMessages = async () => {
      setIsLoadingMessages(true);
      const msgs = await messageService.getConversationMessages(activeChat.id, currentUserId);
      setChatHistory(msgs || []);
      setIsLoadingMessages(false);
    };
    fetchChatMessages();
  }, [activeChat?.id, currentUserId]);

  // Load workspace files when opening shared media view
  useEffect(() => {
    if (!activeChat || !showSharedMedia) return;
    const loadWorkspaceFiles = async () => {
      try {
        const res = await api.get('/api/workspace');
        const wsList = res.data?.workspaces || [];
        const matchingWs = wsList.find(
          (w) =>
            (w.projectId?._id || w.projectId)?.toString() === activeChat.projectId?.toString()
        );
        if (matchingWs) {
          const filesRes = await api.get(`/api/workspace/${matchingWs._id}/files`);
          const wsFiles = filesRes.data?.files || [];
          const otherId = activeChat.senderId?.toString();
          const myId = currentUserId?.toString();
          const filtered = wsFiles.filter((f) => {
            const uploaderId = (f.uploadedBy?._id || f.uploadedBy)?.toString();
            return uploaderId === myId || (otherId && uploaderId === otherId);
          });
          setWorkspaceFiles(filtered);
        }
      } catch (e) {
        console.warn('Failed to fetch workspace files for chat:', e.message);
      }
    };
    loadWorkspaceFiles();
  }, [activeChat, showSharedMedia, currentUserId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeChat?.id) return;
    const textToSend = inputMsg.trim();
    setInputMsg('');

    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender: 'me',
      senderName: currentUser?.name || 'Me',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, tempMsg]);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? { ...c, lastMessage: textToSend, timestamp: 'Just now', unread: false }
          : c
      )
    );

    try {
      await messageService.sendMessage(activeChat.id, textToSend);
    } catch (err) {
      console.error('Failed to send message via API:', err);
    }
  };

  const addReaction = (msgId, emoji) => {
    setChatHistory((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, reactions: [...(m.reactions || []), emoji] }
          : m
      )
    );
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      c.sender?.toLowerCase().includes(term) ||
      c.project?.toLowerCase().includes(term) ||
      c.lastMessage?.toLowerCase().includes(term)
    );
  });

  // Extract all media and links exchanged between this editor and creator
  const gatheredItems = [];

  // 1. From message history
  chatHistory.forEach((m, idx) => {
    const isMe = m.sender === 'me';
    const senderLabel = isMe ? 'You' : activeChat?.sender || 'Partner';

    // Attachments
    if (Array.isArray(m.attachments)) {
      m.attachments.forEach((att, aIdx) => {
        const url = att.url || att.fileUrl;
        if (url) {
          const type = getFileType(att.type || att.name || url);
          gatheredItems.push({
            id: `msg-att-${m.id}-${aIdx}`,
            fileType: type,
            title: att.name || 'Shared Attachment',
            url,
            size: att.size || 0,
            date: m.time || 'Recent',
            uploaderName: senderLabel,
          });
        }
      });
    }

    // URLs found in message text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = m.text?.match(urlRegex);
    if (matches) {
      matches.forEach((u, uIdx) => {
        let domain = 'Link';
        try {
          domain = new URL(u).hostname.replace('www.', '');
        } catch {}
        gatheredItems.push({
          id: `msg-link-${m.id}-${uIdx}`,
          fileType: 'link',
          title: u,
          url: u,
          domain,
          size: 0,
          date: m.time || 'Recent',
          uploaderName: senderLabel,
        });
      });
    }
  });

  // 2. From project workspace files exchanged between them
  workspaceFiles.forEach((f) => {
    const type = getFileType(f.fileType || f.fileName || f.fileUrl);
    gatheredItems.push({
      id: f._id,
      fileType: type,
      title: f.fileName || f.title || 'Workspace File',
      url: f.fileUrl,
      size: f.fileSize || 0,
      date: f.createdAt ? new Date(f.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent',
      uploaderName: f.uploadedBy?.name || 'Project File',
    });
  });

  // Filter gathered items by search & tab
  const mediaFiltered = gatheredItems.filter((item) => {
    if (activeMediaTab !== 'all' && item.fileType !== activeMediaTab) return false;
    if (!mediaSearchQuery.trim()) return true;
    const q = mediaSearchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.url?.toLowerCase().includes(q) ||
      item.uploaderName?.toLowerCase().includes(q)
    );
  });

  const countVideos = gatheredItems.filter((i) => i.fileType === 'video').length;
  const countImages = gatheredItems.filter((i) => i.fileType === 'image').length;
  const countLinks = gatheredItems.filter((i) => i.fileType === 'link').length;
  const countDocs = gatheredItems.filter((i) => i.fileType === 'doc' || i.fileType === 'audio').length;

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#07090E]">
      <SEO
        title="Direct Messages"
        description="Connect and coordinate directly with creators and editors."
      />

      {/* ─── LEFT: CONVERSATIONS LIST ─── */}
      <aside
        className={`${
          activeChat ? 'hidden lg:flex' : 'flex'
        } w-full lg:w-80 xl:w-96 border-r border-white/[0.07] bg-[#07090F] flex-col shrink-0`}
      >
        <div className="p-4 border-b border-white/[0.06] bg-[#0B0E18]/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">Direct Messages</h2>
                <p className="text-[11px] text-slate-400">1-on-1 Collaborations</p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/40 font-semibold">
              {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chats, people, projects..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#141A28] text-xs text-white placeholder-slate-500 border border-white/[0.08] focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredConversations.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isSelected = activeChat?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveChat(c)}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 group ${
                    isSelected
                      ? 'bg-purple-600/15 border border-purple-500/30'
                      : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.avatar || DEFAULT_PFP}
                      alt={c.sender}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-[#07090F]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {c.sender}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {c.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-400 font-medium truncate">
                      {c.senderRole} {c.project ? `· ${c.project}` : (c.senderUsername ? `· @${c.senderUsername}` : '')}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {c.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ─── RIGHT: ACTIVE CHAT OR PLACEHOLDER ─── */}
      {!activeChat ? (
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-500 bg-[#090C16]">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Your Direct Messages</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Select a conversation to start chatting, sharing video drafts, and reviewing milestone links.
          </p>
        </div>
      ) : showSharedMedia ? (
        /* ─── SHARED MEDIA & LINKS GRID SCREEN ─── */
        <div className="flex-1 flex flex-col h-full bg-[#080B14] min-w-0">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#0C101C]/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowSharedMedia(false)}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-white truncate">
                  Shared Media & Links — {activeChat.sender}
                </h2>
                <p className="text-[11px] text-slate-400 truncate">
                  Exchanged files and links between you and {activeChat.sender} (sorted latest first)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search shared files & links..."
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#141A28] text-xs text-white placeholder-slate-500 border border-white/[0.08] focus:outline-none focus:border-purple-500 w-48 sm:w-60"
                />
              </div>
              <button
                onClick={() => setShowSharedMedia(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-5 py-2.5 border-b border-white/[0.06] bg-[#0A0E1A] flex items-center gap-2 overflow-x-auto shrink-0">
            {[
              { id: 'all', label: `All (${gatheredItems.length})` },
              { id: 'video', label: `Videos (${countVideos})` },
              { id: 'image', label: `Images (${countImages})` },
              { id: 'link', label: `Links (${countLinks})` },
              { id: 'doc', label: `Docs & Files (${countDocs})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMediaTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeMediaTab === tab.id
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {mediaFiltered.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center text-slate-500">
                <Film className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-sm font-semibold text-slate-400">No media or links found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {mediaSearchQuery
                    ? 'No items matched your search query.'
                    : `Attachments and links shared in your 1-on-1 chat with ${activeChat.sender} will appear here.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaFiltered.map((item) => {
                  if (item.fileType === 'link') {
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-purple-500/40 flex flex-col justify-between gap-3 transition-all group hover:bg-[#11182B]"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              {item.domain || 'Link'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {item.date}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Shared by {item.uploaderName}
                          </p>
                        </div>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-purple-600 hover:text-white text-slate-300 border border-white/[0.08] transition-all cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Link
                        </a>
                      </div>
                    );
                  }

                  if (item.fileType === 'image') {
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-purple-500/40 overflow-hidden flex flex-col justify-between transition-all group hover:bg-[#11182B]"
                      >
                        <div className="relative aspect-video bg-[#07090F] overflow-hidden flex items-center justify-center">
                          <img
                            src={item.url}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.size > 0 && (
                            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white">
                              {formatFileSize(item.size)}
                            </span>
                          )}
                        </div>

                        <div className="p-3">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.uploaderName} · {item.date}
                          </p>

                          <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between gap-1.5">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1 rounded-lg text-center text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 transition-colors flex items-center justify-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View
                            </a>
                            <a
                              href={item.url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (item.fileType === 'video') {
                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-purple-500/40 overflow-hidden flex flex-col justify-between transition-all group hover:bg-[#11182B]"
                      >
                        <div className="relative aspect-video bg-gradient-to-tr from-purple-950/40 to-[#0A0D18] flex items-center justify-center border-b border-white/[0.04]">
                          <div className="w-12 h-12 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                            <FileVideo className="w-6 h-6 text-rose-400" />
                          </div>
                          {item.size > 0 && (
                            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white">
                              {formatFileSize(item.size)}
                            </span>
                          )}
                        </div>

                        <div className="p-3">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.uploaderName} · {item.date}
                          </p>

                          <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between gap-1.5">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1 rounded-lg text-center text-xs font-semibold bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <Play className="w-3 h-3 text-purple-400" /> Stream / Watch
                            </a>
                            <a
                              href={item.url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Audio / Doc
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-[#0E1322] border border-white/[0.06] hover:border-purple-500/40 flex flex-col justify-between gap-3 transition-all group hover:bg-[#11182B]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#182033] border border-white/5 flex items-center justify-center shrink-0">
                          {item.fileType === 'audio' ? (
                            <FileAudio className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            {item.size > 0 ? `${formatFileSize(item.size)} · ` : ''}{item.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04]">
                        <span className="text-[11px] text-slate-400 truncate">
                          {item.uploaderName}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Download / View"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ─── ACTIVE CONVERSATION STREAM ─── */
        <div className="flex-1 flex flex-col h-full bg-[#07090F] min-w-0">
          {/* Top Header: Name • Role • Latest Project */}
          <div className="py-3 px-4 md:px-6 border-b border-white/[0.08] bg-[#0A0D15]/95 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveChat(null)}
                className="p-2 -ml-1 text-slate-300 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">All Chats</span>
              </button>

              <div className="relative shrink-0">
                <img
                  src={activeChat.avatar || DEFAULT_PFP}
                  alt={activeChat.sender ? `${activeChat.sender} avatar` : 'Active user avatar'}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/40 ring-2 ring-purple-600/20"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-[#0A0D15]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white truncate">
                    {activeChat.sender}
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2 py-0.5 rounded-md">
                    {activeChat.senderRole || 'Collaborator'}
                  </span>
                  <span className="text-xs text-emerald-400 font-medium hidden md:inline-flex items-center gap-1">
                    <Circle className="w-1.5 h-1.5 fill-emerald-400 text-emerald-400" /> Active Now
                  </span>
                </div>

                {activeChat.project ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 truncate">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Project:</span>
                    <span className="text-amber-300 font-semibold truncate">
                      {activeChat.project}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 truncate">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="text-slate-400">Direct Message</span>
                    {activeChat.senderUsername && (
                      <span className="text-purple-300/80 font-mono text-[11px]">
                        @{activeChat.senderUsername}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Media & Links Icon */}
              <button
                onClick={() => setShowSharedMedia(true)}
                className="p-2 rounded-xl text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all flex items-center justify-center text-xs font-semibold cursor-pointer"
                title="Shared Media & Links"
                aria-label="Shared Media & Links"
              >
                <Film className="w-4 h-4 text-purple-400" />
              </button>

              {activeChat.projectId && (
                <button
                  onClick={() => {
                    const workspaceRoute = viewerRole === 'creator' ? '/creator/workspace' : '/editor/workspace';
                    navigate(workspaceRoute);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Workspace</span>
                </button>
              )}
              <button
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── Chat Message Stream (Instagram bubbles) ─── */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-3.5">
            {isLoadingMessages ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2" />
                Loading direct messages...
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                <img
                  src={activeChat.avatar || DEFAULT_PFP}
                  alt="avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{activeChat.sender}</h4>
                  <p className="text-xs text-purple-400">{activeChat.senderRole} • {activeChat.project || 'Collabo Direct'}</p>
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  This is the start of your direct messaging with {activeChat.sender}. Discuss project details, drafts, and directions.
                </p>
              </div>
            ) : (
              chatHistory.map((item) => {
                const isMe = item.sender === 'me';
                return (
                  <div
                    key={item.id}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'} group`}
                  >
                    {!isMe && (
                      <img
                        src={item.senderAvatar || activeChat.avatar || DEFAULT_PFP}
                        alt="sender"
                        className="w-7 h-7 rounded-full object-cover mb-1 border border-white/10 shrink-0"
                      />
                    )}

                    <div className={`max-w-[78%] sm:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-purple-900/20'
                            : 'bg-[#141A28] text-slate-200 border border-white/[0.06] rounded-bl-xs'
                        }`}
                      >
                        <p>{item.text}</p>

                        {item.attachments && item.attachments.length > 0 && (
                          <div className="mt-2 space-y-1 pt-1.5 border-t border-white/10">
                            {item.attachments.map((att, i) => (
                              <a
                                key={i}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-xs text-purple-200"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                                <span className="truncate">{att.name || 'Attachment'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-purple-400" />}
                      </div>

                      {item.reactions && item.reactions.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {item.reactions.map((r, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-[10px] bg-[#1E2638] rounded-full border border-white/[0.08]">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Quick Emoji Reaction Pill */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 text-xs">
                        {['👍', '🔥', '❤️', '🚀', '💯'].map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => addReaction(item.id, em)}
                            className="hover:scale-125 transition-transform px-1 cursor-pointer"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ─── Instagram Input Bar ─── */}
          <form
            onSubmit={handleSend}
            className="p-3 md:p-4 border-t border-white/[0.08] bg-[#0A0D15]/95 flex items-center gap-2.5 shrink-0"
          >
            <button
              type="button"
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Message ${activeChat.sender}...`}
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-[#141A28] text-xs sm:text-sm text-white border border-white/[0.08] focus:outline-none focus:border-purple-500 placeholder:text-slate-500"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm shadow-md shadow-purple-900/30 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DirectMessagesScreen;
