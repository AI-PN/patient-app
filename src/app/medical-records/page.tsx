"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { supabase } from "@/utils/supabaseClient";

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
      }
      // Fetch reports for this patient
      const { data: reportsData } = await supabase
        .from("reports")
        .select("name, date, status, file_url, providers(name)")
        .eq("patient_id", patientId)
        .order("date", { ascending: false });
      if (reportsData && reportsData.length > 0) {
        const reportList = reportsData.map((report: { name: string; date: string; status: string; file_url?: string; providers: { name: string }[] }) => ({
          name: report.name,
          date: report.date ? new Date(report.date).toLocaleDateString() : "-",
          doctor: report.providers?.[0]?.name || "-",
          status: report.status || "Normal",
          onView: () => {},
          onDownload: () => { if (report.file_url) window.open(report.file_url, "_blank"); },
        }));
        setReports(reportList);
      } else {
        setReports([]);
      }
      setLoading(false);
    };
    fetchUserAndReports();
  }, []);

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
        <main className="flex-1 bg-gray-50 p-8 flex flex-col gap-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            <input
              type="text"
              placeholder="Search reports..."
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            {loading ? (
              <div className="text-gray-400 text-center py-8">Loading...</div>
            ) : paginatedReports.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No medical records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase">
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
                        <td className="py-3 px-2 font-medium text-gray-900">{report.name}</td>
                        <td className="py-3 px-2 text-gray-500 text-sm">{report.date}</td>
                        <td className="py-3 px-2 text-gray-500 text-sm">{report.doctor}</td>
                        <td className="py-3 px-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[report.status] || "bg-gray-100 text-gray-500"}`}>{report.status}</span>
                        </td>
                        <td className="py-3 px-2 flex gap-2">
                          <button onClick={report.onView} className="text-blue-600 hover:underline text-xs font-semibold">View</button>
                          <button onClick={report.onDownload} className="text-blue-600 hover:underline text-xs font-semibold">Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        </main>
      </div>
      <DashboardFooter />
    </div>
  );
};

export default MedicalRecordsPage; 