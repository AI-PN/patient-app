"use client";

import React from 'react';
import { useVoice } from "@humeai/voice-react";

export default function VoiceMessages() {
  const { messages } = useVoice();

  return (
    <div className="space-y-4 p-4">
      {messages.map((msg, index) => {
        if (msg.type === "user_message" || msg.type === "assistant_message") {
          const isUser = msg.type === "user_message";
          return (
            <div
              key={msg.type + index}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {isUser ? 'You' : 'AI'} (voice)
                </p>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
} 