import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "client") {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-headline font-black text-primary italic">DIRE CLIENT</div>
          <div className="flex gap-4">
            <span className="text-sm text-on-surface-variant">{session.user.email}</span>
          </div>
        </div>
      </nav>
      <main className="flex-grow p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
