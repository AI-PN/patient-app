'use client';

import React, { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardBody from "@/components/DashboardBody";
import DashboardFooter from "@/components/DashboardFooter";
import { supabase } from "@/utils/supabaseClient";

export default function Home() {
  const [userName, setUserName] = useState<string>("Loading...");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: patients } = await supabase
        .from("patients")
        .select("name")
        .limit(1);
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
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <DashboardHeader
        userName={userName}
        userInitials={userInitials}
        avatarUrl={avatarUrl}
      />
      <div className="flex-1 flex w-full">
        <DashboardBody />
      </div>
      <DashboardFooter />
    </div>
  );
}
