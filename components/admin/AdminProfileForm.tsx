"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAdminPassword } from "@/lib/actions/admin-account";

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
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  const submitPassword = (formData: FormData) => {
    setPasswordMessage(null);
    startPasswordTransition(async () => {
      const result = await updateAdminPassword(formData);
      setPasswordMessage(result.success ? result.message || "Password updated." : result.error || "Password update failed.");
      if (result.success && result.redirectTo) router.replace(result.redirectTo);
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-outline-variant bg-surface-container-low p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Admin profile</p>
        <h1 className="mt-1 text-2xl font-bold text-on-surface">{profile.full_name || "Administrator"}</h1>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Employee ID</p>
            <p className="font-mono font-semibold text-on-surface">{profile.admin_employee_id}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Work email</p>
            <p className="font-semibold text-on-surface">{profile.work_email}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Department</p>
            <p className="font-semibold text-on-surface">{profile.department}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Role</p>
            <p className="font-semibold text-on-surface">{profile.admin_role?.replaceAll("_", " ")}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</p>
            <p className="font-semibold text-on-surface">{profile.admin_status}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Activation date</p>
            <p className="font-semibold text-on-surface">{profile.activation_completed_at ? new Date(profile.activation_completed_at).toLocaleDateString() : "Pending"}</p>
          </div>
        </div>
      </div>

      <form action={submitPassword} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 space-y-4">
        <h2 className="text-lg font-bold text-on-surface">Change password</h2>
        {passwordMessage && <p className="rounded-lg bg-surface-container p-3 text-sm font-semibold text-on-surface">{passwordMessage}</p>}
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Current password"
          className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          name="password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder="New strong password"
          className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          placeholder="Confirm new password"
          className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button disabled={isPasswordPending} className="rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-on-primary disabled:opacity-60">
          {isPasswordPending ? "Saving..." : "Save password"}
        </button>
      </form>
    </div>
  );
}
