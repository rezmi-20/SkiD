import { getContractDetails } from "@/lib/actions/contracts";
import ContractDetails from "@/components/ContractDetails";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

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
    <div className="pt-8">
      <ContractDetails contract={contract} userId={session.user.id} />
    </div>
  );
}
