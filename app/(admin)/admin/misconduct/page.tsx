import { getMisconductReviews, getMisuseIndicators } from "@/lib/actions/governance";
import MisconductReviewManager from "@/components/governance/MisconductReviewManager";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MisconductReviewsPage() {
  const [reviews, indicators] = await Promise.all([
    getMisconductReviews(),
    getMisuseIndicators(),
  ]);

  return (
    <div className="space-y-6 pb-20">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary tracking-wide uppercase">
          <ShieldAlert className="h-3 w-3" />
          Governance & Ethics Board
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Administrator Accountability & Misconduct Reviews
        </h1>
        <p className="text-xs text-muted-foreground">
          Super Admin oversight panel for auditing staff actions, reviewing misuse indicators, and ensuring platform integrity.
        </p>
      </header>

      <MisconductReviewManager
        indicators={indicators as any[]}
        reviews={reviews as any[]}
      />
    </div>
  );
}
