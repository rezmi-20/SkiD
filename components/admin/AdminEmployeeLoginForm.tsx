"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { loginAdminEmployee } from "@/lib/actions/admin-account";
import DireSkillLogo from "@/components/shell/DireSkillLogo";

export function AdminEmployeeLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await loginAdminEmployee(formData);
      if (result.success) {
        router.replace(result.redirectTo || "/admin/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Invalid Employee ID or password.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-6">
          <DireSkillLogo variant="color" iconSize={38} />
        </div>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Company employee access</p>
            <h1 className="text-2xl font-bold text-on-surface">Administrator login</h1>
            <p className="mt-1 text-xs font-semibold text-on-surface-variant">Authorized employees only</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error === "Temporary credential has expired." ? error : "Invalid Employee ID or password."}
          </div>
        )}

        <form action={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-employee-id" className="text-xs font-bold text-on-surface">Employee ID</label>
            <input
              id="admin-employee-id"
              name="employeeId"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
              placeholder="VER-0001"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-xs font-bold text-on-surface">Password</label>
            <div className="relative">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-outline-variant bg-surface-container px-3.5 py-2.5 pr-11 text-sm text-on-surface outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-on-surface-variant hover:text-on-surface"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary py-2.5 text-xs font-bold uppercase tracking-wider text-on-primary disabled:opacity-60"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
