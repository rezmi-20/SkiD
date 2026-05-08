"use client";

import { useSession } from "next-auth/react";
import ProfileContent from "@/components/ProfileContent";

export default function ClientProfilePage() {
  const { data: session } = useSession();
  const name = session?.user?.name || "Professional";
  const email = session?.user?.email || "client@direskilld.com";
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
        {
          label: "Wishlist",
          subtitle: "Saved workers & favorites",
          icon: "favorite",
        },
        {
          label: "Job History",
          subtitle: "All past service requests",
          icon: "history",
        },
      ],
    },
    {
      group: "Support",
      items: [
        {
          label: "Security & Privacy",
          subtitle: "Password, 2FA, data settings",
          icon: "security",
        },
        {
          label: "Contact Support",
          subtitle: "Get help from our team",
          icon: "support_agent",
        },
      ],
    },
  ];

  return (
    <ProfileContent 
      user={{ name, email, role: "client", initials }}
      stats={stats}
      menuGroups={menuGroups}
    />
  );
}
