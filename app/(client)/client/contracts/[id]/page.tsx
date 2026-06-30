import { getContractForSigning } from "@/lib/actions/contracts";
import ContractDetails from "@/components/ContractDetails";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

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
  const contract = await getContractForSigning(id);

  if (!contract) {
    notFound();
  }

  return <ContractDetails contract={contract} userId={session.user.id} />;
}
