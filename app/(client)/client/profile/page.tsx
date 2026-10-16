import { getProfileData } from "@/lib/actions/profile";
import ProfileContent from "@/components/ProfileContent";
import { redirect } from "next/navigation";

export default async function ClientProfilePage() {
  const profile = await getProfileData();

  if (!profile) {
    redirect("/login");
  }

  const name = profile.full_name || "Professional";
  const email = profile.email || "client@direskilld.com";
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
        avatarUrl: profile.avatar_url || "/default-avatar.svg",
        phone: profile.phone,
        gender: profile.gender,
        dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : undefined,
        district: profile.district,
        is_verified: Boolean(profile.is_verified && profile.has_fin),
        verificationStatus: profile.verification_status || "incomplete",
        maskedFin: profile.masked_fin || null
      }}
      stats={stats}
      menuGroups={menuGroups}
    />
  );
}

