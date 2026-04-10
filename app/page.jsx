import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPageContent from "@/components/LandingPageContent";
import { headers } from "next/headers";

export default async function HomePage({ searchParams }) {
  const session = await auth();
  const headerList = await headers();
  const hasAuthCookie = headerList.get("cookie")?.includes("authjs.session-token") || 
                        headerList.get("cookie")?.includes("__Secure-authjs.session-token");

  // If session exists, force redirect
  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    if (role === "admin") redirect("/admin/dashboard");
    if (role === "worker") redirect("/worker/dashboard");
    if (role === "client") redirect("/client/dashboard");
  }

  // DIAGNOSTIC DATA
  const isDebug = (await searchParams).debug === "true";
  
  if (isDebug) {
    return (
      <div className="p-10 bg-black text-white font-mono text-xs">
        <h1 className="text-xl font-bold text-red-500 mb-4">DIAGNOSTIC MODE</h1>
        <p>Session Found: {session ? "YES" : "NO"}</p>
        <p>Auth Cookie Detected: {hasAuthCookie ? "YES" : "NO"}</p>
        <p>Database URL Status: {process.env.DATABASE_URL ? "CONFIGURED" : "MISSING"}</p>
        <p>Auth Secret Status: {process.env.AUTH_SECRET ? "CONFIGURED" : "MISSING"}</p>
        <hr className="my-4 border-gray-800" />
        <p>Role in Session: {(session?.user as any)?.role || "N/A"}</p>
        <a href="/" className="mt-6 inline-block bg-white text-black px-4 py-2 rounded">Back to Landing</a>
      </div>
    );
  }

  return <LandingPageContent />;
}
