import { getContractForSigning } from "@/lib/actions/contracts";
import ContractDetails from "@/components/ContractDetails";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";

export default async function RoleContractDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const setup = await getContractSetupStatus(session.user.id, `/client/contracts/${id}`);
  if (!setup.completed) {
    redirect(setup.setupHref);
  }

  const contract = await getContractForSigning(id);

  if (!contract) {
    notFound();
  }

  return <ContractDetails contract={contract} userId={session.user.id} />;
}
