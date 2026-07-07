import AdminPaymentReportsContent from "@/components/AdminPaymentReportsContent";
import { getAdminPaymentReport } from "@/lib/actions/admin-payments";

export const metadata = {
  title: "Payments & Payouts | DireSkill Admin",
  description: "Manage Chapa payments, platform commission releases, and payouts.",
};

export default async function PaymentsPage() {
  const report = await getAdminPaymentReport();
  return <AdminPaymentReportsContent report={report} />;
}
