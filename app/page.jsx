import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPageContent from "@/components/LandingPageContent";

export default async function HomePage({ searchParams }) {
  const session = await auth();

  return <LandingPageContent userRole={session?.user?.role} />;
}
