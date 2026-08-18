"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAdminPassword } from "@/lib/actions/admin-account";
import { useLanguage } from "@/context/LanguageContext";

type Profile = {
  email: string;
  admin_employee_id: string;
  work_email: string;
  full_name: string;
  department: string;
  phone?: string | null;
  admin_role: string;
  admin_status: string;
  activation_completed_at?: string | null;
};

export function AdminProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const submitPassword = (formData: FormData) => {
    setPasswordMessage(null);
    startPasswordTransition(async () => {
      const result = await updateAdminPassword(formData);
      setPasswordMessage(result.success ? result.message || t("admin.profile.passwordUpdated") : result.error || t("admin.profile.passwordFailed"));
      if (result.success && result.redirectTo) router.replace(result.redirectTo);
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{t("admin.profile.eyebrow")}</p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface">{profile.full_name || t("admin.profile.fallbackName")}</h1>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.employeeId")}</p>
            <p className="font-mono font-semibold text-on-surface">{profile.admin_employee_id}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.workEmail")}</p>
            <p className="font-semibold text-on-surface">{profile.work_email}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.department")}</p>
            <p className="font-semibold text-on-surface">{profile.department}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.role")}</p>
            <p className="font-semibold text-on-surface">{profile.admin_role?.replaceAll("_", " ")}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.status")}</p>
            <p className="font-semibold text-on-surface">{profile.admin_status}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{t("admin.common.activationDate")}</p>
            <p className="font-semibold text-on-surface">{profile.activation_completed_at ? new Date(profile.activation_completed_at).toLocaleDateString() : t("admin.common.pending")}</p>
          </div>
        </div>
      </div>

      <form action={submitPassword} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 space-y-4">
        <h2 className="text-lg font-bold text-on-surface">{t("admin.profile.changePassword")}</h2>
        {passwordMessage && <p className="rounded-lg bg-surface-container p-3 text-sm font-semibold text-on-surface">{passwordMessage}</p>}
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          placeholder={t("admin.profile.placeholder.currentPassword")}
          className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder={t("admin.profile.placeholder.newPassword")}
          className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder={t("admin.profile.placeholder.confirmPassword")}
          className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button disabled={isPasswordPending} className="rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-on-primary disabled:opacity-60">
          {isPasswordPending ? t("admin.common.saving") : t("admin.common.savePassword")}
        </button>
      </form>
    </div>
  );
}
