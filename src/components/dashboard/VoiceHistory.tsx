"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { PhoneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
  const [syncing, setSyncing] = useState(false);
  const [selectedChat, setSelectedChat] = useState<VoiceHistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch voice history from local database
  async function fetchLocalHistory() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('voice_chats')
        .select('*')
        .eq('patient_id', patientId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching local voice chat history:', error);
      setError('Failed to load voice history');
      return [];
    } finally {
      setLoading(false);
    }
  }

  // Function to fetch and sync history from Hume API
  async function syncWithHumeAPI() {
    try {
      setSyncing(true);
      const response = await fetch('/api/hume-history');
      
      if (!response.ok) {
        let errorMessage = 'Failed to sync with Hume';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If JSON parsing fails, try to get the text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        console.error('Error response from Hume API:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Successfully synced with Hume API:', data);
      return true;
    } catch (error) {
      console.error('Error syncing with Hume API:', error);
      setError('Failed to sync with Hume API: ' + (error instanceof Error ? error.message : String(error)));
      return false;
    } finally {
      setSyncing(false);
    }
  }

  // Combined function to load all history
  async function loadAllHistory() {
    setLoading(true);
    setError(null);
    
    try {
      // First try to sync with Hume API
      await syncWithHumeAPI();
      
      // Then fetch local data (which should now include synced Hume data)
      const localData = await fetchLocalHistory();
      setVoiceChats(localData);
    } catch (error) {
      console.error('Error loading voice history:', error);
      setError('Failed to load voice history');
    } finally {
      setLoading(false);
    }
  }

  // Load history on component mount
  useEffect(() => {
    loadAllHistory();
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
        <div className="flex gap-2">
          <button
            onClick={loadAllHistory}
            className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition"
            disabled={syncing || loading}
          >
            <ArrowPathIcon className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync with Hume'}
          </button>
          <button
            onClick={onStartNewVoiceChat}
            className="flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition"
          >
            <PhoneIcon className="h-4 w-4" />
            New Voice Call
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{formatDate(chat.started_at)}</span>
                  <a 
                    href={`https://app.hume.ai/empathic-voice/chat-history/${chat.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on Hume
                  </a>
                </div>
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