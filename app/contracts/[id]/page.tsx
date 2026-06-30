import { getContractForSigning } from "@/lib/actions/contracts";
import ContractDetails from "@/components/ContractDetails";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/ui/AppShell";

export default async function ContractDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const contract = await getContractForSigning(id);

  if (!contract) {
    notFound();
  }

  return (
    <AppShell role={session.user.role as "client" | "worker"} userEmail={session.user.email}>
      <ContractDetails contract={contract} userId={session.user.id} />
    </AppShell>
  );
}
