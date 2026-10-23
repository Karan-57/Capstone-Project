import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Search,
  CheckCheck,
  Smile,
  ArrowLeft,
  Layers,

  MessageSquare,
  Film,
  ExternalLink,
  Download,
  FileVideo,
  FileAudio,
  FileText,
  X,
  Play,
} from 'lucide-react';
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
 * Clicking a chat: Opens the messages view with Name • Role badge • Active now.
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
    <div className="flex h-full w-full overflow-hidden bg-[#FFF7F1] dark:bg-[#19100F] text-[#261615] dark:text-[#FDEBDE]">
      <SEO
        title="Direct Messages"
        description="Connect and coordinate directly with creators and editors."
      />

      {/* ─── LEFT: CONVERSATIONS LIST ─── */}
      <aside
        className={`${
          activeChat ? 'hidden lg:flex' : 'flex'
        } w-full lg:w-80 xl:w-96 border-r-2 border-[#382322] dark:border-[#FDEBDE]/30 bg-[#FFFDF9] dark:bg-[#201413] flex-col shrink-0`}
      >
        <div className="p-4 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 bg-[#FFF7F1] dark:bg-[#19100F]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#261615] dark:text-[#FDEBDE] tracking-wide">Direct Messages</h2>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#5C3A38] dark:text-[#D4B8A8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chats, people, projects..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-[#FFFDF9] dark:bg-[#201413] text-xs text-[#261615] dark:text-[#FDEBDE] placeholder-[#5C3A38]/50 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl focus:outline-none shadow-[2px_2px_0_#382322] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredConversations.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
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
                      ? 'bg-[#FFEBAA] dark:bg-[#2A1A19] border-2 border-[#382322] shadow-[2px_2px_0_#382322]'
                      : 'hover:bg-[#FFF7F1] dark:hover:bg-[#19100F] border-2 border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.avatar || DEFAULT_PFP}
                      alt={c.sender}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#382322]"
                    />
    
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                        {c.sender}
                      </p>
                      <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
                        {c.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C3A38] dark:text-[#FFEBAA] font-semibold truncate">
                      {c.senderRole} {c.project ? `· ${c.project}` : (c.senderUsername ? `· @${c.senderUsername}` : '')}
                    </p>
                    <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] truncate mt-0.5 font-sans">
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
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-8 text-center text-[#5C3A38] dark:text-[#D4B8A8] bg-[#FFF7F1] dark:bg-[#19100F]">
          <div className="w-16 h-16 rounded-2xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[3px_3px_0_#382322] flex items-center justify-center text-[#261615] mb-3">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE] mb-1">Your Direct Messages</h3>
          <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] max-w-sm">
            Select a conversation to start chatting, sharing video drafts, and reviewing milestone links.
          </p>
        </div>
      ) : showSharedMedia ? (
        /* ─── SHARED MEDIA & LINKS GRID SCREEN ─── */
        <div className="flex-1 flex flex-col h-full bg-[#FFF7F1] dark:bg-[#19100F] min-w-0">
          {/* Header */}
          <div className="px-5 py-3.5 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 bg-[#FFFDF9] dark:bg-[#201413] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setShowSharedMedia(false)}
                className="p-1.5 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] shadow-[2px_2px_0_#382322] transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-[#B1C8EA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615] shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                  Shared Media & Links — {activeChat.sender}
                </h2>
                <p className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] truncate">
                  Exchanged files and links between you and {activeChat.sender} (sorted latest first)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#5C3A38] dark:text-[#D4B8A8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search shared files & links..."
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#FFFDF9] dark:bg-[#201413] text-xs text-[#261615] dark:text-[#FDEBDE] placeholder-[#5C3A38]/50 border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl focus:outline-none w-48 sm:w-60 shadow-[2px_2px_0_#382322]"
                />
              </div>
              <button
                onClick={() => setShowSharedMedia(false)}
                className="p-1.5 text-[#5C3A38] hover:text-[#261615] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="px-5 py-2.5 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 bg-[#FFF7F1] dark:bg-[#19100F] flex items-center gap-2 overflow-x-auto shrink-0">
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
                className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all shrink-0 cursor-pointer ${
                  activeMediaTab === tab.id
                    ? 'bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322]'
                    : 'text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] border-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {mediaFiltered.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center text-[#5C3A38] dark:text-[#D4B8A8]">
                <Film className="w-10 h-10 mb-3 text-[#5C3A38] opacity-50" />
                <p className="text-sm font-bold font-serif text-[#261615] dark:text-[#FDEBDE]">No media or links found</p>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] mt-1 max-w-sm">
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
                        className="p-4 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl shadow-[3px_3px_0_#382322] flex flex-col justify-between gap-3 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider bg-[#B1C8EA] text-[#261615] border-2 border-[#382322] rounded-md">
                              {item.domain || 'Link'}
                            </span>
                            <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono">
                              {item.date}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] mt-1 font-mono">
                            Shared by {item.uploaderName}
                          </p>
                        </div>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FFEBAA] text-[#261615] dark:text-[#FDEBDE] dark:hover:text-[#261615] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] transition-all cursor-pointer"
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
                        className="bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl shadow-[3px_3px_0_#382322] overflow-hidden flex flex-col justify-between transition-all"
                      >
                        <div className="relative aspect-video bg-[#FFF7F1] dark:bg-[#19100F] border-b-2 border-[#382322] overflow-hidden flex items-center justify-center">
                          <img
                            src={item.url}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          {item.size > 0 && (
                            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-[#FFFDF9] text-[#261615] border border-[#382322] rounded-md text-[10px] font-mono font-bold">
                              {formatFileSize(item.size)}
                            </span>
                          )}
                        </div>

                        <div className="p-3">
                          <h4 className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 font-mono">
                            {item.uploaderName} · {item.date}
                          </p>

                          <div className="mt-2.5 pt-2 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-between gap-1.5">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1 text-center text-xs font-bold font-mono uppercase rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FDEBDE] text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> View
                            </a>
                            <a
                              href={item.url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322] transition-colors"
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
                        className="bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl shadow-[3px_3px_0_#382322] overflow-hidden flex flex-col justify-between transition-all"
                      >
                        <div className="relative aspect-video bg-[#FFF7F1] dark:bg-[#19100F] flex items-center justify-center border-b-2 border-[#382322]">
                          <div className="w-12 h-12 rounded-xl bg-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center justify-center text-[#261615]">
                            <FileVideo className="w-6 h-6" />
                          </div>
                          {item.size > 0 && (
                            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-[#FFFDF9] text-[#261615] border border-[#382322] rounded-md text-[10px] font-mono font-bold">
                              {formatFileSize(item.size)}
                            </span>
                          )}
                        </div>

                        <div className="p-3">
                          <h4 className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 font-mono">
                            {item.uploaderName} · {item.date}
                          </p>

                          <div className="mt-2.5 pt-2 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 flex items-center justify-between gap-1.5">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1 text-center text-xs font-bold font-mono uppercase rounded-xl bg-[#B1C8EA] hover:bg-[#9cbfe6] text-[#261615] border-2 border-[#382322] transition-colors flex items-center justify-center gap-1"
                            >
                              <Play className="w-3 h-3" /> Stream / Watch
                            </a>
                            <a
                              href={item.url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322] transition-colors"
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
                      className="p-4 bg-[#FFFDF9] dark:bg-[#201413] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl shadow-[3px_3px_0_#382322] flex flex-col justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] flex items-center justify-center shrink-0">
                          {item.fileType === 'audio' ? (
                            <FileAudio className="w-4 h-4 text-[#261615] dark:text-[#FFEBAA]" />
                          ) : (
                            <FileText className="w-4 h-4 text-[#261615] dark:text-[#FFEBAA]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] mt-0.5 font-mono">
                            {item.size > 0 ? `${formatFileSize(item.size)} · ` : ''}{item.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                        <span className="text-[11px] text-[#5C3A38] dark:text-[#D4B8A8] truncate font-mono">
                          {item.uploaderName}
                        </span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-[#FFEBAA] text-[#261615] border-2 border-[#382322] shadow-[1px_1px_0_#382322] transition-colors"
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
        <div className="flex-1 flex flex-col h-full bg-[#FFF7F1] dark:bg-[#19100F] min-w-0">
          {/* Top Header: [Arrow Back] [PFP] [Name] [creator/freelancer badge in same line] • Active now below */}
          <div className="py-3 px-4 md:px-6 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 bg-[#FFFDF9] dark:bg-[#201413] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveChat(null)}
                className="p-2 -ml-1 text-[#261615] dark:text-[#FDEBDE] bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl shadow-[2px_2px_0_#382322] transition-colors flex items-center justify-center cursor-pointer shrink-0"
                title="Back to all chats"
                aria-label="Back to all chats"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="relative shrink-0">
                <img
                  src={activeChat.avatar || DEFAULT_PFP}
                  alt={activeChat.sender ? `${activeChat.sender} avatar` : 'Active user avatar'}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#382322]"
                />

              </div>

              <div className="min-w-0">
                {/* Line 1: Name and creator/freelancer role badge in same line */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate">
                    {activeChat.sender}
                  </h3>
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-[#261615] bg-[#B1C8EA] border-2 border-[#382322] px-2 py-0.5 rounded-lg shadow-[1px_1px_0_#382322]">
                    {activeChat.senderRole || 'Collaborator'}
                  </span>
                </div>


              </div>
            </div>

            {/* Top Quick Actions (Direct message text and Call buttons removed) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Media & Links Icon */}
              <button
                onClick={() => setShowSharedMedia(true)}
                className="p-2 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] hover:bg-[#FFEBAA] text-[#261615] dark:text-[#FDEBDE] dark:hover:text-[#261615] border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322] transition-all flex items-center justify-center text-xs font-bold cursor-pointer"
                title="Shared Media & Links"
                aria-label="Shared Media & Links"
              >
                <Film className="w-4 h-4" />
              </button>

              {activeChat.projectId && (
                <button
                  onClick={() => {
                    const workspaceRoute = viewerRole === 'creator' ? '/creator/workspace' : '/editor/workspace';
                    navigate(workspaceRoute);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFEBAA] hover:bg-[#ffe58f] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Workspace</span>
                </button>
              )}
            </div>
          </div>

          {/* ─── Chat Message Stream ─── */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-3.5">
            {isLoadingMessages ? (
              <div className="h-full flex items-center justify-center text-xs text-[#5C3A38] dark:text-[#D4B8A8]">
                <div className="w-5 h-5 border-2 border-[#382322] border-t-transparent rounded-full animate-spin mr-2" />
                Loading direct messages...
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[#5C3A38] dark:text-[#D4B8A8] space-y-3">
                <img
                  src={activeChat.avatar || DEFAULT_PFP}
                  alt="avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#382322] shadow-[3px_3px_0_#382322]"
                />
                <div>
                  <h4 className="text-base font-serif font-bold text-[#261615] dark:text-[#FDEBDE]">{activeChat.sender}</h4>
                  <p className="text-xs text-[#5C3A38] dark:text-[#FFEBAA] font-mono">{activeChat.senderRole} • {activeChat.project || 'Collabo Direct'}</p>
                </div>
                <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] max-w-sm">
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
                        className="w-8 h-8 rounded-full object-cover mb-1 border-2 border-[#382322] shrink-0"
                      />
                    )}

                    <div className={`max-w-[78%] sm:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-2.5 text-xs sm:text-sm leading-relaxed border-2 border-[#382322] rounded-2xl ${
                          isMe
                            ? 'bg-[#FFEBAA] text-[#261615] rounded-br-sm shadow-[2px_2px_0_#382322]'
                            : 'bg-[#FFFDF9] dark:bg-[#201413] text-[#261615] dark:text-[#FDEBDE] dark:border-[#FDEBDE]/30 rounded-bl-sm shadow-[2px_2px_0_#382322]'
                        }`}
                      >
                        <p>{item.text}</p>

                        {item.attachments && item.attachments.length > 0 && (
                          <div className="mt-2 space-y-1 pt-1.5 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10">
                            {item.attachments.map((att, i) => (
                              <a
                                key={i}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-1.5 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] border border-[#382322] text-xs text-[#261615] dark:text-[#FDEBDE]"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                                <span className="truncate">{att.name || 'Attachment'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        <span className="text-[10px] text-[#5C3A38] dark:text-[#D4B8A8] font-mono">{item.time}</span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#261615] dark:text-[#FFEBAA]" />}
                      </div>

                      {item.reactions && item.reactions.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {item.reactions.map((r, i) => (
                            <span key={i} className="px-1.5 py-0.5 text-[10px] bg-[#FFFDF9] text-[#261615] border border-[#382322] rounded-md">
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

          {/* ─── Input Bar ─── */}
          <form
            onSubmit={handleSend}
            className="p-3 md:p-4 border-t-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 bg-[#FFFDF9] dark:bg-[#201413] flex items-center gap-2.5 shrink-0"
          >
            <button
              type="button"
              className="p-2.5 rounded-xl bg-[#FFF7F1] dark:bg-[#19100F] border-2 border-[#382322] dark:border-[#FDEBDE]/30 text-[#261615] dark:text-[#FDEBDE] shadow-[2px_2px_0_#382322] cursor-pointer"
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
                className="w-full pl-4 pr-10 py-2.5 bg-[#FFF7F1] dark:bg-[#19100F] text-xs sm:text-sm text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 rounded-xl focus:outline-none placeholder:text-[#5C3A38]/50 shadow-[2px_2px_0_#382322]"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C3A38] dark:text-[#D4B8A8] hover:text-[#261615] dark:hover:text-[#FDEBDE]"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#FFEBAA] hover:bg-[#ffe58f] disabled:opacity-40 text-[#261615] font-bold text-xs font-mono uppercase tracking-wider border-2 border-[#382322] shadow-[2px_2px_0_#382322] flex items-center gap-1.5 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
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
