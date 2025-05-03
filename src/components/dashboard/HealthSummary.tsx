import React from "react";

interface Vital {
  label: string;
  value: string;
  unit?: string;
  status: string;
}

interface HealthSummaryProps {
  vitals: Vital[];
}

const statusColors: Record<string, string> = {
  Normal: "bg-green-100 text-green-700",
  Stable: "bg-blue-100 text-blue-700",
  High: "bg-red-100 text-red-700",
  Low: "bg-yellow-100 text-yellow-700",
};

const MiniStatCard: React.FC<Vital> = ({ label, value, unit, status }) => (
  <div className="bg-gray-50 rounded-xl shadow p-6 flex flex-col items-start gap-2 min-w-[120px]">
    <div className="text-sm text-gray-500 font-medium mb-1">{label}</div>
    <div className="font-extrabold text-2xl text-gray-900 mb-1">
      {value} {unit && <span className="text-base text-gray-400">{unit}</span>}
    </div>
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>
  </div>
);

const HealthSummary: React.FC<HealthSummaryProps> = ({ vitals }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {vitals.map((vital) => (
        <MiniStatCard key={vital.label} {...vital} />
      ))}
    </div>
  );
};

export default HealthSummary; 