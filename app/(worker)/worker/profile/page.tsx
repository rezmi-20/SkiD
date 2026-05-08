"use client";

import { useLocation } from "@/context/LocationContext";
import { useState } from "react";
import { useSession } from "next-auth/react";
import ProfileContent from "@/components/ProfileContent";

export default function WorkerProfilePage() {
  const { data: session } = useSession();
  const { refreshLocation, loading: locLoading } = useLocation();
  const [justUpdated, setJustUpdated] = useState(false);

  const name = session?.user?.name || "Professional";
  const email = session?.user?.email || "worker@direskilld.com";
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleUpdateLocation = () => {
    refreshLocation();
    setJustUpdated(true);
    setTimeout(() => setJustUpdated(false), 3000);
  };

  const stats = [
    { label: "Gigs", value: "0" },
    { label: "Earned (ETB)", value: "0" },
    { label: "Rating", value: "★ —" },
  ];

  const menuGroups = [
    {
      group: "Professional",
      items: [
        {
          label: "Sync My Location",
          subtitle: "Update your district position",
          icon: "location_on",
          onClick: handleUpdateLocation,
          isLoading: locLoading,
          isSuccess: justUpdated,
        },
        {
          label: "Credentials & Certifications",
          subtitle: "Manage your professional documents",
          icon: "verified_user",
        },
        {
          label: "Earnings Vault",
          subtitle: "View payment & withdrawal history",
          icon: "account_balance_wallet",
        },
      ],
    },
    {
      group: "Support",
      items: [
        {
          label: "Contact Admin",
          subtitle: "Reach out to DireSkill support team",
          icon: "support_agent",
        },
        {
          label: "Privacy & Settings",
          subtitle: "Account security and preferences",
          icon: "settings",
        },
      ],
    },
  ];

  const skills = ["Pipe Installation", "Leak Repair", "Solar Water Heaters", "Drain Unclogging"];

  return (
    <ProfileContent 
      user={{ name, email, role: "worker", initials }}
      stats={stats}
      menuGroups={menuGroups}
      skills={skills}
    />
  );
}
