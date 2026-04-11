import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPageContent from "@/components/LandingPageContent";
import { headers } from "next/headers";

export default async function HomePage({ searchParams }) {
  const session = await auth();
  const headerList = await headers();
  const hasAuthCookie = headerList.get("cookie")?.includes("authjs.session-token") || 
                        headerList.get("cookie")?.includes("__Secure-authjs.session-token");

  return <LandingPageContent userRole={session?.user?.role} />;
}
