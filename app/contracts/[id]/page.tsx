import { getContractForSigning } from "@/lib/actions/contracts";
import ContractDetails from "@/components/ContractDetails";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";

export default async function ContractDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if ((session.user as any).isSuspended) {
    redirect("/login?error=suspended");
  }

  const { id } = await params;
  const setup = await getContractSetupStatus(session.user.id, `/contracts/${id}`);
  if (!setup.completed) {
    redirect(setup.setupHref);
  }

  const contract = await getContractForSigning(id);

  if (!contract) {
    notFound();
  }

  return (
    <AppShell
      role={session.user.role as "client" | "worker"}
      userEmail={session.user.email}
      contractSetupComplete={setup.completed}
      contractSetupHref={setup.setupHref}
    >
      <ContractDetails contract={contract} userId={session.user.id} />
    </AppShell>
  );
}
