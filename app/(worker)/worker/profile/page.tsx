import { getProfileData } from "@/lib/actions/profile";
import { redirect } from "next/navigation";
import WorkerProfileClient from "./WorkerProfileClient";

export default async function WorkerProfilePage() {
  const profile = await getProfileData();

  if (!profile) {
    redirect("/login");
  }

  return <WorkerProfileClient profile={profile} />;
}

