import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPageContent from "@/components/LandingPageContent";

/**
 * Root Page (Server Component)
 * 
 * This is our 'Double-Lock' redirect. Even if the middleware fails 
 * or is bypassed by the platform, this server component will 
 * intercept any logged-in user and force them into their dashboard.
 */
export default async function HomePage() {
  const session = await auth();

  // If session exists, force redirect to dashboard based on role
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    
    if (role === "admin") {
      redirect("/admin/dashboard");
    } else if (role === "worker") {
      redirect("/worker/dashboard");
    } else if (role === "client") {
      redirect("/client/dashboard");
    }
  }

  // If no session, show the beautiful landing page
  return <LandingPageContent />;
}
