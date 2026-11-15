import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getClientPayments } from "@/lib/actions/payments";
import ClientPaymentsContent from "@/components/ClientPaymentsContent";

export const metadata = {
  title: "Payments | DireSkill",
  description: "Review completed job payments and payment status.",
};

export default async function ClientPaymentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "client") redirect("/login");

  const payments = await getClientPayments();

  return (
    <div className="mx-auto max-w-5xl">
      <ClientPaymentsContent payments={payments as any[]} />
    </div>
  );
}
