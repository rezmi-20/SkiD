import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "client") {
    redirect("/login");
  }

  const contractSetup = await getContractSetupStatus(session.user.id);

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
