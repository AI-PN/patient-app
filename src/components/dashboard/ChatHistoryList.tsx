import React from "react";

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

const ChatHistoryItem: React.FC<Chat> = ({ avatarUrl, name, role, date, preview, onView }) => (
  <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 mb-3">
    <div className="flex items-center gap-3 flex-shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover border" />
      ) : (
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg border">{name.charAt(0)}</div>
      )}
      <div>
        <div className="font-semibold text-gray-900 text-base leading-tight">{name}</div>
        <div className="text-xs text-gray-500">{role}</div>
      </div>
    </div>
    <div className="flex-1 flex flex-col gap-1">
      <div className="text-xs text-gray-400">{date}</div>
      <div className="text-sm text-gray-700 line-clamp-2">{preview}</div>
    </div>
    <button
      onClick={onView}
      className="mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition self-start md:self-center"
    >
      View Full Conversation
    </button>
  </div>
);

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ chats }) => {
  return (
    <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 min-h-[120px]">
      <div className="text-sm text-gray-500 font-medium mb-2">Chat History</div>
      {chats.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No chat history</div>
      ) : (
        <div className="flex flex-col gap-2">
          {chats.map((chat, idx) => (
            <ChatHistoryItem key={idx} {...chat} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ChatHistoryList; 