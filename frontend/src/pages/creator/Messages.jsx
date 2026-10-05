import React, { useState } from 'react';
import { Send, Paperclip, Phone, Video, Search, CheckCheck, Play, Pause, Smile, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import { messagesData } from '../../services/messageService';

export const Messages = () => {
  const [conversations, setConversations] = useState(messagesData);
  const [activeChat, setActiveChat] = useState(messagesData[0]);
  const [inputMsg, setInputMsg] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, sender: 'them', text: 'Hey Jason! I reviewed the raw footage you sent yesterday.', time: '10:20 AM' },
    { id: 2, sender: 'me', text: 'Awesome! Did the 4K audio tracks come through properly without clipping?', time: '10:24 AM' },
    { id: 3, sender: 'them', text: "Yes, crystal clear! Hey! How's the progress on the storyboard?", time: '10:30 AM', reactions: ['🔥', '👍'] },
    { id: 4, sender: 'them', isVoice: true, duration: '0:34', time: '10:32 AM' },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatHistory([
      ...chatHistory,
      { id: Date.now(), sender: 'me', text: inputMsg, time: 'Just now' }
    ]);
    setInputMsg('');
  };

  const addReaction = (msgId, emoji) => {
    setChatHistory(prev =>
      prev.map(m =>
        m.id === msgId
          ? { ...m, reactions: [...(m.reactions || []), emoji] }
          : m
      )
    );
  };

  return (
    <div className="glass-panel h-[calc(100vh-140px)] flex border border-white/[0.08] overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-white/[0.07] bg-[#07090F]/90 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-white mb-2">Collaboration Workspace</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search conversations..."
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
                activeChat?.id === c.id
                  ? 'bg-purple-900/20 border-l-2 border-purple-500'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="relative shrink-0">
                <img src={c.avatar} alt={c.sender} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                {c.online && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-[#0A0D15] shadow-[0_0_6px_#34D399]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white truncate">{c.sender}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{c.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{c.lastMessage}</p>
                <span className="text-[10px] text-purple-400 font-semibold block truncate mt-0.5">
                  {c.project}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col bg-[#0A0D15]/60 min-w-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0C101C]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <img src={activeChat.avatar} alt={activeChat.sender} className="w-10 h-10 rounded-full object-cover border border-purple-500/30" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">{activeChat.sender}</h4>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Active Project: <strong className="text-purple-300 font-medium">{activeChat.project}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06]">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06]">
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {chatHistory.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col ${item.sender === 'me' ? 'items-end' : 'items-start'} group`}
            >
              {item.isVoice ? (
                /* Voice Note Bubble */
                <div className="p-3.5 rounded-2xl bg-[#141A28] border border-white/[0.08] flex items-center gap-3 text-xs">
                  <button
                    onClick={() => setIsPlayingVoice(!isPlayingVoice)}
                    className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md"
                  >
                    {isPlayingVoice ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>

                  <div className="flex items-center gap-1">
                    {[12, 24, 18, 30, 20, 14, 28, 16, 22, 10, 18].map((h, i) => (
                      <span
                        key={i}
                        className={`w-1 rounded-full transition-all ${
                          isPlayingVoice ? 'bg-purple-400 animate-pulse' : 'bg-slate-600'
                        }`}
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{item.duration}</span>
                </div>
              ) : (
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed relative ${
                    item.sender === 'me'
                      ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-900/30'
                      : 'bg-[#151C2C] text-slate-200 rounded-tl-none border border-white/[0.06]'
                  }`}
                >
                  <p>{item.text}</p>
                  <span
                    className={`text-[10px] block mt-1 text-right font-mono ${
                      item.sender === 'me' ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    {item.time}
                  </span>
                </div>
              )}

              {/* Reaction Badges */}
              {item.reactions && item.reactions.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {item.reactions.map((r, i) => (
                    <span key={i} className="px-1.5 py-0.5 text-[10px] bg-[#1E2638] rounded-full border border-white/[0.08]">
                      {r}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick emoji reaction bar on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 text-xs">
                {['👍', '🔥', '❤️', '🚀'].map((em) => (
                  <button
                    key={em}
                    onClick={() => addReaction(item.id, em)}
                    className="hover:scale-125 transition-transform px-1"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-400 italic pt-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>{activeChat.sender} is typing timeline notes...</span>
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3.5 border-t border-white/[0.06] bg-[#07090F] flex items-center gap-2">
          <button
            type="button"
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04]"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder="Type your feedback or specify frame timestamps (e.g. 02:14)..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#141A28] text-xs text-white border border-white/[0.08] focus:outline-none focus:border-purple-500"
          />
          <Button type="submit" variant="primary" size="sm" icon={Send}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
