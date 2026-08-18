import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupportTicket } from "@/lib/actions/support";
import { SUPPORT_CATEGORIES } from "@/lib/support-constants";

export const dynamic = "force-dynamic";

export default function NewClientSupportTicketPage() {
  async function create(formData: FormData) {
    "use server";
    const attachmentUrl = String(formData.get("attachmentUrl") || "").trim();
    const result = await createSupportTicket({
      category: String(formData.get("category") || "") as any,
      subject: String(formData.get("subject") || ""),
      description: String(formData.get("description") || ""),
      relatedJobId: String(formData.get("relatedJobId") || "") || null,
      relatedContractId: String(formData.get("relatedContractId") || "") || null,
      relatedPaymentId: String(formData.get("relatedPaymentId") || "") || null,
      attachment: attachmentUrl
        ? {
            url: attachmentUrl,
            fileName: String(formData.get("attachmentName") || "Support attachment"),
            mimeType: String(formData.get("attachmentMime") || "image/png"),
            fileSize: Number(formData.get("attachmentSize") || 1),
          }
        : null,
    });
    if (!result.success) throw new Error(result.error);
    redirect(`/client/support/${result.ticketId}`);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20">
      <Link href="/client/support" className="text-xs font-black uppercase tracking-widest text-primary">Back to support</Link>
      <header>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Support</p>
        <h1 className="text-3xl font-black text-on-surface">Create a support ticket</h1>
      </header>
      <form action={create} className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5">
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-bold">
          Do not include passwords, verification codes, full FIN, or payment credentials.
        </p>
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Category</span>
          <select name="category" required className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
            {SUPPORT_CATEGORIES.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Subject</span>
          <input name="subject" required maxLength={180} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        </label>
        <label className="block">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-widest">Detailed description</span>
          <textarea name="description" required rows={7} className="w-full rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          <input name="relatedJobId" placeholder="Related job ID optional" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
          <input name="relatedContractId" placeholder="Related contract ID optional" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
          <input name="relatedPaymentId" placeholder="Related payment ID optional" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <input name="attachmentUrl" placeholder="Trusted attachment URL optional" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm md:col-span-2" />
          <select name="attachmentMime" className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm">
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/webp">WEBP</option>
            <option value="application/pdf">PDF</option>
          </select>
          <input name="attachmentSize" type="number" defaultValue={1} className="rounded-lg border border-outline-variant bg-surface-container p-3 text-sm" />
        </div>
        <input type="hidden" name="attachmentName" value="Support attachment" />
        <button className="h-12 rounded-lg bg-primary px-5 text-xs font-black uppercase tracking-widest text-on-primary">Create Ticket</button>
      </form>
    </div>
  );
}
