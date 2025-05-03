"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { supabase } from "@/utils/supabaseClient";
import MedicalRecordsSummaryCards from "@/components/dashboard/MedicalRecordsSummaryCards";
import { DocumentTextIcon, CalendarDaysIcon, BeakerIcon, PhotoIcon } from "@heroicons/react/24/outline";
import MobileBottomNav from "@/components/MobileBottomNav";
import FileUploadModal from "@/components/dashboard/FileUploadModal";

const REPORTS_PER_PAGE = 5;

const statusColors: Record<string, string> = {
  Normal: "bg-green-100 text-green-700",
  "Review Required": "bg-yellow-100 text-yellow-700",
};

const MedicalRecordsPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndReports = async () => {
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
      // Fetch reports for this patient
      fetchReports(patientId);
    };
    fetchUserAndReports();
  }, []);

  const fetchReports = async (id: string) => {
    if (!id) return;
    
    const { data: reportsData } = await supabase
      .from("reports")
      .select("name, date, status, file_url, providers(name), type")
      .eq("patient_id", id)
      .order("date", { ascending: false });
      
    if (reportsData && reportsData.length > 0) {
      const reportList = reportsData.map((report: { name: string; date: string; status: string; file_url?: string; providers: { name: string }[]; type: string }) => ({
        name: report.name,
        date: report.date ? new Date(report.date).toLocaleDateString() : "-",
        doctor: report.providers?.[0]?.name || "-",
        status: report.status || "Normal",
        type: report.type || "Other",
        onView: () => {
          if (report.file_url) window.open(report.file_url, "_blank");
        },
        onDownload: () => { 
          if (report.file_url) window.open(report.file_url, "_blank");
        },
      }));
      setReports(reportList);
    } else {
      setReports([]);
    }
    setLoading(false);
  };

  const handleUploadSuccess = () => {
    fetchReports(patientId);
  };

  // Filter and paginate reports
  const filteredReports = reports.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredReports.length / REPORTS_PER_PAGE) || 1;
  const paginatedReports = filteredReports.slice(
    (page - 1) * REPORTS_PER_PAGE,
    page * REPORTS_PER_PAGE
  );

  // Reset to page 1 if search changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <DashboardHeader userName={userName} userInitials={userInitials} avatarUrl={avatarUrl} />
      <div className="flex-1 flex w-full">
        <DashboardSidebar activeItem="Medical Reports" />
        <main className="flex-1 bg-gray-50 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto lg:pb-8 pb-20">
          {/* Summary Cards */}
          <MedicalRecordsSummaryCards
            stats={[
              { label: "Total Reports", value: reports.length.toString(), icon: DocumentTextIcon },
              { label: "Last Upload", value: reports.length > 0 ? reports[0].date : "-", icon: CalendarDaysIcon },
              { label: "Blood Tests", value: reports.filter(r => r.type === "Blood Test").length.toString(), icon: BeakerIcon },
              { label: "Imaging", value: reports.filter(r => r.type === "Imaging").length.toString(), icon: PhotoIcon },
            ]}
          />
          {/* Filter/Sort Controls and Upload Button */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex gap-2 flex-wrap w-full md:w-auto">
              <select 
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                onChange={(e) => setSearch(e.target.value !== "All Types" ? e.target.value : "")}
              >
                <option>All Types</option>
                <option>Blood Test</option>
                <option>Imaging</option>
                <option>Allergy Test</option>
                <option>Vaccination</option>
                <option>Other</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                <option>All Status</option>
                <option>Normal</option>
                <option>Review Required</option>
              </select>
              <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition text-sm w-full md:w-auto flex-shrink-0"
              onClick={() => setUploadModalOpen(true)}
            >
              Upload Medical Report
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            {loading ? (
              <div className="text-gray-400 text-center py-8">Loading...</div>
            ) : paginatedReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <PhotoIcon className="w-16 h-16 text-blue-200 mb-4" />
                <div className="text-lg font-semibold text-gray-500 mb-2">No medical records found</div>
                <div className="text-sm text-gray-400">Upload your first report to get started!</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase">
                      <th className="py-2 px-2 font-semibold">Type</th>
                      <th className="py-2 px-2 font-semibold">Report Name</th>
                      <th className="py-2 px-2 font-semibold">Date</th>
                      <th className="py-2 px-2 font-semibold">Doctor</th>
                      <th className="py-2 px-2 font-semibold">Status</th>
                      <th className="py-2 px-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReports.map((report, idx) => (
                      <tr key={idx} className="bg-gray-50 rounded-xl border border-gray-100">
                        <td className="py-3 px-2">
                          {report.type === "Blood Test" ? (
                            <BeakerIcon className="w-5 h-5 text-red-400" />
                          ) : report.type === "Imaging" ? (
                            <PhotoIcon className="w-5 h-5 text-purple-400" />
                          ) : (
                            <DocumentTextIcon className="w-5 h-5 text-blue-400" />
                          )}
                        </td>
                        <td className="py-3 px-2 font-medium text-gray-900">{report.name}</td>
                        <td className="py-3 px-2 text-gray-500 text-sm">{report.date}</td>
                        <td className="py-3 px-2 text-gray-500 text-sm">{report.doctor}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[report.status] || "bg-gray-100 text-gray-500"}`}>{report.status}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={report.onView} className="text-blue-600 hover:underline text-xs font-semibold">View</button>
                            <button onClick={report.onDownload} className="text-blue-600 hover:underline text-xs font-semibold">Download</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination controls */}
            <div className="flex justify-center flex-wrap mt-6 gap-1">
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
        </main>
      </div>
      <DashboardFooter />
      <MobileBottomNav />
      <FileUploadModal 
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        patientId={patientId}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default MedicalRecordsPage; 