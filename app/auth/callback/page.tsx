import { auth } from "@/lib/auth";
import { isAuthSessionUnavailableError } from "@/lib/auth/session-cookie";
import { sql } from "@/lib/db";
import { getWorkerAccessRoute } from "@/lib/worker-routing";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AuthCallbackPage() {
  try {
    const cookieStore = await cookies();
    const hasAuthCookies = cookieStore.getAll().some((cookie) => cookie.name.includes("neon-auth"));
    const session = await auth();

    if (!session?.user) {
      if (hasAuthCookies) {
        return (
          <div className="min-h-screen bg-background p-6 text-on-background">
            Login succeeded, but the session could not be initialized. Please try again.
          </div>
        );
      }

      redirect("/login?error=no_session");
    }

    if ((session.user as any).isSuspended) {
      redirect("/login?error=suspended");
    }

    const role = (session.user as any).role;

    if (role === "worker") {
      const workerRows = await sql`
        SELECT
          u.is_suspended,
          wp.is_verified,
          wp.verification_status
        FROM users u
        LEFT JOIN worker_profiles wp ON wp.user_id = u.id
        WHERE u.id = ${session.user.id}
        LIMIT 1
      `;

      const worker = workerRows[0];
      redirect(
        getWorkerAccessRoute({
          role,
          isSuspended: worker?.is_suspended ?? false,
          isVerified: worker?.is_verified ?? null,
          verificationStatus: worker?.verification_status ?? null,
        })
      );
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
