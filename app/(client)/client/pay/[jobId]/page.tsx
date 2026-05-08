import { getPaymentPageData } from "@/lib/actions/payments";
import PaymentPageContent from "@/components/PaymentPageContent";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Complete Payment | DireSkill",
  description: "Securely complete your payment for a finished job.",
};

export default async function PaymentPage({ params }: { params: { jobId: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/client/dashboard");

  const data = await getPaymentPageData(params.jobId);
  if (!data) redirect("/client/contracts");

  // Only allow payment if contract is signed and job is not cancelled
  if (!data.signed_at || data.job_status === "cancelled") {
    redirect("/client/contracts");
  }

  const alreadyPaid = data.payment_status === "released";

  return (
    <PaymentPageContent
      jobId={data.job_id}
      contractId={data.contract_id}
      jobTitle={data.job_title}
      workerName={data.worker_name ?? "Worker"}
      workerAvatar={data.worker_avatar}
      workerVerified={data.worker_verified ?? false}
      amount={data.budget ?? data.paid_amount ?? 0}
      alreadyPaid={alreadyPaid}
      existingTxRef={data.tx_ref}
    />
  );
}
