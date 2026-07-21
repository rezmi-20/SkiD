import { getUserContracts } from "@/lib/actions/contracts";
import ContractsPageContent from "@/components/ContractsPageContent";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";
import { redirect } from "next/navigation";

export default async function WorkerContractsPage() {
  const setup = await getContractSetupStatus();
  if (!setup.completed) {
    redirect(setup.setupHref);
  }

  const contracts = await getUserContracts();
  
  return <ContractsPageContent contracts={contracts} role="worker" />;
}
