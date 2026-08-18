import { auth } from "@/lib/auth";
import { isAuthSessionUnavailableError } from "@/lib/auth/session-cookie";
import { redirect } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";
import { maybeSendClientVerificationReminder } from "@/lib/client-verification-reminders";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    if (isAuthSessionUnavailableError(error)) {
      return (
        <div className="min-h-screen bg-background p-6 text-on-background">
          Authentication is temporarily unavailable. Please refresh this page in a moment.
        </div>
      );
    }
    throw error;
  }

  if ((session?.user as any)?.isSuspended) {
    redirect("/login?error=suspended");
  }

  if (!session || session.user.role !== "client") {
    redirect("/login");
  }

  let contractSetup = { completed: true, setupHref: "/client/contract-setup" };
  try {
    contractSetup = await getContractSetupStatus(session.user.id);
  } catch (error) {
    if (!isAuthSessionUnavailableError(error)) {
      throw error;
    }
  }

  maybeSendClientVerificationReminder(session.user.id).catch(() => undefined);

  return (
    <AppShell
      role="client"
      userEmail={session.user.email}
      contractSetupComplete={contractSetup.completed}
      contractSetupHref={contractSetup.setupHref}
    >
      {children}
    </AppShell>
  );
}
