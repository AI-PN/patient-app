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
import { useAuth } from "@/contexts/AuthContext";

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
  const { profile } = useAuth();
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
  
  // Use the profile id from AuthContext
  const currentPatientId = profile?.id || "123e4567-e89b-12d3-a456-426614174100"; // Default ID

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use the patient ID from profile
        const patientId = profile?.id || "123e4567-e89b-12d3-a456-426614174100";
        
        // Get updates timestamp
        const { data: patientData } = await supabase
          .from("patients")
          .select("updated_at")
          .eq("patient_id", patientId)
          .single();
          
        if (patientData?.updated_at) {
          setLastUpdated(new Date(patientData.updated_at).toLocaleDateString());
        } else {
          setLastUpdated("-");
        }

        // The rest of your data fetching using patientId
        // ...
        
        // Fetch next upcoming appointment
        const { data: appointments } = await supabase
          .from("appointments")
          .select("*, providers(name, specialty), care_plans(department)")
          .eq("patient_id", patientId)
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
          .eq("care_plan_id", patientId) // If care_plan_id is not patient_id, adjust this line
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
          .eq("patient_id", patientId)
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
          .eq("patient_id", patientId)
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
        setVitalsLoading(false);
        // Fetch recent chats
        const { data: chatsData } = await supabase
          .from("chats")
          .select("chat_id, started_at, last_activity_at, patient_id, messages(content, sent_at, sender), navigators(name, email)")
          .eq("patient_id", patientId)
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
          .eq("patient_id", patientId)
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
          .eq("care_plan_id", patientId)
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
          .eq("patient_id", patientId)
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
      } catch (error) {
        console.error("Error fetching data:", error);
        setVitalsLoading(false);
        setAppointmentLoading(false);
        setMedicationLoading(false);
        setReportLoading(false);
        setChatsLoading(false);
        setAllReportsLoading(false);
        setPrescriptionsLoading(false);
        setAppointmentsLoading(false);
      }
    };
    
    fetchData();
  }, [profile]);

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
        patientName={profile?.name || patientName || "Patient"}
        patientEmail={profile?.email || patientEmail || ""}
        nextAppointment={nextAppointmentDate}
        healthStatus={healthStatus}
      />
      <main className="flex-1 bg-gray-50 p-6 md:p-8 flex flex-col gap-8 overflow-y-auto lg:pb-16 pb-24">
        {/* Welcome heading */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2 sm:gap-4">
          <div className="text-2xl font-bold text-gray-900">Hello, {profile?.name || patientName || "Patient"}</div>
          <div className="text-sm text-gray-500 flex-shrink-0">Last updated: {lastUpdated}</div>
        </div>
        
        {/* Top summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2 border border-gray-100">
            <div className="text-xs text-gray-500 font-medium mb-1">Upcoming Appointment</div>
            {appointmentCard}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2 border border-gray-100">
            <div className="text-xs text-gray-500 font-medium mb-1">Latest Prescription</div>
            {latestPrescriptionCard}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2 border border-gray-100">
            <div className="text-xs text-gray-500 font-medium mb-1">Recent Report</div>
            {recentReportCard}
          </div>
        </div>
        
        {/* Health Summary */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Health Summary</h2>
          </div>
          <HealthSummary vitals={vitals} />
        </div>
        
        {/* Summary Cards Grid - Replace detailed sections with overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Chat Summary Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chat History</h3>
              <Link href="/chat-history" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            {chatsLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : chats && chats.length > 0 ? (
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium text-sm">{chats[0].name.substring(0, 2)}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-800">{chats[0].name}</div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">{chats[0].preview}</div>
                  <div className="text-xs text-gray-400 mt-1">{chats[0].date}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No recent chats</div>
            )}
          </div>
          
          {/* Medical Reports Summary Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Medical Reports</h3>
              <Link href="/medical-records" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            {allReportsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : allReports && allReports.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-800">Total Reports:</span> {allReports.length}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-800">Most Recent:</span> {allReports[0].name}
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-800">Date:</span> {allReports[0].date}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No medical reports available</div>
            )}
          </div>
          
          {/* Prescriptions Summary Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Prescriptions</h3>
              <Link href="/prescriptions" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            {prescriptionsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : prescriptions && prescriptions.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-800">Active Prescriptions:</span> {prescriptions.filter(p => p.status === "Active").length}
                </div>
                {prescriptions.length > 0 && (
                  <>
                    <div className="text-sm">
                      <span className="font-medium text-gray-800">Latest Medication:</span> {prescriptions[0].name}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-800">Prescribed On:</span> {prescriptions[0].prescribedOn}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No prescriptions available</div>
            )}
          </div>
          
          {/* Appointments Summary Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
              <div className="flex items-center gap-2">
                <button 
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 shadow-sm text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                  onClick={() => setScheduleModalOpen(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>New</span>
                </button>
                <Link href="/appointments" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
            {appointmentsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-800">Upcoming:</span> {appointments.filter(a => a.status === "Upcoming").length}
                </div>
                {appointments.length > 0 && (
                  <>
                    <div className="text-sm">
                      <span className="font-medium text-gray-800">Next Appointment:</span> {appointments[0].doctorName}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-800">Date:</span> {appointments[0].dateTime}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No appointments scheduled</div>
            )}
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