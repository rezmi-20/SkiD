import Link from "next/link";
import { redirect } from "next/navigation";
import { createAppeal } from "@/lib/actions/governance";
import { APPEAL_REASONS, APPEAL_TYPES } from "@/lib/governance-constants";

export const dynamic = "force-dynamic";

export default function NewWorkerAppealPage() {
  async function submit(formData: FormData) {
    "use server";
    const result = await createAppeal({
      appealType: String(formData.get("appealType") || "") as any,
      targetId: String(formData.get("targetId") || ""),
      reason: String(formData.get("reason") || "") as any,
      explanation: String(formData.get("explanation") || ""),
      evidenceReferences: String(formData.get("evidenceReferences") || "").split(",").map((v) => v.trim()).filter(Boolean),
    });
    if (!result.success) throw new Error(result.error);
    redirect("/worker/appeals");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <Link href="/worker/appeals" className="text-xs font-black uppercase tracking-widest text-primary">Back to appeals</Link>
      <header><p className="text-xs font-black uppercase tracking-widest text-primary">Appeal</p><h1 className="text-3xl font-black">Request governance review</h1></header>
      <form action={submit} className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
        <select name="appealType" required className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
          {APPEAL_TYPES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
        <input name="targetId" required placeholder="Original decision ID" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <select name="reason" required className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
          {APPEAL_REASONS.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
        <textarea name="explanation" required rows={6} placeholder="Explain what changed or what was incorrect" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <input name="evidenceReferences" placeholder="Evidence references, comma separated" className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        <button className="h-11 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary">Submit Appeal</button>
      </form>
    </div>
  );
}
