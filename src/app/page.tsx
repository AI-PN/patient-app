'use client';

import React, { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBody from "@/components/DashboardBody";
import DashboardFooter from "@/components/DashboardFooter";
import { supabase } from "@/utils/supabaseClient";
import MobileBottomNav from "@/components/MobileBottomNav";
import VoiceChatModal from '@/components/dashboard/VoiceChatModal';
import { PhoneIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import ScheduleAppointmentModal from '@/components/dashboard/ScheduleAppointmentModal';

export default function Home() {
  const [userName, setUserName] = useState<string>("Loading...");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>("123e4567-e89b-12d3-a456-426614174100"); // Default ID
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

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
        <DashboardBody />
      </div>
      <DashboardFooter />
      <MobileBottomNav />
      
      {/* Action buttons */}
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
      
      {/* Voice Chat Modal */}
      <VoiceChatModal
        open={voiceChatOpen}
        onClose={() => setVoiceChatOpen(false)}
        patientId={patientId}
        navigatorName="AI Health Assistant"
      />
      
      {/* Schedule Appointment Modal */}
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
