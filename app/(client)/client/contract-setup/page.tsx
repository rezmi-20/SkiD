import ContractSetupContent from "@/components/ContractSetupContent";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";

export default async function ClientContractSetupPage() {
  const status = await getContractSetupStatus();

  return (
    <ContractSetupContent
      role="client"
      completed={status.completed}
      completedAt={status.completedAt ? String(status.completedAt) : null}
    />
  );
}
