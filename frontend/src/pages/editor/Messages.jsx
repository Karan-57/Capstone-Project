import React, { useState } from 'react';
import { Send, Paperclip, Phone, Video, Search } from 'lucide-react';
import Button from '../../components/common/Button';

export const Messages = () => {
  const [conversations] = useState([
    {
      id: 'ed-msg-1',
      sender: 'Nexus Media Corp',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      project: 'Deep Dive: AI Revolution 2026',
      lastMessage: 'Loved the opening hook on version 1!',
      timestamp: '2h ago',
      online: true,
    },
    {
      id: 'ed-msg-2',
      sender: 'Chloe Adams',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      project: 'Viral Reel Pack (Weekly Drop)',
      lastMessage: 'Can you render the subtitles in yellow?',
      timestamp: 'Yesterday',
      online: false,
    },
    {
      id: 'ed-msg-3',
      sender: 'CloudFlow Labs',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      project: 'SaaS Product Walkthrough Demo',
      lastMessage: 'Final payment released into escrow.',
      timestamp: '3 days ago',
      online: true,
    },
  ]);

  const [activeChat, setActiveChat] = useState(conversations[0]);
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Hey Alex! Loved the opening hook on version 1! Just punch up the sound effects around 01:20.', time: '2:15 PM' },
    { id: 2, sender: 'me', text: 'On it! Adding whooshes and riser tension before the chart transition.', time: '2:30 PM' },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'me', text: inputMsg, time: 'Just now' }]);
    setInputMsg('');
  };

  return (
    <div className="glass-card h-[calc(100vh-160px)] flex border border-white/[0.08] overflow-hidden">
      {/* Conversations */}
      <div className="w-80 border-r border-white/[0.07] bg-[#0A0D15]/90 flex flex-col">
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
                <span className="text-[10px] text-purple-400 font-medium block truncate mt-0.5">{c.project}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 flex flex-col bg-[#0F1422]/60">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-[#0F1420]">
          <div className="flex items-center gap-3">
            <img src={activeChat.avatar} alt={activeChat.sender} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h4 className="text-sm font-bold text-white">{activeChat.sender}</h4>
              <p className="text-xs text-slate-400">Project: {activeChat.project}</p>
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

        <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
          {messages.map((item) => (
            <div key={item.id} className={`flex ${item.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                  item.sender === 'me'
                    ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-900/30'
                    : 'bg-[#182030] text-slate-200 rounded-tl-none border border-white/[0.05]'
                }`}
              >
                <p>{item.text}</p>
                <span className={`text-[10px] block mt-1 text-right ${item.sender === 'me' ? 'text-purple-200' : 'text-slate-400'}`}>
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-3.5 border-t border-white/[0.06] bg-[#0A0D15] flex items-center gap-2">
          <button type="button" className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04]">
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            placeholder="Reply to client..."
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
