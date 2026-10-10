import React, { useState, useEffect } from 'react';
import { Send, Paperclip, Phone, Video, Search, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import SEO from '../../components/common/SEO';
import { messageService } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PFP } from '../../constants/assets';

export const Messages = () => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    const loadConversations = async () => {
      const data = await messageService.getMessages(currentUserId);
      setConversations(data || []);
      if (data && data.length > 0 && window.innerWidth >= 768) {
        setActiveChat(data[0]);
      }
    };
    loadConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (!activeChat?.id) return;
    const fetchChatMessages = async () => {
      setIsLoadingMessages(true);
      const msgs = await messageService.getConversationMessages(activeChat.id, currentUserId);
      setMessages(msgs || []);
      setIsLoadingMessages(false);
    };
    fetchChatMessages();
  }, [activeChat?.id, currentUserId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeChat?.id) return;
    const textToSend = inputMsg.trim();
    setInputMsg('');

    const tempMsg = { id: `temp-${Date.now()}`, sender: 'me', text: textToSend, time: 'Just now' };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await messageService.sendMessage(activeChat.id, textToSend);
    } catch (err) {
      console.error('Failed to send message via API:', err);
    }
  };

  return (
    <div className="glass-card h-[calc(100vh-140px)] flex border border-white/[0.08] overflow-hidden">
      <SEO
        title="Client Messages"
        description="Communicate with creators directly, clarify editing directions, and exchange updates."
      />

      {/* Conversations List */}
      <div
        className={`${
          activeChat ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 border-r border-white/[0.07] bg-[#0A0D15]/90 flex-col shrink-0`}
      >
        <div className="p-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-white mb-2">Client Messages</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#141A28] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveChat(c)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                activeChat?.id === c.id ? 'bg-purple-900/20 border-l-2 border-purple-500' : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={c.avatar || DEFAULT_PFP}
                  alt={c.sender ? `${c.sender} avatar` : 'Client avatar'}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {c.online && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-[#0A0D15]"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">{c.sender}</h4>
                  <span className="text-[10px] text-slate-500">{c.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                <span className="text-[10px] text-purple-400 font-medium block truncate mt-0.5">{c.project}</span>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No active conversations yet
            </div>
          )}
        </div>
      </div>

      {/* Chat Thread */}
      {activeChat ? (
        <div
          className={`${
            activeChat ? 'flex' : 'hidden md:flex'
          } flex-1 flex flex-col bg-[#0F1422]/60 min-w-0`}
        >
          <div className="p-3.5 sm:p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0F1420]">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveChat(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <img
                src={activeChat.avatar || DEFAULT_PFP}
                alt={activeChat.sender ? `${activeChat.sender} avatar` : 'Active conversation avatar'}
                loading="lazy"
                onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{activeChat.sender}</h4>
                <p className="text-xs text-slate-400 truncate">Project: {activeChat.project}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button className="p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06]">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06]">
                <Video className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
            {messages.map((item) => {
              const isMe = Boolean(
                item.sender === 'me' ||
                (currentUserId && item.senderId && String(item.senderId) === String(currentUserId))
              );

              return (
                <div key={item.id} className={`w-full flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-br-xs shadow-md shadow-blue-900/30'
                        : 'bg-[#182030] text-slate-100 rounded-bl-xs border border-white/[0.08]'
                    }`}
                  >
                    <p>{item.text}</p>
                    <span className={`text-[10px] block mt-1 text-right font-mono ${isMe ? 'text-sky-200' : 'text-slate-400'}`}>
                      {item.time}
                    </span>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center py-12">
                No messages yet. Send a message to start chatting!
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 sm:p-3.5 border-t border-white/[0.06] bg-[#0A0D15] flex items-center gap-2">
            <button type="button" className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04]">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Reply to client..."
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#141A28] text-xs text-white border border-white/[0.08] focus:outline-none focus:border-purple-500"
            />
            <Button type="submit" variant="primary" size="sm" icon={Send}>
              Send
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-[#0F1422]/60 text-slate-500 text-sm">
          Select a conversation to start chatting
        </div>
      )}
    </div>
  );
};

export default Messages;
