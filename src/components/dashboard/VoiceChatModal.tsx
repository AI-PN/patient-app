"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import VoiceProvider from './VoiceProvider';
import VoiceControls from './VoiceControls';
import VoiceMessages from './VoiceMessages';
import { supabase } from '@/utils/supabaseClient';
import { useVoice } from "@humeai/voice-react";

interface VoiceChatModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  navigatorName?: string;
}

export default function VoiceChatModal({
  open,
  onClose,
  patientId,
  navigatorName = 'Patient Navigator'
}: VoiceChatModalProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const isClosingRef = useRef(false);

  // Voice provider wrapper to capture messages for database
  const VoiceWrapper = ({ children }: { children: React.ReactNode }) => {
    const { messages, readyState } = useVoice();
    const messagesRef = useRef(messages);
    
    // Update the ref whenever messages change
    useEffect(() => {
      messagesRef.current = messages;
    }, [messages]);
    
    // Save conversation when call ends or modal closes
    const saveConversation = async () => {
      if (messagesRef.current.length === 0) return;
      
      try {
        const formattedMessages = messagesRef.current
          .filter(msg => msg.type === 'user_message' || msg.type === 'assistant_message')
          .map(msg => {
            // Type guard to ensure we only use message objects with content
            if (msg.type !== 'user_message' && msg.type !== 'assistant_message') {
              return { role: 'unknown', content: 'Message content unavailable' };
            }
            
            return {
              role: msg.type === 'user_message' ? 'user' : 'assistant',
              content: msg.message.content || 'No content'
            };
          });
        
        if (formattedMessages.length === 0) return;
        
        const { data, error } = await supabase
          .from('voice_chats')
          .insert({
            patient_id: patientId,
            started_at: new Date().toISOString(),
            messages: formattedMessages
          })
          .select();
          
        if (error) {
          console.error('Error saving voice chat:', error);
        } else {
          console.log('Voice chat saved:', data);
          setChatId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to save conversation:', err);
      }
    };
    
    // Save on modal close 
    useEffect(() => {
      if (!open && messagesRef.current.length > 0 && !isClosingRef.current) {
        isClosingRef.current = true;
        saveConversation().then(() => {
          isClosingRef.current = false;
        });
      }
    }, [open]);
    
    return <>{children}</>;
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      const getToken = async () => {
        try {
          // Fetch the token from our secure API route
          const response = await fetch('/api/hume-token');
          const data = await response.json();
          
          if (data.error) {
            throw new Error(data.error);
          }
          
          setAccessToken(data.accessToken);
        } catch (err) {
          console.error('Error fetching access token:', err);
          setError('Failed to initialize voice chat. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      getToken();
    }
  }, [open]);

  const handleClose = () => {
    // Close the modal
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
            {/* Chat header */}
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-semibold mr-3">
                  {navigatorName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{navigatorName}</h3>
                  <p className="text-xs text-blue-100">Voice Call</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-blue-100 hover:text-white"
                onClick={handleClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Error message if applicable */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 border-b border-red-100">
                {error}
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500">Initializing voice chat...</p>
              </div>
            ) : accessToken ? (
              <VoiceProvider accessToken={accessToken}>
                <VoiceWrapper>
                  <div className="h-96 overflow-y-auto">
                    <VoiceMessages />
                  </div>
                  <div className="border-t p-4">
                    <VoiceControls onClose={handleClose} />
                  </div>
                </VoiceWrapper>
              </VoiceProvider>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <p className="text-gray-500">Could not initialize voice chat. Please check your credentials.</p>
              </div>
            )}
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
} 