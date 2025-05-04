"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { supabase } from "@/utils/supabaseClient";
import MobileBottomNav from "@/components/MobileBottomNav";
import VoiceHistory from "@/components/dashboard/VoiceHistory";
import VoiceChatModal from "@/components/dashboard/VoiceChatModal";
import { syncHumeConversations } from "@/utils/humeSync";
import { SearchFilter } from '@/components/ui/FilterInput';

const VoiceHistoryPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>("123e4567-e89b-12d3-a456-426614174100"); // Default ID
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);
  
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

  useEffect(() => {
    async function syncWithHume() {
      setSyncing(true);
      setSyncError(null);
      setSyncSuccess(false);
      try {
        const success = await syncHumeConversations();
        if (success) {
          setSyncSuccess(true);
          setTimeout(() => setSyncSuccess(false), 3000); // Clear success message after 3 seconds
        } else {
          setSyncError("Failed to sync with Hume API");
        }
      } catch (error) {
        console.error("Failed to sync with Hume:", error);
        setSyncError(error instanceof Error ? error.message : String(error));
      } finally {
        setSyncing(false);
      }
    }
    
    syncWithHume();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);
    try {
      const success = await syncHumeConversations();
      if (success) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000); // Clear success message after 3 seconds
        // Force refresh the component
        window.location.reload();
      } else {
        setSyncError("Failed to sync with Hume API");
      }
    } catch (error) {
      console.error("Failed to sync with Hume:", error);
      setSyncError(error instanceof Error ? error.message : String(error));
    } finally {
      setSyncing(false);
    }
  };

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
          <div className="pb-5 border-b border-gray-200 mb-5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Voice Chat History</h1>
              <div className="flex items-center gap-3">
                {syncing && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing with Hume...
                  </span>
                )}
                <button 
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-200 transition disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Sync
                </button>
                <button
                  onClick={() => setVoiceChatOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Start New Voice Chat
                </button>
              </div>
            </div>
            
            {syncError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                {syncError}
              </div>
            )}
            
            {syncSuccess && !syncError && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Successfully synced with Hume API
              </div>
            )}
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