import React from "react";
import { ChatBubbleLeftRightIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface Chat {
  avatarUrl?: string | null;
  name: string;
  role: string;
  date: string;
  preview: string;
  onView: () => void;
}

interface ChatHistoryListProps {
  chats: Chat[];
}

const ChatHistoryItem: React.FC<Chat> = ({ avatarUrl, name, role, date, preview, onView }) => {
  // Get initials for avatar fallback
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
    
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow transition-shadow border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-start gap-3">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={name} 
                className="w-10 h-10 rounded-full object-cover border border-blue-100 shadow-sm" 
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                {initials}
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-900">{name}</div>
              <div className="text-xs text-blue-600 font-medium">{role}</div>
            </div>
          </div>
          <div className="text-xs text-gray-400 whitespace-nowrap">{date}</div>
        </div>
        
        <div className="mt-3 flex gap-3">
          <div className="w-10 flex-shrink-0"></div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100">
              {preview}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onView}
            className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors flex items-center gap-1 shadow-sm"
          >
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            <span>View Conversation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ chats }) => {
  return (
    <div className="bg-transparent">
      {chats.length === 0 ? (
        <div className="text-gray-400 text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <ChatBubbleLeftRightIcon className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <div>No chat history</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {chats.map((chat, idx) => (
            <ChatHistoryItem key={idx} {...chat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistoryList; 