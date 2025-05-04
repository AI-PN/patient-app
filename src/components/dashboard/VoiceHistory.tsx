"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { PhoneIcon } from '@heroicons/react/24/outline';

interface VoiceHistoryProps {
  patientId: string;
  onStartNewVoiceChat?: () => void;
}

interface VoiceHistoryItem {
  id: string;
  patient_id: string;
  started_at: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export default function VoiceHistory({ patientId, onStartNewVoiceChat }: VoiceHistoryProps) {
  const [voiceChats, setVoiceChats] = useState<VoiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<VoiceHistoryItem | null>(null);

  useEffect(() => {
    async function fetchVoiceHistory() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('voice_chats')
          .select('*')
          .eq('patient_id', patientId)
          .order('started_at', { ascending: false });

        if (error) throw error;
        setVoiceChats(data || []);
      } catch (error) {
        console.error('Error fetching voice chat history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchVoiceHistory();
  }, [patientId]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  // Function to save the voice conversations to database
  async function saveVoiceChat(messages: any[]) {
    try {
      const { data, error } = await supabase
        .from('voice_chats')
        .insert({
          patient_id: patientId,
          started_at: new Date().toISOString(),
          messages: messages
        })
        .select();

      if (error) throw error;
      
      // Refresh the list
      setVoiceChats(prev => [data[0], ...prev]);
      
      return true;
    } catch (error) {
      console.error('Error saving voice chat:', error);
      return false;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Voice Chat History</h2>
        <button
          onClick={onStartNewVoiceChat}
          className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition"
        >
          <PhoneIcon className="h-4 w-4" />
          New Voice Call
        </button>
      </div>

      {loading ? (
        <p className="text-center py-8 text-gray-500">Loading voice chat history...</p>
      ) : voiceChats.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No voice chat history found</p>
          <button
            onClick={onStartNewVoiceChat}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Start Your First Voice Chat
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {voiceChats.map((chat) => (
            <div
              key={chat.id}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => setSelectedChat(chat === selectedChat ? null : chat)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Voice Call</span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(chat.started_at)}</span>
              </div>
              
              {selectedChat?.id === chat.id && chat.messages && (
                <div className="mt-4 space-y-2 border-t pt-3">
                  {chat.messages.map((msg, idx) => (
                    <div key={idx} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-gray-500">{msg.role === 'user' ? 'You' : 'AI'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 