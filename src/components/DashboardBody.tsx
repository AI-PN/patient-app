"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import UpcomingAppointmentCard from "./dashboard/UpcomingAppointmentCard";
import LatestPrescriptionCard from "./dashboard/LatestPrescriptionCard";
import RecentReportCard from "./dashboard/RecentReportCard";
import HealthSummary from "./dashboard/HealthSummary";
import ChatHistoryList from "./dashboard/ChatHistoryList";
import MedicalReportsTable from "./dashboard/MedicalReportsTable";
import PrescriptionsList from "./dashboard/PrescriptionsList";
import AppointmentsList from "./dashboard/AppointmentsList";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import ScheduleAppointmentModal from "./dashboard/ScheduleAppointmentModal";

// Define types
interface Appointment {
  appointment_id?: string;
  providers?: { name: string; specialty?: string };
  care_plans?: { department?: string };
  scheduled_at?: string;
  location?: string;
  status?: string;
}
interface Medication {
  medication_id?: string;
  name: string;
  dosage?: string;
  frequency?: string;
  created_at?: string;
}
interface Report {
  report_id?: string;
  name: string;
  summary?: string;
  date?: string;
  status?: string;
  doctor_id?: string;
  created_at?: string;
  providers?: { name: string }[];
  file_url?: string;
}
interface Prescription {
  name: string;
  dosage: string;
  frequency: string;
  prescribedOn: string;
  status: string;
  prescriber: string;
  onView: () => void;
  onDownload: () => void;
}

interface DashboardBodyProps {
  patientName?: string;
  patientEmail?: string;
}

const DashboardBody: React.FC<DashboardBodyProps> = ({ patientName, patientEmail }) => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [appointmentLoading, setAppointmentLoading] = useState<boolean>(true);
  const [latestMedication, setLatestMedication] = useState<Medication | null>(null);
  const [medicationLoading, setMedicationLoading] = useState<boolean>(true);
  const [recentReport, setRecentReport] = useState<Report | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(true);
  const [vitals, setVitals] = useState<Array<{ label: string; value: string; unit?: string; status: string }>>([]);
  const [vitalsLoading, setVitalsLoading] = useState<boolean>(true);
  const [chats, setChats] = useState<Array<{ avatarUrl: string | null; name: string; role: string; date: string; preview: string; onView: () => void }>>([]);
  const [chatsLoading, setChatsLoading] = useState<boolean>(true);
  const [allReports, setAllReports] = useState<Array<{ name: string; date: string; doctor: string; status: string; onView: () => void; onDownload: () => void }>>([]);
  const [allReportsLoading, setAllReportsLoading] = useState<boolean>(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Array<{
    doctorName: string;
    dateTime: string;
    department: string;
    location: string;
    status: string;
    onView: () => void;
    onCancel: () => void;
  }>>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState<boolean>(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [currentPatientId, setCurrentPatientId] = useState<string>("123e4567-e89b-12d3-a456-426614174100"); // Default ID

  useEffect(() => {
    const fetchData = async () => {
      // Get the first patient as the current user (for demo)
      const { data: patients }: { data: { patient_id: string; name: string; updated_at?: string; navigator_id?: string }[] | null } = await supabase
        .from("patients")
        .select("patient_id, name, updated_at, navigator_id")
        .limit(1);
      if (patients && patients.length > 0) {
        setUserName(patients[0].name);
        setCurrentPatientId(patients[0].patient_id);
        setLastUpdated(
          patients[0].updated_at
            ? new Date(patients[0].updated_at).toLocaleDateString()
            : "-"
        );
        // Fetch next upcoming appointment
        const { data: appointments } = await supabase
          .from("appointments")
          .select("*, providers(name, specialty), care_plans(department)")
          .eq("patient_id", patients[0].patient_id)
          .eq("status", "Upcoming")
          .order("scheduled_at", { ascending: true })
          .limit(1);
        if (appointments && appointments.length > 0) {
          setAppointment(appointments[0]);
        }
        setAppointmentLoading(false);
        // Fetch latest medication
        const { data: medications } = await supabase
          .from("medications")
          .select("name, dosage, frequency, created_at")
          .eq("care_plan_id", patients[0].patient_id) // If care_plan_id is not patient_id, adjust this line
          .order("created_at", { ascending: false })
          .limit(1);
        if (medications && medications.length > 0) {
          setLatestMedication(medications[0]);
        }
        setMedicationLoading(false);
        // Fetch most recent report
        const { data: reports } = await supabase
          .from("reports")
          .select("name, summary, date, status, doctor_id, created_at, providers(name)")
          .eq("patient_id", patients[0].patient_id)
          .order("date", { ascending: false })
          .limit(1);
        if (reports && reports.length > 0) {
          setRecentReport(reports[0]);
        }
        setReportLoading(false);
        // Fetch latest vitals
        const vitalTypes = ["Blood Pressure", "Heart Rate", "Weight", "Blood Sugar"];
        const { data: vitalsData } = await supabase
          .from("vitals")
          .select("type, value, unit, status, measured_at")
          .eq("patient_id", patients[0].patient_id)
          .in("type", vitalTypes)
          .order("measured_at", { ascending: false });
        if (vitalsData && vitalsData.length > 0) {
          // Get the latest for each type
          const latestVitals: { label: string; value: string; unit?: string; status: string }[] = [];
          for (const type of vitalTypes) {
            const vital = vitalsData.find((v: { type: string }) => v.type === type);
            if (vital) {
              latestVitals.push({
                label: type,
                value: vital.value,
                unit: vital.unit,
                status: vital.status || "Normal",
              });
            }
          }
          setVitals(latestVitals);
        }
        // Fetch recent chats
        const { data: chatsData } = await supabase
          .from("chats")
          .select("chat_id, started_at, last_activity_at, patient_id, messages(content, sent_at, sender), navigators(name, email)")
          .eq("patient_id", patients[0].patient_id)
          .order("last_activity_at", { ascending: false })
          .limit(3);
        if (chatsData && chatsData.length > 0) {
          const chatList = chatsData.map((chat: { chat_id: string; started_at: string; last_activity_at: string; patient_id: string; messages: { content: string; sent_at: string; sender: string }[]; navigators: { name: string; email: string }[] }) => {
            const lastMessage = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
            return {
              avatarUrl: null, // Optionally use email hash or static
              name: chat.navigators?.[0]?.name || "Navigator",
              role: "Patient Navigator",
              date: lastMessage?.sent_at ? new Date(lastMessage.sent_at).toLocaleDateString() : "-",
              preview: lastMessage?.content || "No messages yet.",
              onView: () => { window.location.href = `/chat-history?chat=${chat.chat_id}`; },
            };
          });
          setChats(chatList);
        }
        setChatsLoading(false);
        // Fetch all reports
        const { data: allReportsData } = await supabase
          .from("reports")
          .select("name, date, status, file_url, providers(name)")
          .eq("patient_id", patients[0].patient_id)
          .order("date", { ascending: false });
        if (allReportsData && allReportsData.length > 0) {
          const reportList = allReportsData.map((report: { name: string; date: string; status: string; file_url?: string; providers: { name: string }[] }) => ({
            name: report.name,
            date: report.date ? new Date(report.date).toLocaleDateString() : "-",
            doctor: report.providers?.[0]?.name || "-",
            status: report.status || "Normal",
            onView: () => { window.location.href = `/medical-records?report=${report.name}`; },
            onDownload: () => { if (report.file_url) window.open(report.file_url, "_blank"); },
          }));
          setAllReports(reportList);
        }
        setAllReportsLoading(false);
        // Fetch all prescriptions (medications)
        const { data: allMeds } = await supabase
          .from("medications")
          .select("name, dosage, frequency, created_at")
          .eq("care_plan_id", patients[0].patient_id)
          .order("created_at", { ascending: false });
        if (allMeds && allMeds.length > 0) {
          const now = new Date();
          const prescriptionList = allMeds.map((med: { name: string; dosage: string; frequency: string; created_at: string }) => {
            const prescribedOn = med.created_at ? new Date(med.created_at) : null;
            const status = prescribedOn && (now.getTime() - prescribedOn.getTime()) / (1000 * 60 * 60 * 24) <= 30 ? "Active" : "Expired";
            return {
              name: med.name,
              dosage: med.dosage || "-",
              frequency: med.frequency || "-",
              prescribedOn: prescribedOn ? prescribedOn.toLocaleDateString() : "-",
              status,
              prescriber: "-", // Extend if provider info is available
              onView: () => { window.location.href = `/prescriptions?medication=${med.name}`; },
              onDownload: () => { alert("Prescription download feature coming soon"); },
            };
          });
          setPrescriptions(prescriptionList);
        } else {
          setPrescriptions([]);
        }
        setPrescriptionsLoading(false);
        // Fetch all appointments
        const { data: allAppointments } = await supabase
          .from("appointments")
          .select("*, providers(name), care_plans(department)")
          .eq("patient_id", patients[0].patient_id)
          .order("scheduled_at", { ascending: false });
        if (allAppointments && allAppointments.length > 0) {
          const appointmentList = allAppointments.map((appt: { appointment_id?: string; providers?: { name: string }[]; scheduled_at?: string; care_plans?: { department?: string }; location?: string; status?: string }) => ({
            doctorName: appt.providers?.[0]?.name || "-",
            dateTime: appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleString() : "-",
            department: appt.care_plans?.department || "-",
            location: appt.location || "-",
            status: appt.status || "-",
            onView: () => { window.location.href = `/appointments?view=${appt.appointment_id}`; },
            onCancel: () => { alert("Appointment cancellation feature coming soon"); },
          }));
          setAppointments(appointmentList);
        } else {
          setAppointments([]);
        }
        setAppointmentsLoading(false);
      }
      setVitalsLoading(false);
    };
    fetchData();
  }, []);

  let appointmentCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">No upcoming appointments</div>;
  if (appointmentLoading) {
    appointmentCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">Loading...</div>;
  } else if (appointment) {
    appointmentCard = (
      <UpcomingAppointmentCard
        doctorName={appointment.providers?.name || "Unknown Doctor"}
        dateTime={appointment.scheduled_at ? new Date(appointment.scheduled_at).toLocaleString() : "-"}
        department={appointment.care_plans?.department || "-"}
        location={appointment.location || "-"}
        status={appointment.status || "Upcoming"}
        appointmentId={appointment.appointment_id}
      />
    );
  }

  let latestPrescriptionCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">No prescriptions</div>;
  if (medicationLoading) {
    latestPrescriptionCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">Loading...</div>;
  } else if (latestMedication) {
    // Determine status (Active/Expired) based on created_at or a field if available
    const prescribedDate = latestMedication.created_at ? new Date(latestMedication.created_at).toLocaleDateString() : "-";
    const status = "Active"; // TODO: Add logic for Expired if available
    latestPrescriptionCard = (
      <LatestPrescriptionCard
        medicationName={latestMedication.name}
        dosage={latestMedication.dosage || latestMedication.frequency || "-"}
        prescribedOn={prescribedDate}
        status={status}
        medicationId={latestMedication.medication_id}
      />
    );
  }

  let recentReportCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">No reports</div>;
  if (reportLoading) {
    recentReportCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">Loading...</div>;
  } else if (recentReport) {
    const uploadedOn = recentReport.created_at ? new Date(recentReport.created_at).toLocaleDateString() : "-";
    recentReportCard = (
      <RecentReportCard
        reportName={recentReport.name}
        summary={recentReport.summary || "-"}
        uploadedOn={uploadedOn}
        doctorName={recentReport.providers?.[0]?.name || "-"}
        status={recentReport.status || "Normal"}
        reportId={recentReport.report_id}
      />
    );
  }

  let chatHistoryCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">No chat history</div>;
  if (chatsLoading) {
    chatHistoryCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">Loading...</div>;
  } else if (chats && chats.length > 0) {
    chatHistoryCard = <ChatHistoryList chats={chats} />;
  }

  let medicalReportsTableCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">No medical reports</div>;
  if (allReportsLoading) {
    medicalReportsTableCard = <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center min-h-[120px] text-gray-400">Loading...</div>;
  } else if (allReports && allReports.length > 0) {
    medicalReportsTableCard = <MedicalReportsTable reports={allReports} />;
  }

  // Find the next appointment for the sidebar
  const nextAppointmentDate = appointment && appointment.scheduled_at
    ? new Date(appointment.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : "May 12"; // Default fallback date
  
  // Determine health status based on vitals
  const healthStatus = vitals.length > 0 && vitals.some(v => v.status !== "Normal") 
    ? "Monitor" 
    : "Healthy";

  return (
    <div className="flex w-full min-h-[700px]">
      <DashboardSidebar 
        activeItem="Dashboard" 
        patientName={patientName || userName}
        patientEmail={patientEmail}
        nextAppointment={nextAppointmentDate}
        healthStatus={healthStatus}
      />
      <main className="flex-1 bg-gray-50 p-6 md:p-8 flex flex-col gap-6 md:gap-8 overflow-y-auto lg:pb-8 pb-20">
        {/* Top summary row */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2 sm:gap-4">
            <div className="text-2xl font-bold text-gray-900">Hello, {userName}</div>
            <div className="text-sm text-gray-500 flex-shrink-0">Last updated: {lastUpdated}</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
              <div className="text-xs text-gray-500 font-medium mb-1">Upcoming Appointment</div>
              {appointmentCard}
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
              <div className="text-xs text-gray-500 font-medium mb-1">Latest Prescription</div>
              {latestPrescriptionCard}
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
              <div className="text-xs text-gray-500 font-medium mb-1">Recent Report</div>
              {recentReportCard}
            </div>
          </div>
        </div>
        {/* Health Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="text-lg font-semibold text-gray-900 mb-4">Your Health Summary</div>
          <HealthSummary vitals={vitals} />
        </div>
        {/* Chat History */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className="text-lg font-semibold text-gray-900">Chat History</div>
            {/* Standardize Filter Button - Placeholder */}
          </div>
          {chatHistoryCard}
          <div className="flex justify-end mt-4">
            <Link href="/chat-history" className="text-blue-600 text-sm font-semibold hover:underline">
              View All Conversations
            </Link>
          </div>
        </div>
        {/* Medical Reports */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className="text-lg font-semibold text-gray-900">Medical Reports</div>
            <div className="flex gap-2 flex-wrap">
              {/* Standardize Filter Button - Placeholder */}
              <button 
                onClick={() => alert("Upload feature coming soon")} 
                className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1"
              >
                <span>Upload</span>
              </button>
            </div>
          </div>
          {medicalReportsTableCard}
          <div className="flex justify-end mt-4">
            <Link href="/medical-records" className="text-blue-600 text-sm font-semibold hover:underline">
              View All Medical Reports
            </Link>
          </div>
        </div>
        {/* Prescriptions */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className="text-lg font-semibold text-gray-900">Prescriptions</div>
            {/* Standardize Filter Button - Placeholder */}
          </div>
          <PrescriptionsList prescriptions={prescriptions} loading={prescriptionsLoading} />
          <div className="flex justify-end mt-4">
            <Link href="/prescriptions" className="text-blue-600 text-sm font-semibold hover:underline">
              View All Prescriptions
            </Link>
          </div>
        </div>
        {/* Appointments */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className="text-lg font-semibold text-gray-900">Appointments</div>
            <div className="flex gap-2 flex-wrap">
              {/* Standardize Filter Button - Placeholder */}
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1"
                onClick={() => setScheduleModalOpen(true)}
              >
                <span>+ Schedule New</span>
              </button>
            </div>
          </div>
          <AppointmentsList appointments={appointments} loading={appointmentsLoading} />
          <div className="flex justify-end mt-4">
            <Link href="/appointments" className="text-blue-600 text-sm font-semibold hover:underline">
              View All Appointments
            </Link>
          </div>
        </div>
        
        {/* Schedule Appointment Modal */}
        <ScheduleAppointmentModal
          open={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          patientId={currentPatientId}
          onScheduleSuccess={() => {
            // Optionally refresh appointments data when scheduled successfully
          }}
        />
      </main>
    </div>
  );
};

export default DashboardBody; 