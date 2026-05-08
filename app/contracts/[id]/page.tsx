import { getContractDetails } from "@/lib/actions/contracts";
import ContractDetails from "@/components/ContractDetails";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import AppShell from "@/components/ui/AppShell";

export default async function ContractDetailsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const contract = await getContractDetails(params.id);
  
  if (!contract) {
    notFound();
  }

  return (
    <AppShell role={session.user.role as "client" | "worker"} userEmail={session.user.email}>
      <div className="pt-8 px-4">
        <ContractDetails contract={contract} userId={session.user.id} />
      </div>
    </AppShell>
  );
}
