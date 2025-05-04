"use client";

import React, { ReactNode } from 'react';
import { VoiceProvider as HumeVoiceProvider } from "@humeai/voice-react";

interface VoiceProviderProps {
  accessToken: string;
  children: ReactNode;
}

export default function VoiceProvider({ accessToken, children }: VoiceProviderProps) {
  return (
    <HumeVoiceProvider
      auth={{
        type: "accessToken",
        value: accessToken,
      }}
    >
      {children}
    </HumeVoiceProvider>
  );
} 