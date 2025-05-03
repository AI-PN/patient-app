import React from "react";

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

const statusColors: Record<string, string> = {
  Normal: "bg-green-100 text-green-700",
  "Review Required": "bg-yellow-100 text-yellow-700",
};

const MedicalReportRow: React.FC<Report> = ({ name, date, doctor, status, onView, onDownload }) => (
  <tr className="border-b last:border-b-0">
    <td className="py-3 px-2 font-medium text-gray-900 flex items-center gap-2">
      <span className="w-4 h-4 bg-blue-100 rounded-full inline-block mr-2" />
      {name}
    </td>
    <td className="py-3 px-2 text-gray-500 text-sm">{date}</td>
    <td className="py-3 px-2 text-gray-500 text-sm">{doctor}</td>
    <td className="py-3 px-2">
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>
    </td>
    <td className="py-3 px-2 flex gap-2">
      <button onClick={onView} className="text-blue-600 hover:underline text-xs font-semibold">View</button>
      <button onClick={onDownload} className="text-blue-600 hover:underline text-xs font-semibold">Download</button>
    </td>
  </tr>
);

const MedicalReportsTable: React.FC<MedicalReportsTableProps> = ({ reports }) => {
  return (
    <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 min-h-[120px]">
      <div className="text-sm text-gray-500 font-medium mb-2">Medical Reports</div>
      {reports.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No medical reports</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="py-2 px-2 font-semibold">Report Name</th>
                <th className="py-2 px-2 font-semibold">Date</th>
                <th className="py-2 px-2 font-semibold">Doctor</th>
                <th className="py-2 px-2 font-semibold">Status</th>
                <th className="py-2 px-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, idx) => (
                <MedicalReportRow key={idx} {...report} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default MedicalReportsTable; 