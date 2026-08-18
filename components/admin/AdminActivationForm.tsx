"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { activateAdminAccount } from "@/lib/actions/admin-account";
import { useLanguage } from "@/context/LanguageContext";

export function AdminActivationForm({
  employeeId,
  fullName,
  email,
  role,
  department,
}: {
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await activateAdminAccount(formData);
      if (result.success) {
        router.replace(result.redirectTo || "/admin/dashboard");
        router.refresh();
      } else {
        setError(result.error || t("admin.activation.failed"));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t("admin.activation.eyebrow")}</p>
            <h1 className="text-2xl font-bold text-on-surface">{t("admin.activation.title")}</h1>
          </div>
        </div>

        <div className="mb-5 grid gap-3 rounded-lg border border-outline-variant bg-surface-container p-4 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.employeeId")}</p>
            <p className="font-mono font-bold text-on-surface">{employeeId}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.fullName")}</p>
            <p className="font-bold text-on-surface">{fullName}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.workEmail")}</p>
            <p className="font-semibold text-on-surface">{email}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.department")}</p>
            <p className="font-semibold text-on-surface">{department}</p>
          </div>
          <p className="text-on-surface-variant">{role.replaceAll("_", " ")} · {department}</p>
        </div>

        <div className="mb-4 rounded-lg border border-outline-variant bg-surface-container p-3 text-xs font-semibold text-on-surface-variant">
          {t("admin.activation.passwordPolicy")}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <form action={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">{t("admin.common.newPassword")}</label>
            <input
              name="password"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface">{t("admin.common.confirmPassword")}</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold uppercase tracking-wider text-on-primary disabled:opacity-60"
          >
            {isPending ? t("admin.activation.submitting") : t("admin.activation.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
