"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Use the host serving this page so preview, production, and local reset
      // links do not inherit a stale NEXT_PUBLIC_APP_URL from another deploy.
      const redirectTo = new URL("/reset-password", window.location.origin).toString();
      const { error: resetError } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message || "Could not send password reset email.");
        return;
      }

      setMessage("If an account exists for that email, a password reset link has been sent.");
    } catch (err: any) {
      setError(err.message || "Could not send password reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#09090b] px-6 py-10 text-white">
      <main className="mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-[420px] flex-col justify-center">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-green-400">Account Recovery</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Reset your password</h1>
          <p className="mt-3 text-sm font-medium text-zinc-400">
            Enter the email address on your DireSkill account.
          </p>
        </div>

        {message ? <div className="mb-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm font-semibold text-green-300">{message}</div> : null}
        {error ? <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">{error}</div> : null}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl">
          <div>
            <label className="ml-1 text-[13px] font-medium text-zinc-300">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1.5 h-[52px] w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium outline-none transition placeholder:text-zinc-500 focus:border-green-400"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="h-[52px] w-full rounded-full bg-green-400 text-sm font-black text-black transition hover:bg-green-500 disabled:opacity-70"
          >
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <Link href="/login" className="mt-6 text-center text-sm font-bold text-green-400 hover:text-green-300">
          Back to sign in
        </Link>
      </main>
    </div>
  );
}
