import React from "react";
import Link from "next/link";

interface LatestPrescriptionCardProps {
  medicationName: string;
  dosage: string;
  prescribedOn: string;
  status: string;
  medicationId?: string;
}

const LatestPrescriptionCard: React.FC<LatestPrescriptionCardProps> = ({
  medicationName,
  dosage,
  prescribedOn,
  status,
  medicationId
}) => {
  const statusColorClass =
    status === "Active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-100 text-gray-700";
      
  const linkHref = medicationId
    ? `/prescriptions?medication=${medicationId}`
    : `/prescriptions?medication=${encodeURIComponent(medicationName)}`;

  return (
    <Link href={linkHref} className="block">
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="mb-2 flex justify-between items-start">
          <div className="font-semibold text-gray-900 text-base mb-1">{medicationName}</div>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColorClass}`}>
            {status}
          </span>
        </div>
        <div className="text-sm text-gray-500 mb-1">{dosage}</div>
        <div className="text-xs text-gray-400">Prescribed on: {prescribedOn}</div>
      </div>
    </Link>
  );
};

export default LatestPrescriptionCard; 