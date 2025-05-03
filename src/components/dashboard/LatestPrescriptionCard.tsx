import React from "react";

interface LatestPrescriptionCardProps {
  medicationName: string;
  dosage: string;
  prescribedOn: string;
  status: string;
}

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Expired: "bg-red-100 text-red-700",
};

const LatestPrescriptionCard: React.FC<LatestPrescriptionCardProps> = ({
  medicationName,
  dosage,
  prescribedOn,
  status,
}) => {
  return (
    <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 min-h-[120px]">
      <div className="text-sm text-gray-500 font-medium mb-1">Latest Prescription</div>
      <div className="font-semibold text-lg text-gray-900 mb-1">{medicationName}</div>
      <div className="text-sm text-gray-700 mb-1">{dosage}</div>
      <div className="text-xs text-gray-400 mb-2">Prescribed on {prescribedOn}</div>
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>
    </section>
  );
};

export default LatestPrescriptionCard; 