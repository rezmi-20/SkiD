"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">contract_edit</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">DireSkill Contracts</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-on-surface">Complete Your Contract Setup</h2>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              To securely sign digital contracts, you must complete your contract setup.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={setupHref}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-black uppercase tracking-widest text-on-primary"
          >
            <span className="material-symbols-outlined text-[18px]">shield_lock</span>
            Set Up Now
          </Link>
          <button
            type="button"
            onClick={() => {
              window.sessionStorage.setItem("direskill_contract_setup_reminded", "true");
              setShowPrompt(false);
            }}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-lg border border-outline-variant bg-surface-container px-4 text-xs font-black uppercase tracking-widest text-on-surface-variant"
          >
            Remind Me Later
          </button>
        </div>
      </div>
    </div>
  );
}
