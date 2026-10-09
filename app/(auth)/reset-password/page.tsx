"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";

function validatePassword(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a special character.";
  return null;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(token ? "" : "Password reset token is missing or expired.");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        setError(resetError.message || "Could not reset password.");
        return;
      }

      router.replace("/login?reset=success");
    } catch (err: any) {
      setError(err.message || "Could not reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#09090b] px-6 py-10 text-white">
      <main className="mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-[420px] flex-col justify-center">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-green-400">Account Recovery</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Create a new password</h1>
          <p className="mt-3 text-sm font-medium text-zinc-400">
            Use a strong password with uppercase, lowercase, number, and symbol.
          </p>
        </div>

        {error ? <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl">
          <div>
            <label className="ml-1 text-[13px] font-medium text-zinc-300">New password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
              className="mt-1.5 h-[52px] w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium outline-none transition focus:border-green-400"
            />
          </div>
          <div>
            <label className="ml-1 text-[13px] font-medium text-zinc-300">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              autoComplete="new-password"
              className="mt-1.5 h-[52px] w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium outline-none transition focus:border-green-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !token}
            className="h-[52px] w-full rounded-full bg-green-400 text-sm font-black text-black transition hover:bg-green-500 disabled:opacity-70"
          >
            {isLoading ? "Saving..." : "Reset password"}
          </button>
        </form>

        <Link href="/login" className="mt-6 text-center text-sm font-bold text-green-400 hover:text-green-300">
          Back to sign in
        </Link>
      </main>
    </div>
  );
}
