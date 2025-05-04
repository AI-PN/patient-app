"use client";

import React, { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { supabase } from "@/utils/supabaseClient";
import PharmacyCard from "@/components/dashboard/PharmacyCard";
import MedicationReminders from "@/components/dashboard/MedicationReminders";
import MobileBottomNav from "@/components/MobileBottomNav";
import PrescriptionDetailModal from "@/components/dashboard/PrescriptionDetailModal";
import { SearchFilter } from '@/components/ui/FilterInput';

const PRESCRIPTIONS_PER_PAGE = 5;

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Expired: "bg-gray-100 text-gray-500",
};

const PrescriptionsPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [carePlanId, setCarePlanId] = useState("");
  
  useEffect(() => {
    const fetchUserAndPrescriptions = async () => {
      // Fetch user info
      const { data: patients } = await supabase
        .from("patients")
        .select("name, patient_id")
        .limit(1);
      let carePlanId = "";
      if (patients && patients.length > 0) {
        setUserName(patients[0].name);
        setUserInitials(
          patients[0].name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
        );
        setAvatarUrl(null); // Add avatar logic if available
        setPatientId(patients[0].patient_id);
        
        // Fetch care plan for this patient
        const { data: carePlans } = await supabase
          .from("care_plans")
          .select("care_plan_id")
          .eq("patient_id", patients[0].patient_id)
          .limit(1);
        if (carePlans && carePlans.length > 0) {
          carePlanId = carePlans[0].care_plan_id;
          setCarePlanId(carePlanId);
        }
      }
      
      // Fetch prescriptions for this care plan
      fetchPrescriptions(carePlanId);
    };
    fetchUserAndPrescriptions();
  }, []);

  const fetchPrescriptions = async (id: string) => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    const { data: meds } = await supabase
      .from("medications")
      .select("medication_id, name, dosage, frequency, created_at, instructions, notes, provider_id, providers(name)")
      .eq("care_plan_id", id)
      .order("created_at", { ascending: false });
      
    if (meds && meds.length > 0) {
      const now = new Date();
      const prescriptionList = meds.map((med: any) => {
        const prescribedOn = med.created_at ? new Date(med.created_at) : null;
        const status = prescribedOn && (now.getTime() - prescribedOn.getTime()) / (1000 * 60 * 60 * 24) <= 30 ? "Active" : "Expired";
        return {
          id: med.medication_id,
          name: med.name,
          dosage: med.dosage || "-",
          frequency: med.frequency || "-",
          prescribedOn: prescribedOn ? prescribedOn.toLocaleDateString() : "-",
          prescribedBy: med.providers?.name || "Unknown Doctor",
          instructions: med.instructions,
          notes: med.notes,
          status,
          onRefill: () => handleRefillRequest(med.medication_id),
          onDownload: () => handleDownloadPrescription(med.medication_id),
          onViewHistory: () => {},
          onView: () => {
            setSelectedPrescription({
              id: med.medication_id,
              name: med.name,
              dosage: med.dosage || "-",
              frequency: med.frequency || "-",
              prescribedOn: prescribedOn ? prescribedOn.toLocaleDateString() : "-",
              prescribedBy: med.providers?.name || "Unknown Doctor",
              instructions: med.instructions,
              notes: med.notes,
              status
            });
            setModalOpen(true);
          }
        };
      });
      setPrescriptions(prescriptionList);
    } else {
      setPrescriptions([]);
    }
    setLoading(false);
  };

  const handleRefillRequest = async (medicationId: string) => {
    // In a real app, this would create a refill request record
    // For demo purposes, we'll show a confirmation and close the modal
    alert("Refill request submitted successfully!");
    setModalOpen(false);
  };

  const handleDownloadPrescription = (medicationId: string) => {
    // In a real app, this would generate a PDF prescription
    // For demo purposes, we'll just use a dummy URL
    const dummyPdfUrl = `https://example.com/prescriptions/${medicationId}.pdf`;
    window.open(dummyPdfUrl, '_blank');
  };

  // Filter and paginate prescriptions
  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.dosage.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPrescriptions.length / PRESCRIPTIONS_PER_PAGE) || 1;
  const paginatedPrescriptions = filteredPrescriptions.slice(
    (page - 1) * PRESCRIPTIONS_PER_PAGE,
    page * PRESCRIPTIONS_PER_PAGE
  );

  // Reset to page 1 if search changes
  React.useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <DashboardHeader userName={userName} userInitials={userInitials} avatarUrl={avatarUrl} />
      <div className="flex-1 flex w-full">
        <DashboardSidebar activeItem="Prescriptions" />
        <main className="flex-1 bg-gray-50 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto lg:pb-8 pb-20">
          {/* Pharmacy and Reminders */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 min-w-[280px]">
              <PharmacyCard
                name="City Health Pharmacy"
                address="123 Main St, Springfield, IL 62704"
                phone="(555) 123-4567"
                onContact={() => {}}
              />
            </div>
            <div className="flex-1 min-w-[280px]">
              <MedicationReminders
                reminders={prescriptions
                  .filter(p => p.status === "Active")
                  .slice(0, 2)
                  .map(p => ({
                    name: p.name,
                    time: p.frequency === "Once daily" ? "8:00 AM" : p.frequency === "Twice daily" ? "9:00 AM" : "Custom",
                    enabled: true,
                    onToggle: () => {}
                  }))}
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
            <SearchFilter
              placeholder="Search prescriptions..."
              value={search}
              onChange={setSearch}
              className="w-full md:w-64"
            />
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            {loading ? (
              <div className="text-gray-400 text-center py-8">Loading...</div>
            ) : paginatedPrescriptions.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No prescriptions found</div>
            ) : (
              <div className="flex flex-col gap-4">
                {paginatedPrescriptions.map((p, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg mb-1">{p.name}</div>
                      <div className="text-sm text-gray-500 mb-1">{p.dosage} &bull; {p.frequency}</div>
                      <div className="text-xs text-gray-400 mb-1">Prescribed on {p.prescribedOn}</div>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[p.status]}`}>{p.status}</span>
                    <div className="flex gap-2 flex-wrap mt-2 md:mt-0">
                      {p.status === "Active" && (
                        <button onClick={p.onRefill} className="text-blue-600 hover:underline text-xs font-semibold">Refill</button>
                      )}
                      <button onClick={p.onViewHistory} className="text-gray-500 hover:underline text-xs font-semibold">View History</button>
                      <button onClick={p.onView} className="text-blue-600 hover:underline text-xs font-semibold">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Pagination controls */}
            <div className="flex justify-center flex-wrap mt-6 gap-1">
              <button
                className="px-3 py-1 rounded bg-white text-gray-500 font-semibold text-sm mx-1 border border-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded font-semibold text-sm mx-1 border border-gray-200 ${page === i + 1 ? "bg-blue-50 text-blue-700" : "bg-white text-gray-500"}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-white text-gray-500 font-semibold text-sm mx-1 border border-gray-200 disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </main>
      </div>
      <DashboardFooter />
      <MobileBottomNav />
      
      <PrescriptionDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        prescription={selectedPrescription}
        onRefill={handleRefillRequest}
        onDownload={handleDownloadPrescription}
      />
    </div>
  );
};

export default PrescriptionsPage; 