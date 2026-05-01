import { getUserContracts } from "@/lib/actions/contracts";
import ContractsPageContent from "@/components/ContractsPageContent";

export default async function ClientContractsPage() {
  const contracts = await getUserContracts();
  
  return <ContractsPageContent contracts={contracts} role="client" />;
}
