import { getProfileData } from "@/lib/actions/profile";
import SettingsContent from "@/components/SettingsContent";
import { redirect } from "next/navigation";

export default async function WorkerSettingsPage() {
  const profileData = await getProfileData();
  
  if (!profileData) {
    redirect("/login");
  }

  return <SettingsContent initialData={profileData} role="worker" />;
}
