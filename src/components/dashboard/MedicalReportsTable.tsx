import React from "react";
import { DocumentIcon, ArrowDownTrayIcon, EyeIcon } from "@heroicons/react/24/outline";

interface Report {
  name: string;
  date: string;
  doctor: string;
  status: string;
  onView: () => void;
  onDownload: () => void;
}

interface MedicalReportsTableProps {
  reports: Report[];
}

const statusConfig: Record<string, { color: string, bg: string, border: string }> = {
  Normal: { 
    color: "text-green-700", 
    bg: "bg-green-50", 
    border: "border-green-200" 
  },
  "Review Required": { 
    color: "text-yellow-700", 
    bg: "bg-yellow-50", 
    border: "border-yellow-200" 
  },
  Abnormal: { 
    color: "text-orange-700", 
    bg: "bg-orange-50", 
    border: "border-orange-200" 
  },
  Critical: { 
    color: "text-red-700", 
    bg: "bg-red-50", 
    border: "border-red-200" 
  }
};

const MedicalReportCard: React.FC<Report> = ({ name, date, doctor, status, onView, onDownload }) => {
  const statusStyle = statusConfig[status] || { 
    color: "text-gray-700", 
    bg: "bg-gray-50", 
    border: "border-gray-200" 
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow transition-shadow border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left colored status indicator */}
        <div className={`md:w-2 w-full h-2 md:h-auto ${statusStyle.bg} ${statusStyle.border}`}></div>
        
        <div className="flex-1 p-5">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-blue-50 border border-blue-100`}>
                <DocumentIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <div className="text-sm text-gray-500 mt-1">Dr. {doctor}</div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="text-sm text-gray-500">{date}</div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}>{status}</span>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button 
              onClick={onDownload}
              className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button 
              onClick={onView}
              className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors flex items-center gap-1"
            >
              <EyeIcon className="w-3.5 h-3.5" />
              <span>View Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicalReportsTable: React.FC<MedicalReportsTableProps> = ({ reports }) => {
  return (
    <div className="bg-transparent">
      {reports.length === 0 ? (
        <div className="text-gray-400 text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
          No medical reports
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report, idx) => (
            <MedicalReportCard key={idx} {...report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalReportsTable; 