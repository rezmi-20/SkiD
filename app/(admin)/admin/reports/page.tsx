import AdminPaymentReportsContent from "@/components/AdminPaymentReportsContent";
import { getAdminPaymentReport } from "@/lib/actions/admin-payments";

export const metadata = {
  title: "Payment Reports | DireSkill Admin",
  description: "Review Chapa payment revenue, commission, payouts, and receipts.",
};

export default async function ReportsPage() {
  const report = await getAdminPaymentReport();
  return <AdminPaymentReportsContent report={report} />;
}
