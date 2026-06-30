import { getWorkerEarnings } from "@/lib/actions/payments";
import WorkerEarningsContent from "@/components/WorkerEarningsContent";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Earnings | DireSkill",
  description: "Review worker earnings and payment history.",
};

export default async function EarningsPage() {
  const session = await auth();
  if (!session || session.user.role !== "worker") redirect("/login");

  const earnings = await getWorkerEarnings();

  return <WorkerEarningsContent earnings={earnings} />;
}
