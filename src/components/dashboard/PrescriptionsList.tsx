import React from "react";

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

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Expired: "bg-red-100 text-red-700",
};

const PrescriptionRow: React.FC<Prescription> = ({ name, dosage, frequency, prescribedOn, status, prescriber, onView, onDownload }) => (
  <tr className="border-b last:border-b-0">
    <td className="py-3 px-2 font-medium text-gray-900 flex items-center gap-2">
      <span className="w-4 h-4 bg-blue-100 rounded-full inline-block mr-2" />
      {name}
    </td>
    <td className="py-3 px-2 text-gray-500 text-sm">{dosage}</td>
    <td className="py-3 px-2 text-gray-500 text-sm">{frequency}</td>
    <td className="py-3 px-2 text-gray-500 text-sm">{prescribedOn}</td>
    <td className="py-3 px-2 text-gray-500 text-sm">{prescriber}</td>
    <td className="py-3 px-2">
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>
    </td>
    <td className="py-3 px-2 flex gap-2">
      <button onClick={onView} className="text-blue-600 hover:underline text-xs font-semibold">View</button>
      <button onClick={onDownload} className="text-blue-600 hover:underline text-xs font-semibold">Download</button>
    </td>
  </tr>
);

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ prescriptions, loading }) => {
  return (
    <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 min-h-[120px]">
      <div className="text-sm text-gray-500 font-medium mb-2">Prescriptions</div>
      {loading ? (
        <div className="text-gray-400 text-center py-8">Loading...</div>
      ) : prescriptions.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No prescriptions</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="py-2 px-2 font-semibold">Medication Name</th>
                <th className="py-2 px-2 font-semibold">Dosage</th>
                <th className="py-2 px-2 font-semibold">Frequency</th>
                <th className="py-2 px-2 font-semibold">Prescribed On</th>
                <th className="py-2 px-2 font-semibold">Prescriber</th>
                <th className="py-2 px-2 font-semibold">Status</th>
                <th className="py-2 px-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((prescription, idx) => (
                <PrescriptionRow key={idx} {...prescription} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default PrescriptionsList; 