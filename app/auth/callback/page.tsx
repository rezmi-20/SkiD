import { auth } from "@/lib/auth";
import { isAuthSessionUnavailableError } from "@/lib/auth/session-cookie";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AuthCallbackPage() {
  try {
    const session = await auth();

    if (!session?.user) {
      redirect("/login?error=no_session");
    }

    const role = (session.user as any).role;

    if (role === "admin") {
      redirect("/admin/dashboard");
    }
    if (role === "worker") {
      redirect("/worker/dashboard");
    }
    if (role === "client") {
      redirect("/client/search");
    }

    redirect("/login?error=unknown_role");
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (isAuthSessionUnavailableError(error)) {
      return (
        <div className="min-h-screen bg-background p-6 text-on-background">
          Authentication is temporarily unavailable. Please refresh this page in a moment.
        </div>
      );
    }

    console.error("[CALLBACK] Error:", error.message);
    redirect("/login?error=callback_error");
  }
}
