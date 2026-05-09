import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/ui/AppShell";

export default async function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "worker") {
    redirect("/login");
  }

  return (
    <AppShell role="worker" userEmail={session.user.email}>
      {children}
    </AppShell>
  );
}
