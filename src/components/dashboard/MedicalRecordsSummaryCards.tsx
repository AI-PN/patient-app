import React from "react";
import { DocumentTextIcon, CalendarDaysIcon, BeakerIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface Stat {
  label: string;
  value: string;
  icon: React.ElementType;
}

interface MedicalRecordsSummaryCardsProps {
  stats: Stat[];
}

const MedicalRecordsSummaryCards: React.FC<MedicalRecordsSummaryCardsProps> = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {stats.map((stat, idx) => (
      <div key={idx} className="bg-white rounded-xl shadow p-4 flex items-center gap-4 border border-gray-100">
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
          <stat.icon className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      </div>
    ))}
  </div>
);

export default MedicalRecordsSummaryCards; 