import React, { useState } from 'react';
import { Send, Paperclip, Phone, Video, Search, PhoneOff, Mic, MicOff } from 'lucide-react';
import Button from '../../components/common/Button';
import { messagesData } from '../../services/messageService';

export const Messages = () => {
  const [conversations] = useState(messagesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(messagesData[0]);
  const [inputMsg, setInputMsg] = useState('');
  const [callingType, setCallingType] = useState(null); // 'audio' | 'video' | null
  const [isMuted, setIsMuted] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'them', text: 'Hey Jason! I reviewed the raw footage you sent yesterday.', time: '10:20 AM' },
    { id: 2, sender: 'me', text: 'Awesome! Did the 4K audio tracks come through properly without clipping?', time: '10:24 AM' },
    { id: 3, sender: 'them', text: "Yes, crystal clear! Hey! How's the progress on the storyboard?", time: '10:30 AM' },
  ]);

  const filteredConversations = conversations.filter(c =>
    c.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() && !attachedFile) return;

    const messageText = attachedFile
      ? `${inputMsg ? inputMsg + ' ' : ''}[Attached: ${attachedFile}]`
      : inputMsg;

    setChatHistory(prev => [
      ...prev,
      { id: Date.now(), sender: 'me', text: messageText, time: 'Just now' }
    ]);
    setInputMsg('');
    setAttachedFile(null);
  };

  return (
    <div className="glass-card h-[calc(100vh-160px)] flex border border-white/[0.08] overflow-hidden relative">
      {/* Conversations List */}
      <div className="w-80 border-r border-white/[0.07] bg-[#0A0D15]/90 flex flex-col">
        <div className="p-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-white mb-2">Conversations</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#141A28] text-slate-200 border border-white/[0.08] focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
          {filteredConversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveChat(c)}
              className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                activeChat?.id === c.id
                  ? 'bg-purple-900/20 border-l-2 border-purple-500'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="relative shrink-0">
                <img src={c.avatar} alt={c.sender} className="w-10 h-10 rounded-full object-cover" />
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
                <span className="text-[10px] text-purple-400 font-medium block truncate mt-0.5">
                  {c.project}
                </span>
              </div>
            </div>
          ))}

          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col bg-[#0F1422]/60 relative">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0F1420]">
          <div className="flex items-center gap-3">
            <img src={activeChat.avatar} alt={activeChat.sender} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h4 className="text-sm font-bold text-white">{activeChat.sender}</h4>
              <p className="text-xs text-slate-400">Project: {activeChat.project}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCallingType('audio')}
              title="Start Voice Call"
              className="p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white hover:bg-purple-600/20 border border-white/[0.06] transition-all"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCallingType('video')}
              title="Start Screen & Video Call"
              className="p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white hover:bg-purple-600/20 border border-white/[0.06] transition-all"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
          {chatHistory.map((item) => (
            <div
              key={item.id}
              className={`flex ${item.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                  item.sender === 'me'
                    ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-900/30'
                    : 'bg-[#182030] text-slate-200 rounded-tl-none border border-white/[0.05]'
                }`}
              >
                <p>{item.text}</p>
                <span
                  className={`text-[10px] block mt-1 text-right ${
                    item.sender === 'me' ? 'text-purple-200' : 'text-slate-400'
                  }`}
                >
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Attachment preview banner if selected */}
        {attachedFile && (
          <div className="px-4 py-2 bg-purple-950/40 border-t border-purple-800/30 flex items-center justify-between text-xs text-purple-200">
            <span>Attached file: <strong>{attachedFile}</strong></span>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-purple-400 hover:text-white text-xs underline"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3.5 border-t border-white/[0.06] bg-[#0A0D15] flex items-center gap-2">
          <button
            type="button"
            title="Attach file or timestamp LUT"
            onClick={() => setAttachedFile('frame_revisions_01-20.mp4')}
            className={`p-2.5 rounded-xl transition-colors ${
              attachedFile ? 'text-purple-400 bg-purple-500/20' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder="Type your message or share timeline timestamp..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#141A28] text-xs text-white border border-white/[0.08] focus:outline-none focus:border-purple-500"
          />
          <Button type="submit" variant="primary" size="sm" icon={Send}>
            Send
          </Button>
        </form>

        {/* Interactive Studio Calling Modal Overlay */}
        {callingType && (
          <div className="absolute inset-0 z-30 bg-[#070A12]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in text-center">
            <div className="relative mb-6">
              <img
                src={activeChat.avatar}
                alt={activeChat.sender}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500 shadow-2xl animate-pulse"
              />
              <span className="w-5 h-5 rounded-full bg-emerald-500 absolute bottom-1 right-1 ring-4 ring-[#070A12]"></span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {callingType === 'video' ? 'Live Timeline Review with' : 'Encrypted Audio Call with'} {activeChat.sender}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Connected via Collabo Low-Latency Studio Stream • 1080p 60fps Bitrate
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-full transition-all ${
                  isMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setCallingType(null)}
                className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-900/40 transition-transform active:scale-95"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
