import React from 'react';

export const MessageCard = ({ message, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick(message)}
      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <img
            src={message.avatar}
            alt={message.sender}
            className="w-10 h-10 rounded-full object-cover border border-white/10"
          />
          {message.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F1420]"></span>
          )}
        </div>
        <div className="min-w-0">
          <h5 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {message.sender}
          </h5>
          <p className="text-xs text-slate-400 truncate mt-0.5 max-w-[200px] sm:max-w-xs">
            {message.lastMessage}
          </p>
        </div>
      </div>
      <div className="text-[11px] text-slate-500 shrink-0 pl-2">
        {message.timestamp}
      </div>
    </div>
  );
};

export default MessageCard;
