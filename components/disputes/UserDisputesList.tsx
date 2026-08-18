import Link from "next/link";
import { Scale } from "lucide-react";

export default function UserDisputesList({ disputes, role }: { disputes: any[]; role: "client" | "worker" }) {
  return (
    <div className="space-y-4">
      {disputes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center">
          <Scale className="mx-auto h-10 w-10 text-on-surface-variant opacity-50" />
          <p className="mt-3 text-sm font-black uppercase tracking-wider">No disputes yet</p>
        </div>
      ) : (
        disputes.map((dispute) => (
          <Link
            key={dispute.id}
            href={`/${role}/disputes/${dispute.id}`}
            className="block rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 hover:border-primary"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-black text-on-surface">{dispute.title || dispute.job_title}</p>
                <p className="mt-1 text-xs font-bold text-on-surface-variant">
                  {dispute.category?.replaceAll("_", " ")} · {dispute.job_title}
                </p>
              </div>
              <span className="rounded-full border border-outline-variant px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                {String(dispute.status).replaceAll("_", " ")}
              </span>
            </div>
            <p className="mt-3 text-xs font-bold text-on-surface-variant">
              Required action: {String(dispute.required_action || "none").replaceAll("_", " ")}
            </p>
          </Link>
        ))
      )}
    </div>
  );
}
