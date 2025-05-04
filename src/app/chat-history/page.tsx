"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { supabase } from "@/utils/supabaseClient";
import ChatHistoryList from "@/components/dashboard/ChatHistoryList";
import MobileBottomNav from "@/components/MobileBottomNav";
import ChatModal from "@/components/dashboard/ChatModal";
import { SearchFilter } from '@/components/ui/FilterInput';

const CHATS_PER_PAGE = 5;

const ChatHistoryPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [patientId, setPatientId] = useState("");
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndChats = async () => {
      // Fetch user info
      const { data: patients } = await supabase
        .from("patients")
        .select("name, patient_id")
        .limit(1);
      let patientId = "";
      if (patients && patients.length > 0) {
        setUserName(patients[0].name);
        setUserInitials(
          patients[0].name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
        );
        setAvatarUrl(null); // Add avatar logic if available
        patientId = patients[0].patient_id;
        setPatientId(patientId);
      }
      
      // Fetch chats for this patient
      fetchChats(patientId);
    };
    fetchUserAndChats();
  }, []);

  const fetchChats = async (id: string) => {
    if (!id) return;
    
    const { data: chatsData } = await supabase
      .from("chats")
      .select("chat_id, started_at, last_activity_at, patient_id, messages(content, sent_at, sender), navigators(name, email)")
      .eq("patient_id", id)
      .order("last_activity_at", { ascending: false });
    
    if (chatsData && chatsData.length > 0) {
      const chatList = chatsData.map((chat: { chat_id: string; started_at: string; last_activity_at: string; patient_id: string; messages: { content: string; sent_at: string; sender: string }[]; navigators: { name: string; email: string }[] }) => {
        const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
        return {
          chatId: chat.chat_id,
          navigatorId: null,
          navigatorName: chat.navigators?.[0]?.name || "Navigator",
          avatarUrl: null, // Optionally use email hash or static
          name: chat.navigators?.[0]?.name || "Navigator",
          role: "Patient Navigator",
          date: lastMessage?.sent_at ? new Date(lastMessage.sent_at).toLocaleDateString() : "-",
          preview: lastMessage?.content || "No messages yet.",
          onView: () => {
            setSelectedChat({
              chatId: chat.chat_id,
              navigatorName: chat.navigators?.[0]?.name || "Navigator",
              navigatorId: null
            });
            setChatModalOpen(true);
          },
        };
      });
      setChats(chatList);
    } else {
      setChats([]);
    }
    setLoading(false);
  };

  // Filter and paginate chats
  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(search.toLowerCase()) ||
      chat.preview.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredChats.length / CHATS_PER_PAGE) || 1;
  const paginatedChats = filteredChats.slice(
    (page - 1) * CHATS_PER_PAGE,
    page * CHATS_PER_PAGE
  );

  // Reset to page 1 if search changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  const handleChatClosed = () => {
    setChatModalOpen(false);
    setNewChatModalOpen(false);
    fetchChats(patientId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <DashboardHeader userName={userName} userInitials={userInitials} avatarUrl={avatarUrl} />
      <div className="flex-1 flex w-full">
        <DashboardSidebar activeItem="Chat History" />
        <main className="flex-1 bg-gray-50 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto lg:pb-8 pb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Chat History</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <SearchFilter
                placeholder="Search chats..."
                value={search}
                onChange={setSearch}
                className="w-full md:w-64"
              />
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition text-sm w-full sm:w-auto"
                onClick={() => setNewChatModalOpen(true)}
              >
                Start New Chat
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <ChatHistoryList chats={paginatedChats} />
            {/* Pagination controls */}
            <div className="flex justify-center flex-wrap mt-6 gap-1">
              <button
                className="px-3 py-1 rounded bg-white text-gray-500 font-semibold text-sm mx-1 border border-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded font-semibold text-sm mx-1 border border-gray-200 ${page === i + 1 ? "bg-blue-50 text-blue-700" : "bg-white text-gray-500"}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-white text-gray-500 font-semibold text-sm mx-1 border border-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
      <DashboardFooter />
      <MobileBottomNav />
      
      {/* Chat modals */}
      {selectedChat && (
        <ChatModal
          open={chatModalOpen}
          onClose={handleChatClosed}
          patientId={patientId}
          navigatorId={selectedChat.navigatorId}
          chatId={selectedChat.chatId}
          navigatorName={selectedChat.navigatorName}
        />
      )}
      
      <ChatModal
        open={newChatModalOpen}
        onClose={handleChatClosed}
        patientId={patientId}
      />
    </div>
  );
};

export default ChatHistoryPage; 