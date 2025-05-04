import React from "react";
import Link from "next/link";

interface RecentReportCardProps {
  reportName: string;
  summary: string;
  uploadedOn: string;
  doctorName: string;
  status: string;
  reportId?: string;
}

const statusColors: Record<string, string> = {
  Normal: "bg-green-100 text-green-700",
  Abnormal: "bg-yellow-100 text-yellow-700",
  Critical: "bg-red-100 text-red-700",
};

const RecentReportCard: React.FC<RecentReportCardProps> = ({
  reportName,
  summary,
  uploadedOn,
  doctorName,
  status,
  reportId
}) => {
  const linkHref = reportId 
    ? `/medical-records?report=${reportId}` 
    : `/medical-records?report=${encodeURIComponent(reportName)}`;

  return (
    <Link href={linkHref} className="block">
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="mb-2 flex justify-between items-start">
          <div className="font-semibold text-gray-900 text-base mb-1">{reportName}</div>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-500"}`}>
            {status}
          </span>
        </div>
        <div className="text-sm text-gray-500 mb-1 line-clamp-1">{summary}</div>
        <div className="text-xs text-gray-400 mb-1">Dr. {doctorName}</div>
        <div className="text-xs text-gray-400">Uploaded on: {uploadedOn}</div>
      </div>
    </Link>
  );
};

export default RecentReportCard; 