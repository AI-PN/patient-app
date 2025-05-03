import React from "react";

interface RecentReportCardProps {
  reportName: string;
  summary: string;
  uploadedOn: string;
  doctorName: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Normal: "bg-green-100 text-green-700",
  "Review Required": "bg-yellow-100 text-yellow-700",
};

const RecentReportCard: React.FC<RecentReportCardProps> = ({
  reportName,
  summary,
  uploadedOn,
  doctorName,
  status,
}) => {
  return (
    <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 min-h-[120px]">
      <div className="text-sm text-gray-500 font-medium mb-1">Recent Report</div>
      <div className="font-semibold text-lg text-gray-900 mb-1">{reportName}</div>
      <div className="text-sm text-gray-700 mb-1">{summary}</div>
      <div className="text-xs text-gray-400 mb-1">Uploaded on {uploadedOn}</div>
      <div className="text-xs text-gray-400 mb-2">{doctorName}</div>
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>
    </section>
  );
};

export default RecentReportCard; 