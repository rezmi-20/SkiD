"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FileSignature, ShieldCheck } from "lucide-react";

interface Props {
  completed: boolean;
  setupHref: string;
}

export default function ContractSetupPrompt({ completed, setupHref }: Props) {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (completed || pathname?.includes("contract-setup")) {
      setShowPrompt(false);
      return;
    }

    const reminded = window.sessionStorage.getItem("direskill_contract_setup_reminded");
    setShowPrompt(reminded !== "true");
  }, [completed, pathname]);

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileSignature className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary tracking-wide uppercase mb-1">
              DireSkill Contracts
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground">Complete Your Contract Setup</h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              To securely sign and verify digital 2-party contracts, complete your contract PIN setup.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            href={setupHref}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Set Up Now</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.setItem("direskill_contract_setup_reminded", "true");
              setShowPrompt(false);
            }}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border/70 bg-background hover:bg-muted px-4 text-xs font-bold text-muted-foreground hover:text-foreground active:scale-95 transition"
          >
            Remind Me Later
          </button>
        </div>
      </div>
    </div>
  );
}
