"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { supabase } from "@/utils/supabaseClient";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import AppointmentDetailModal from "@/components/dashboard/AppointmentDetailModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import ScheduleAppointmentModal from "@/components/dashboard/ScheduleAppointmentModal";

const APPOINTMENTS_PER_PAGE = 5;

const statusColors: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const AppointmentsPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [tab, setTab] = useState<"Upcoming" | "Past">("Upcoming");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [patientId, setPatientId] = useState("");

  useEffect(() => {
    const fetchUserAndAppointments = async () => {
      // Fetch user info
      const { data: patients } = await supabase
        .from("patients")
        .select("name, patient_id")
        .limit(1);
      let patientId = "";
      if (patients && patients.length > 0) {
        setUserName(patients[0].name);
        setUserInitials(
          patients[0].name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
        );
        setAvatarUrl(null); // Add avatar logic if available
        patientId = patients[0].patient_id;
        setPatientId(patientId);
      }
      
      // Fetch appointments for this patient
      fetchAppointments(patientId);
    };
    fetchUserAndAppointments();
  }, []);

  const fetchAppointments = async (id: string) => {
    if (!id) return;
    
    setLoading(true);
    const { data: appts } = await supabase
      .from("appointments")
      .select("*, providers(name), care_plans(department)")
      .eq("patient_id", id)
      .order("scheduled_at", { ascending: false });
      
    if (appts && appts.length > 0) {
      const apptList = appts.map((appt: any) => ({
        id: appt.appointment_id,
        doctor: appt.providers?.[0]?.name || "-",
        department: appt.care_plans?.department || "-",
        date: appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleDateString() : "-",
        time: appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
        location: appt.location || "-",
        status: appt.status || "Upcoming",
        notes: appt.notes || "",
        onCalendar: () => addToCalendar(appt),
        onReschedule: () => handleReschedule(appt.appointment_id),
        onCancel: () => handleCancel(appt.appointment_id),
        onView: () => {
          setSelectedAppointment({
            doctor: appt.providers?.[0]?.name || "-",
            department: appt.care_plans?.department || "-",
            date: appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleDateString() : "-",
            time: appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-",
            location: appt.location || "-",
            status: appt.status || "Upcoming",
            notes: appt.notes || "",
          });
          setModalOpen(true);
        }
      }));
      setAppointments(apptList);
    } else {
      setAppointments([]);
    }
    setLoading(false);
  };

  const handleScheduleSuccess = () => {
    fetchAppointments(patientId);
  };

  const handleReschedule = (appointmentId: string) => {
    // For now, just close the modal - implement rescheduling in a future feature
    setModalOpen(false);
  };

  const handleCancel = async (appointmentId: string) => {
    if (!appointmentId) return;
    
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "Cancelled" })
        .eq("appointment_id", appointmentId);
        
      if (error) throw error;
      
      // Refresh appointment list and close modal
      fetchAppointments(patientId);
      setModalOpen(false);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const addToCalendar = (appointment: any) => {
    if (!appointment.scheduled_at) return;
    
    // Format appointment details for calendar
    const title = `Medical Appointment with ${appointment.providers?.[0]?.name || "Doctor"}`;
    const startTime = new Date(appointment.scheduled_at);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // Assume 1 hour appointment
    
    const startStr = startTime.toISOString().replace(/-|:|\.\d+/g, "");
    const endStr = endTime.toISOString().replace(/-|:|\.\d+/g, "");
    
    const location = appointment.location || "";
    const details = `Department: ${appointment.care_plans?.department || ""}\nNotes: ${appointment.notes || ""}`;
    
    // Create Google Calendar URL
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}&sprop=&sprop=name:`;
    
    // Open in new tab
    window.open(calendarUrl, '_blank');
  };

  // Filter, tab, and paginate appointments
  const filteredAppointments = appointments.filter(
    (a) =>
      (tab === "Upcoming" ? a.status === "Upcoming" : a.status !== "Upcoming") &&
      (a.doctor.toLowerCase().includes(search.toLowerCase()) ||
        a.department.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredAppointments.length / APPOINTMENTS_PER_PAGE) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * APPOINTMENTS_PER_PAGE,
    page * APPOINTMENTS_PER_PAGE
  );

  // Reset to page 1 if search or tab changes
  React.useEffect(() => {
    setPage(1);
  }, [search, tab]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <DashboardHeader userName={userName} userInitials={userInitials} avatarUrl={avatarUrl} />
      <div className="flex-1 flex w-full">
        <DashboardSidebar activeItem="Appointments" />
        <main className="flex-1 bg-gray-50 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto lg:pb-8 pb-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search appointments..."
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition text-sm w-full sm:w-auto"
                onClick={() => setScheduleModalOpen(true)}
              >
                + Schedule New
              </button>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-4">
            <button
              className={`pb-2 px-2 text-base font-semibold border-b-2 transition ${tab === "Upcoming" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500"}`}
              onClick={() => setTab("Upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`pb-2 px-2 text-base font-semibold border-b-2 transition ${tab === "Past" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500"}`}
              onClick={() => setTab("Past")}
            >
              Past
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            {loading ? (
              <div className="text-gray-400 text-center py-8">Loading...</div>
            ) : paginatedAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CalendarDaysIcon className="w-16 h-16 text-blue-200 mb-4" />
                <div className="text-lg font-semibold text-gray-500 mb-2">No appointments found</div>
                <div className="text-sm text-gray-400">Schedule your first appointment to get started!</div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {paginatedAppointments.map((appt, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                    {/* Date badge */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-blue-50 rounded-xl mr-4">
                      <div className="text-2xl font-bold text-blue-700">{appt.date.split("/")[1]}</div>
                      <div className="text-xs text-blue-700 uppercase">{appt.date.split("/")[0]}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg mb-1">{appt.doctor}</div>
                      <div className="text-sm text-gray-500 mb-1">{appt.department}</div>
                      <div className="text-xs text-gray-400 mb-1">{appt.date} &bull; {appt.time}</div>
                      <div className="text-xs text-gray-400 mb-1">{appt.location}</div>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[appt.status]}`}>{appt.status}</span>
                    <div className="flex gap-2 flex-wrap mt-2 md:mt-0">
                      <button onClick={appt.onCalendar} className="text-blue-600 hover:underline text-xs font-semibold">Add to Calendar</button>
                      {appt.status === "Upcoming" && (
                        <button onClick={appt.onReschedule} className="text-gray-500 hover:underline text-xs font-semibold">Reschedule</button>
                      )}
                      {appt.status === "Upcoming" && (
                        <button onClick={appt.onCancel} className="text-red-600 hover:underline text-xs font-semibold">Cancel</button>
                      )}
                      <button onClick={appt.onView} className="text-blue-600 hover:underline text-xs font-semibold">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Pagination controls */}
            <div className="flex justify-center mt-6 gap-1">
              <button
                className="px-3 py-1 rounded bg-white text-gray-500 font-semibold text-sm mx-1 border border-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded font-semibold text-sm mx-1 border border-gray-200 ${page === i + 1 ? "bg-blue-50 text-blue-700" : "bg-white text-gray-500"}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-white text-gray-500 font-semibold text-sm mx-1 border border-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
          {selectedAppointment && (
            <AppointmentDetailModal
              open={modalOpen}
              appointment={selectedAppointment}
              onClose={() => setModalOpen(false)}
              onReschedule={() => handleReschedule(selectedAppointment.id)}
              onCancel={() => handleCancel(selectedAppointment.id)}
            />
          )}
          
          <ScheduleAppointmentModal
            open={scheduleModalOpen}
            onClose={() => setScheduleModalOpen(false)}
            patientId={patientId}
            onScheduleSuccess={handleScheduleSuccess}
          />
        </main>
      </div>
      <DashboardFooter />
      <MobileBottomNav />
    </div>
  );
};

export default AppointmentsPage; 