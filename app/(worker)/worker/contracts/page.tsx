import { getUserContracts } from "@/lib/actions/contracts";
import ContractsPageContent from "@/components/ContractsPageContent";

export default async function WorkerContractsPage() {
  const contracts = await getUserContracts();
  
  return <ContractsPageContent contracts={contracts} role="worker" />;
}
