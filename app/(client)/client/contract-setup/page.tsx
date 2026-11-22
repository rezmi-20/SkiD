import ContractSetupContent from "@/components/ContractSetupContent";
import { getContractSetupStatus } from "@/lib/actions/contract-setup";

export default async function ClientContractSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const status = await getContractSetupStatus(undefined, params.returnTo || "/client/contract-setup");

  return (
    <ContractSetupContent
      role="client"
      completed={status.completed}
      completedAt={status.completedAt ? String(status.completedAt) : null}
      returnTo={params.returnTo}
    />
  );
}
