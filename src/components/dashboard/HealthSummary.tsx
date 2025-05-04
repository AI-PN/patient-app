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

const statusColors: Record<string, { bg: string, text: string, gradient: string }> = {
  Normal: { 
    bg: "bg-green-50", 
    text: "text-green-700",
    gradient: "from-green-400 to-emerald-500"
  },
  Stable: { 
    bg: "bg-blue-50", 
    text: "text-blue-700",
    gradient: "from-blue-400 to-blue-500"
  },
  High: { 
    bg: "bg-red-50", 
    text: "text-red-700",
    gradient: "from-red-400 to-rose-500"
  },
  Low: { 
    bg: "bg-yellow-50", 
    text: "text-yellow-700",
    gradient: "from-yellow-400 to-amber-500"
  },
};

const MiniStatCard: React.FC<Vital> = ({ label, value, unit, status }) => {
  const statusStyle = statusColors[status] || { bg: "bg-gray-50", text: "text-gray-500", gradient: "from-gray-400 to-gray-500" };
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-start gap-2 min-w-[120px] border border-gray-100">
      <div className="flex justify-between w-full items-start">
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
          {status}
        </span>
      </div>
      
      <div className="font-extrabold text-2xl text-gray-900 mb-1">
        {value} {unit && <span className="text-base text-gray-400">{unit}</span>}
      </div>
      
      {/* Visual indicator bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${statusStyle.gradient}`}
          style={{ width: status === "Normal" ? "100%" : status === "Stable" ? "75%" : status === "High" ? "90%" : "40%" }}
        />
      </div>
    </div>
  );
};

const HealthSummary: React.FC<HealthSummaryProps> = ({ vitals }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {vitals.length === 0 ? (
        <div className="col-span-4 text-center py-8 text-gray-400">No health data available</div>
      ) : (
        vitals.map((vital) => (
          <MiniStatCard key={vital.label} {...vital} />
        ))
      )}
    </div>
  );
};

export default HealthSummary; 