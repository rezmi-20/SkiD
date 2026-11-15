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
  if (!session || (session.user.role !== "client" && session.user.role !== "admin")) {
    redirect("/client/dashboard");
  }

  const { jobId } = await params;
  const isDemo = jobId === "demo" || jobId === "test" || jobId.startsWith("demo-");

  let data = null;
  if (!isDemo) {
    try {
      data = await getPaymentPageData(jobId);
    } catch {
      data = null;
    }
  }

  // If live data not found or demo mode requested, render demo inspection state
  if (!data || isDemo) {
    return (
      <PaymentPageContent
        jobId={isDemo ? jobId : "demo-solar-installation"}
        contractId="DS-2026-KEB-02"
        jobTitle="Solar Water Heater 300L & PEX Piping"
        workerName="Kassahun Mengistu"
        workerAvatar="/images/user_review_card.jpg"
        workerVerified={true}
        amount={4500}
        commissionAmount={225}
        netAmount={4275}
        commissionRate={0.05}
        paymentStatus="held"
        chapaStatus="pending"
        alreadyPaid={false}
        paymentId="DEMO-PAY-ID"
        existingTxRef="DS-CHAPA-DEMO-77821"
        isDemoMode={true}
      />
    );
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
      chapaStatus={data.chapa_status ?? null}
      alreadyPaid={alreadyPaid}
      paymentId={data.payment_id ?? null}
      existingTxRef={data.tx_ref}
      isDemoMode={false}
    />
  );
}
