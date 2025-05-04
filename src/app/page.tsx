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
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>("123e4567-e89b-12d3-a456-426614174100"); // Default ID
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: patients, error } = await supabase
          .from("patients")
          .select("patient_id, name, email")
          .limit(1);
          
        if (error) {
          console.error("Error fetching patient data:", error);
          setUserName("John Smith");
          setUserInitials("JS");
          setPatientEmail("patient@medconnect.com"); 
        } else if (patients && patients.length > 0) {
          setUserName(patients[0].name);
          setPatientId(patients[0].patient_id);
          
          if (patients[0].email) {
            setPatientEmail(patients[0].email);
          } else {
            setPatientEmail("patient@medconnect.com");
          }
          
          const initials = patients[0].name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase();
          setUserInitials(initials);
          
          setAvatarUrl(null);
        } else {
          setUserName("John Smith");
          setUserInitials("JS");
          setPatientEmail("patient@medconnect.com");
        }
      } catch (error) {
        console.error("Error in fetchUser:", error);
        setUserName("John Smith");
        setUserInitials("JS");
        setPatientEmail("patient@medconnect.com");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  const displayName = userName || "John Smith";
  const displayInitials = userInitials || "JS";
  const displayEmail = patientEmail || "patient@medconnect.com";

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
