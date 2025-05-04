import React from "react";
import { DocumentTextIcon, ArrowDownTrayIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

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

interface PrescriptionsListProps {
  prescriptions: Prescription[];
  loading?: boolean;
}

const statusConfig: Record<string, { color: string, bg: string, border: string }> = {
  Active: { 
    color: "text-green-700", 
    bg: "bg-green-50", 
    border: "border-green-200" 
  },
  Expired: { 
    color: "text-red-700", 
    bg: "bg-red-50", 
    border: "border-red-200" 
  },
};

const PrescriptionCard: React.FC<Prescription> = ({ 
  name, 
  dosage, 
  frequency, 
  prescribedOn, 
  status, 
  prescriber, 
  onView, 
  onDownload 
}) => {
  const statusStyle = statusConfig[status] || { 
    color: "text-gray-700", 
    bg: "bg-gray-50", 
    border: "border-gray-200" 
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow transition-shadow border border-gray-100 overflow-hidden">
      <div className="flex flex-col p-5">
        <div className="flex justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${statusStyle.bg} ${statusStyle.border}`}>
              <DocumentTextIcon className={`w-5 h-5 ${statusStyle.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{name}</h3>
              <div className="flex items-center mt-1 gap-2">
                <div className="text-sm text-gray-500">
                  {dosage} • {frequency}
                </div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.color}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <div className="text-xs text-gray-500 mb-1">Prescribed On</div>
            <div className="font-medium text-gray-700">{prescribedOn}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Prescriber</div>
            <div className="font-medium text-gray-700">{prescriber || "Unknown Doctor"}</div>
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
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ prescriptions, loading }) => {
  return (
    <div className="bg-transparent">
      {loading ? (
        <div className="text-gray-400 text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">Loading...</div>
      ) : prescriptions.length === 0 ? (
        <div className="text-gray-400 text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">No prescriptions</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((prescription, idx) => (
            <PrescriptionCard key={idx} {...prescription} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionsList; 