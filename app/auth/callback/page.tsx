import { auth } from "@/lib/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuthCallbackPage() {
  console.log("\n=== AUTH CALLBACK STARTED ===");

  try {
    const session = await auth();
    console.log("[CALLBACK] Raw session:", JSON.stringify(session?.user?.email));
    console.log("[CALLBACK] Has user:", !!session?.user);
    console.log("[CALLBACK] User role:", (session?.user as any)?.role);

    if (!session?.user) {
      console.log("[CALLBACK] No session, redirecting to /login");
      redirect("/login?error=no_session");
    }

    const role = (session.user as any).role;
    console.log("[CALLBACK] Role found:", role);

    if (role === "admin") {
      console.log("[CALLBACK] -> /admin/dashboard");
      redirect("/admin/dashboard");
    }
    if (role === "worker") {
      console.log("[CALLBACK] -> /worker/dashboard");
      redirect("/worker/dashboard");
    }
    if (role === "client") {
      console.log("[CALLBACK] -> /client/search");
      redirect("/client/search");
    }

    console.log("[CALLBACK] Unknown role, redirecting to /login");
    redirect("/login?error=unknown_role");
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("[CALLBACK] Error:", error.message);
    redirect("/login?error=callback_error");
  }
}
