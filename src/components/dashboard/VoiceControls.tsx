"use client";

import React from 'react';
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { PhoneIcon, PhoneXMarkIcon } from '@heroicons/react/24/outline';

interface VoiceControlsProps {
  onClose?: () => void;
}

export default function VoiceControls({ onClose }: VoiceControlsProps) {
  const { connect, disconnect, readyState } = useVoice();

  const startCall = () => {
    connect()
      .then(() => {
        console.log("Voice connection established");
      })
      .catch((error) => {
        console.error("Failed to establish voice connection:", error);
      });
  };

  const endCall = () => {
    disconnect();
    if (onClose) {
      onClose();
    }
  };

  const isConnected = readyState === VoiceReadyState.OPEN;
  const isConnecting = readyState === VoiceReadyState.CONNECTING;

  return (
    <div className="flex justify-center mt-4 space-x-4">
      {!isConnected ? (
        <button
          onClick={startCall}
          disabled={isConnecting}
          className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Start voice call"
        >
          <PhoneIcon className="h-6 w-6" />
        </button>
      ) : (
        <button
          onClick={endCall}
          className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
          title="End voice call"
        >
          <PhoneXMarkIcon className="h-6 w-6" />
        </button>
      )}
    </div>
  );
} 