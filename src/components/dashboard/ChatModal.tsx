import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabaseClient';

interface Message {
  id?: string;
  content: string;
  sender: 'patient' | 'navigator';
  sent_at: string;
}

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  navigatorId?: string;
  chatId?: string; // If continuing an existing chat
  navigatorName?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({
  open,
  onClose,
  patientId,
  navigatorId,
  chatId: existingChatId,
  navigatorName = 'Patient Navigator'
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | undefined>(existingChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages if continuing a chat
  useEffect(() => {
    if (open && existingChatId) {
      fetchMessages(existingChatId);
    } else if (open && !existingChatId) {
      // Add a welcome message for new chats
      setMessages([
        {
          content: `Hello! I'm your patient navigator. How can I help you today?`,
          sender: 'navigator',
          sent_at: new Date().toISOString()
        }
      ]);
    }
  }, [open, existingChatId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', id)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      if (data) setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      content: message,
      sender: 'patient',
      sent_at: new Date().toISOString()
    };

    // Add message to local state immediately for UI
    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    try {
      // If no chat exists yet, create one
      if (!chatId) {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            patient_id: patientId,
            navigator_id: navigatorId || null,
            started_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
          })
          .select();

        if (chatError) throw chatError;
        if (chatData && chatData.length > 0) {
          setChatId(chatData[0].chat_id);
          
          // Now save the message with the new chat ID
          const { error: msgError } = await supabase
            .from('messages')
            .insert({
              chat_id: chatData[0].chat_id,
              content: message,
              sender: 'patient',
              sent_at: new Date().toISOString()
            });
            
          if (msgError) throw msgError;
          
          // Also save the welcome message
          await supabase.from('messages').insert({
            chat_id: chatData[0].chat_id,
            content: messages[0].content,
            sender: 'navigator',
            sent_at: messages[0].sent_at
          });
        }
      } else {
        // Chat already exists, just add the message
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            content: message,
            sender: 'patient',
            sent_at: new Date().toISOString()
          });
          
        if (msgError) throw msgError;
        
        // Update last activity time
        await supabase
          .from('chats')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('chat_id', chatId);
      }

      // Simulate navigator response after a delay
      setTimeout(() => {
        const responseMessage: Message = {
          content: getRandomResponse(),
          sender: 'navigator',
          sent_at: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, responseMessage]);
        
        // Save navigator response to database
        if (chatId) {
          supabase.from('messages').insert({
            chat_id: chatId,
            content: responseMessage.content,
            sender: 'navigator',
            sent_at: responseMessage.sent_at
          });
        }
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Helper for demo responses
  const getRandomResponse = () => {
    const responses = [
      "I'll check that information for you right away.",
      "Let me connect you with a specialist who can help with that.",
      "Your appointment has been confirmed. Is there anything else you need?",
      "I've updated your records with this information.",
      "That's a great question. Here's what you need to know...",
      "I understand your concern. Let's find a solution together.",
      "I've sent the prescription refill request to your pharmacy.",
      "Your test results should be available in 2-3 business days."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
                  <p className="text-xs text-blue-100">Patient Navigator</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-blue-100 hover:text-white"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Messages container */}
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-500">Loading messages...</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg px-4 py-2 ${
                          msg.sender === 'patient'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message input */}
            <div className="border-t p-4">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                  disabled={!message.trim()}
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ChatModal; 