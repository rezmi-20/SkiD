"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { getProfileData } from "@/lib/actions/profile";
import ProfileContent from "@/components/ProfileContent";

export default function ClientProfilePage() {
  const { data: session } = authClient.useSession();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getProfileData().then(data => {
      if (data) setProfile(data);
    });
  }, []);

  const name = profile?.full_name || session?.user?.name || "Professional";
  const email = profile?.email || session?.user?.email || "client@direskilld.com";
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const stats = [
    { label: "Active Jobs", value: "3" },
    { label: "Total Spent", value: "0 ETB" },
    { label: "Avg. Rating", value: "—" },
  ];

  const menuGroups = [
    {
      group: "Account",
      items: [
        {
          label: "Profile Settings",
          subtitle: "Edit your information & preferences",
          icon: "settings",
          link: "/client/profile/settings",
        },
      ],
    },
  ];

  return (
    <ProfileContent 
      user={{ 
        name, 
        email, 
        role: "client", 
        initials,
        avatarUrl: profile?.avatar_url || session?.user?.image || "/default-avatar.svg",
        phone: profile?.phone,
        gender: profile?.gender,
        dateOfBirth: profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : undefined,
        district: profile?.district
      }}
      stats={stats}
      menuGroups={menuGroups}
    />
  );
}
