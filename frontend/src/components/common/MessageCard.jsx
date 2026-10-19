import React from 'react';
import { DEFAULT_PFP } from '../../constants/assets';

export const MessageCard = ({ message, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick(message)}
      className="flex items-center justify-between p-3 border-b-2 border-[#382322]/10 dark:border-[#FDEBDE]/10 hover:bg-[#FFF7F1] dark:hover:bg-[#2A1B19] transition-colors cursor-pointer group text-[#261615] dark:text-[#FDEBDE]"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          <img
            src={message.avatar || DEFAULT_PFP}
            alt={message.sender || 'Message sender'}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = DEFAULT_PFP; }}
            className="w-10 h-10 object-cover border-2 border-[#382322] dark:border-[#FDEBDE]/30 shadow-[2px_2px_0_#382322]"
          />
          {message.online && (
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#059669] border-2 border-[#382322]"></span>
          )}
        </div>
        <div className="min-w-0">
          <h5 className="text-sm font-serif font-bold text-[#261615] dark:text-[#FDEBDE] truncate group-hover:underline">
            {message.sender}
          </h5>
          <p className="text-xs text-[#5C3A38] dark:text-[#D4B8A8] truncate mt-0.5 max-w-[200px] sm:max-w-xs font-sans">
            {message.lastMessage}
          </p>
        </div>
      </div>
      <div className="text-[11px] font-mono text-[#5C3A38] dark:text-[#D4B8A8] shrink-0 pl-2">
        {message.timestamp}
      </div>
    </div>
  );
};

export default MessageCard;
