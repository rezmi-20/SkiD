import { getContractForSigning } from "@/lib/actions/contracts";
import ContractDetails from "@/components/ContractDetails";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";
import { DEMO_CONTRACT_DATA } from "@/lib/mock-contract";

export const dynamic = "force-dynamic";

export default async function WorkerContractDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const isDemo = id === "demo";

  if (!session?.user?.id && !isDemo) {
    redirect("/login");
  }

  const userId = session?.user?.id || "worker-demo";

  if (!isDemo && session?.user?.id) {
    const setup = await getContractSetupStatus(session.user.id, `/worker/contracts/${id}`);
    if (!setup.completed) {
      redirect(setup.setupHref);
    }
  }

  let contract = null;
  if (!isDemo) {
    try {
      contract = await getContractForSigning(id);
    } catch {
      contract = null;
    }
  }

  const finalContract = contract || DEMO_CONTRACT_DATA;

  return <ContractDetails contract={finalContract} userId={userId} />;
}
