export const dynamic = 'force-dynamic';
import { auth } from "@/lib/auth";
import { getDisputes } from "@/lib/actions/disputes";
import { redirect } from "next/navigation";
import AdminDisputesContent from "@/components/AdminDisputesContent";

export default async function DisputesPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/login");
  }

  const disputes = await getDisputes();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AdminDisputesContent initialDisputes={disputes} />
    </div>
  );
}
