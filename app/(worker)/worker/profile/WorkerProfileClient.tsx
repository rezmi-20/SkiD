"use client";

import { useState } from "react";
import { useLocation } from "@/context/LocationContext";
import ProfileContent from "@/components/ProfileContent";

export default function WorkerProfileClient({ profile }: { profile: any }) {
  const { refreshLocation, loading: locLoading } = useLocation();
  const [justUpdated, setJustUpdated] = useState(false);

  const name = profile?.full_name || "Professional";
  const email = profile?.email || "worker@direskilld.com";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

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
          label: "Edit Profile",
          subtitle: "Manage your professional identity",
          icon: "edit_square",
          link: "/worker/profile/settings",
        },
        {
          label: "Sync My Location",
          subtitle: "Update your district position",
          icon: "location_on",
          onClick: handleUpdateLocation,
          isLoading: locLoading,
          isSuccess: justUpdated,
        },
      ],
    },
  ];

  const skills = profile?.skills || ["Pipe Installation", "Leak Repair", "Solar Water Heaters", "Drain Unclogging"];

  return (
    <ProfileContent 
      user={{ 
        name, 
        email, 
        role: "worker", 
        initials,
        avatarUrl: profile?.avatar_url || "/default-avatar.svg",
        phone: profile?.phone,
        gender: profile?.gender,
        dateOfBirth: profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : undefined,
        district: profile?.district,
        is_verified: Boolean(profile?.is_verified && profile?.has_fin),
        verificationStatus: profile?.verification_status || "incomplete",
        maskedFin: profile?.masked_fin || null
      }}
      stats={stats}
      menuGroups={menuGroups}
      skills={skills}
    />
  );
}
