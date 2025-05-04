"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { supabase } from "@/utils/supabaseClient";
import MobileBottomNav from "@/components/MobileBottomNav";
import VoiceHistory from "@/components/dashboard/VoiceHistory";
import VoiceChatModal from "@/components/dashboard/VoiceChatModal";

const VoiceHistoryPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>("123e4567-e89b-12d3-a456-426614174100"); // Default ID
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: patients } = await supabase
        .from("patients")
        .select("patient_id, name")
        .limit(1);
      if (patients && patients.length > 0) {
        setUserName(patients[0].name);
        setPatientId(patients[0].patient_id);
        setUserInitials(
          patients[0].name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
        );
        setAvatarUrl(null); // Add avatar logic if available
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <DashboardHeader
        userName={userName}
        userInitials={userInitials}
        avatarUrl={avatarUrl}
      />
      <div className="flex-1 flex w-full">
        <div className="hidden lg:block w-64 h-full sticky top-0">
          <DashboardSidebar activeItem="Voice History" />
        </div>
        <div className="flex-1 max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="pb-5 border-b border-gray-200 mb-5 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Voice Chat History</h1>
            <button
              onClick={() => setVoiceChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Start New Voice Chat
            </button>
          </div>
          
          <div className="space-y-6">
            <VoiceHistory 
              patientId={patientId}
              onStartNewVoiceChat={() => setVoiceChatOpen(true)}
            />
          </div>
        </div>
      </div>
      <DashboardFooter />
      <MobileBottomNav />
      
      {/* Voice Chat Modal */}
      <VoiceChatModal
        open={voiceChatOpen}
        onClose={() => setVoiceChatOpen(false)}
        patientId={patientId}
        navigatorName="AI Health Assistant"
      />
    </div>
  );
};

export default VoiceHistoryPage; 