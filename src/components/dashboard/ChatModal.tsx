"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabaseClient';
import VoiceChatModal from './VoiceChatModal';

interface Message {
  id?: string;
  content: string;
  sender: 'Patient' | 'LLM';
  sent_at: string;
}

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  navigatorId?: string;
  chatId?: string; // If continuing an existing chat
  navigatorName?: string;
  debug?: boolean; // Add debug mode
}

const ChatModal: React.FC<ChatModalProps> = ({
  open,
  onClose,
  patientId,
  navigatorId,
  chatId: existingChatId,
  navigatorName = 'Patient Navigator',
  debug = process.env.NODE_ENV !== 'production' // Enable debug by default in non-prod
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | undefined>(existingChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{chunks: string[]}>({ chunks: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);

  // Fetch existing messages if continuing a chat
  useEffect(() => {
    console.log("Chat modal open state changed", { open, existingChatId });
    if (open && existingChatId) {
      fetchMessages(existingChatId);
    } else if (open && !existingChatId) {
      // Add a welcome message for new chats
      console.log("Adding welcome message for new chat");
      setMessages([
        {
          content: `Hello! I'm your patient navigator. How can I help you today?`,
          sender: 'LLM',
          sent_at: new Date().toISOString()
        }
      ]);
      setInitialMessagesLoaded(true);
    }
  }, [open, existingChatId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    console.log("Messages updated", { messageCount: messages.length });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup abortController on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchMessages = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', id)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data);
        setInitialMessagesLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load chat history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseError = (error: any, operation: string) => {
    console.error(`Error during ${operation}:`, error);
    
    // Check if it's a "relation does not exist" error
    const errorMessage = error.message || '';
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      setError('Database tables not set up. Please run the migrations script first.');
    } else {
      setError(`Database error during ${operation}. Chat will continue in local mode only.`);
    }
    
    // Return true to indicate error was handled
    return true;
  };

  // Direct call to Ollama API with manual streaming
  const generateAIResponse = async (userMessages: Array<{role: string, content: string}>) => {
    setIsGenerating(true);
    
    // Create a new LLM message placeholder
    setMessages(prev => [...prev, {
      content: '',
      sender: 'LLM',
      sent_at: new Date().toISOString()
    }]);
    
    // Clear debug info
    if (debug) {
      setDebugInfo({ chunks: [] });
    }
    
    // Create abort controller for fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          messages: userMessages,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is null');
      }

      let fullContent = '';
      let decoder = new TextDecoder();

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Store chunk for debugging
        if (debug) {
          setDebugInfo(prev => ({
            chunks: [...prev.chunks, chunk]
          }));
        }
        
        // Process the chunk
        const lines = chunk.split('\n').filter(Boolean);
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            
            if (parsed.message?.content) {
              fullContent += parsed.message.content;
              
              // Update the last message with the new content
              setMessages(prev => {
                const updatedMessages = [...prev];
                const lastIndex = updatedMessages.length - 1;
                
                if (lastIndex >= 0 && updatedMessages[lastIndex].sender === 'LLM') {
                  updatedMessages[lastIndex] = {
                    ...updatedMessages[lastIndex],
                    content: fullContent
                  };
                }
                
                return updatedMessages;
              });
            }
          } catch (err) {
            console.error('Error parsing chunk:', err);
          }
        }
      }
      
      // Save the response to the database
      if (chatId) {
        saveResponseToDatabase(fullContent);
      }
      
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error('Error generating response:', e);
        setError('Failed to generate AI response. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isGenerating) return;
    
    console.log("Sending message", { message, chatId });
    
    // Clear any previous errors
    setError(null);

    const newMessage: Message = {
      content: message,
      sender: 'Patient',
      sent_at: new Date().toISOString()
    };

    // Add message to local state immediately for UI
    setMessages(prev => {
      console.log("Adding user message to state", { newMessage, prevCount: prev.length });
      return [...prev, newMessage];
    });
    
    // Store message content before clearing the input
    const messageContent = message;
    
    // Clear the input field
    setMessage('');

    try {
      // Save message to database
      await handleDatabaseOperations(messageContent, newMessage);
      
      // Convert messages to the format expected by Ollama
      const formattedMessages = messages.map(msg => ({
        role: msg.sender === 'Patient' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Add the new message
      formattedMessages.push({
        role: 'user',
        content: messageContent
      });
      
      // Generate AI response
      await generateAIResponse(formattedMessages);
      
    } catch (error) {
      console.error('Error in send message flow:', error);
      setError('An error occurred. Your message may not have been sent correctly.');
    }
  };

  // Extracted database operations to a separate function for clarity
  const handleDatabaseOperations = async (messageContent: string, newMessage: Message) => {
    // If no chat exists yet, create one
    if (!chatId) {
      try {
        const { data: chatData, error: chatError } = await supabase
          .from('chats')
          .insert({
            patient_id: patientId,
            navigator_id: navigatorId || null,
            started_at: new Date().toISOString(),
            last_activity_at: new Date().toISOString()
          })
          .select();

        if (chatError) {
          handleDatabaseError(chatError, 'creating chat');
        } else if (chatData && chatData.length > 0) {
          const newChatId = chatData[0].chat_id;
          setChatId(newChatId);
          
          try {
            // Save messages to the new chat
            await Promise.all([
              supabase.from('messages').insert({
                chat_id: newChatId,
                content: messageContent,
                sender: 'Patient',
                sent_at: new Date().toISOString()
              }),
              // Also save the welcome message if it exists
              messages.length > 0 && messages[0].sender === 'LLM' ? 
                supabase.from('messages').insert({
                  chat_id: newChatId,
                  content: messages[0].content,
                  sender: 'LLM',
                  sent_at: messages[0].sent_at
                }) : 
                Promise.resolve()
            ]);
          } catch (msgError) {
            handleDatabaseError(msgError, 'saving messages');
          }
        }
      } catch (createError) {
        handleDatabaseError(createError, 'chat creation');
      }
    } else {
      // Chat already exists, just add the message
      try {
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            content: messageContent,
            sender: 'Patient',
            sent_at: new Date().toISOString()
          });
          
        if (msgError) {
          handleDatabaseError(msgError, 'adding message');
        } else {
          // Update last activity time
          await supabase
            .from('chats')
            .update({ last_activity_at: new Date().toISOString() })
            .eq('chat_id', chatId);
        }
      } catch (saveError) {
        handleDatabaseError(saveError, 'saving message');
      }
    }
  };

  // Save the AI response to the database
  const saveResponseToDatabase = async (content: string) => {
    if (!chatId || !content) return;
    
    console.log("Saving AI response to database", { 
      chatId, 
      contentLength: content.length 
    });
    
    try {
      // Check if this exact response is already saved to avoid duplicates
      const { data: existingMessages, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .eq('content', content)
        .eq('sender', 'LLM');
        
      if (fetchError) {
        console.error('Error checking for existing messages:', fetchError);
        return;
      }
      
      // Only insert if this exact message doesn't exist yet
      if (!existingMessages || existingMessages.length === 0) {
        console.log("Inserting new AI message in database");
        const { error: insertError } = await supabase
          .from('messages')
          .insert({
            chat_id: chatId,
            content: content,
            sender: 'LLM',
            sent_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('Error saving AI response:', insertError);
        } else {
          console.log("Successfully saved AI response to database");
          
          // Update last activity time for the chat
          const { error: updateError } = await supabase
            .from('chats')
            .update({ last_activity_at: new Date().toISOString() })
            .eq('chat_id', chatId);
            
          if (updateError) {
            console.error('Error updating chat activity time:', updateError);
          }
        }
      } else {
        console.log("AI message already exists in database, skipping insert");
      }
    } catch (error) {
      console.error('Error in saveResponseToDatabase function:', error);
    }
  };

  // Render typing indicator with animation
  const renderTypingIndicator = (isLast: boolean) => {
    if (isGenerating && isLast) {
      return (
        <div className="flex space-x-1 items-center">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      );
    }
    return null;
  };
  
  // Render debug info
  const renderDebugInfo = () => {
    if (!debug) return null;
    
    return (
      <div className="border-t border-gray-200 p-2 text-xs bg-gray-800 text-gray-300 overflow-auto" style={{ maxHeight: '200px' }}>
        <details>
          <summary className="cursor-pointer">Stream Debug Info ({debugInfo.chunks.length} chunks)</summary>
          <div className="mt-2 space-y-2">
            {debugInfo.chunks.map((chunk, idx) => (
              <div key={idx} className="p-1 border border-gray-700 rounded">
                <div className="font-bold">Chunk {idx+1}:</div>
                <pre className="whitespace-pre-wrap overflow-x-auto">{chunk}</pre>
              </div>
            ))}
          </div>
        </details>
      </div>
    );
  };

  return (
    <>
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
                <div className="flex items-center space-x-2">
                  {/* Voice Call Button */}
                  <button
                    type="button"
                    className="rounded-md p-1 text-blue-100 hover:text-white bg-green-600 hover:bg-green-700"
                    onClick={() => setVoiceChatOpen(true)}
                    title="Start voice call"
                  >
                    <PhoneIcon className="h-6 w-6" />
                  </button>
                  {/* Close Button */}
                  <button
                    type="button"
                    className="rounded-md p-1 text-blue-100 hover:text-white"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Error message if applicable */}
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 border-b border-red-100">
                  {error}
                </div>
              )}

              {/* Messages container */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-50">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => {
                      const isLastMessage = index === messages.length - 1;
                      const isLLMMessage = msg.sender === 'LLM';
                      
                      return (
                        <div
                          key={index}
                          className={`mb-4 flex ${msg.sender === 'Patient' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              msg.sender === 'Patient'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {msg.content ? (
                              <p className="text-sm">{msg.content}</p>
                            ) : (
                              isLLMMessage && isLastMessage && isGenerating ? (
                                <div className="text-sm">
                                  {renderTypingIndicator(isLastMessage)}
                                </div>
                              ) : (
                                <p className="text-sm">{msg.content}</p>
                              )
                            )}
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Debug info */}
              {renderDebugInfo()}

              {/* Message input */}
              <div className="border-t p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isGenerating}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!message.trim() || isGenerating}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
      
      {/* Voice Chat Modal */}
      <VoiceChatModal
        open={voiceChatOpen}
        onClose={() => setVoiceChatOpen(false)}
        patientId={patientId}
        navigatorName={navigatorName}
      />
    </>
  );
};

export default ChatModal; 