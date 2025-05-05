'use client';

import React, { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBody from "@/components/DashboardBody";
import DashboardFooter from "@/components/DashboardFooter";
import MobileBottomNav from "@/components/MobileBottomNav";
import VoiceChatModal from '@/components/dashboard/VoiceChatModal';
import { PhoneIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import ScheduleAppointmentModal from '@/components/dashboard/ScheduleAppointmentModal';
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { profile, isLoading } = useAuth();
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const router = useRouter();

  // Use the profile data from AuthContext instead of direct Supabase calls
  const patientId = profile?.id || "123e4567-e89b-12d3-a456-426614174100"; // Default ID
  const displayName = profile?.name || "John Smith";
  const displayInitials = profile?.initials || "JS";
  const displayEmail = profile?.email || "patient@medconnect.com";
  const avatarUrl = profile?.avatarUrl || null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <DashboardHeader
        userName={displayName}
        userInitials={displayInitials}
        avatarUrl={avatarUrl}
      />
      <div className="flex-1 flex w-full">
        <DashboardBody 
          patientName={displayName}
          patientEmail={displayEmail}
        />
      </div>
      <DashboardFooter />
      <MobileBottomNav />
      
      <div className="fixed bottom-24 right-6 z-10 flex flex-col gap-3">
        <button 
          onClick={() => setScheduleModalOpen(true)}
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title="Schedule appointment"
        >
          <CalendarDaysIcon className="h-6 w-6" />
        </button>
        <button 
          onClick={() => setVoiceChatOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Start voice chat"
        >
          <PhoneIcon className="h-6 w-6" />
        </button>
      </div>
      
      <VoiceChatModal
        open={voiceChatOpen}
        onClose={() => setVoiceChatOpen(false)}
        patientId={patientId}
        navigatorName="AI Health Assistant"
      />
      
      <ScheduleAppointmentModal
        open={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        patientId={patientId}
        onScheduleSuccess={() => {
          // Refresh appointments if needed
        }}
      />
    </div>
  );
}
