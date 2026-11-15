import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import PaymentPageContent from "@/components/PaymentPageContent";

export const metadata = {
  title: "Complete Payment | DireSkill",
  description: "Securely complete your payment for a finished job.",
};

export default async function ClientPayIndexPage() {
  const session = await auth();
  if (!session || (session.user.role !== "client" && session.user.role !== "admin")) {
    redirect("/login");
  }

  // Check if client has a completed job awaiting payment
  const pendingJobs = await sql`
    SELECT id FROM jobs 
    WHERE client_id = ${session.user.id} 
      AND status IN ('completed', 'payment_pending')
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (pendingJobs.length > 0) {
    redirect(`/client/pay/${pendingJobs[0].id}`);
  }

  // If no live pending job, render the full Payment UI in demo/inspection mode
  return (
    <PaymentPageContent
      jobId="demo-solar-installation"
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
