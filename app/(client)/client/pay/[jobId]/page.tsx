import { getPaymentPageData } from "@/lib/actions/payments";
import PaymentPageContent from "@/components/PaymentPageContent";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Complete Payment | DireSkill",
  description: "Securely complete your payment for a finished job.",
};

export default async function PaymentPage({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/client/dashboard");

  const { jobId } = await params;
  const data = await getPaymentPageData(jobId);
  if (!data) redirect("/client/contracts");

  if (!["completed", "payment_pending", "paid"].includes(data.job_status)) {
    redirect("/client/contracts");
  }

  const alreadyPaid = data.payment_status === "released" || data.job_status === "paid";

  return (
    <PaymentPageContent
      jobId={data.job_id}
      contractId={data.contract_id ?? "No contract"}
      jobTitle={data.job_title}
      workerName={data.worker_name ?? "Worker"}
      workerAvatar={data.worker_avatar}
      workerVerified={data.worker_verified ?? false}
      amount={data.payment_total ?? data.budget ?? data.paid_amount ?? 0}
      commissionAmount={data.commission_amount ?? 0}
      netAmount={data.net_amount ?? 0}
      commissionRate={data.commission_rate ?? 0.05}
      paymentStatus={data.payment_status ?? "unpaid"}
      alreadyPaid={alreadyPaid}
      existingTxRef={data.tx_ref}
    />
  );
}
