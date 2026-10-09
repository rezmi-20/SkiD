"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SocialProfileState = {
  completed?: boolean;
  route?: string | null;
  email?: string;
  name?: string;
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<SocialProfileState | null>(null);
  const [role, setRole] = useState<"client" | "worker">("client");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/social-profile", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Please sign in with Google again.");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (data.completed && data.route) {
          router.replace(data.route);
          return;
        }
        setProfile(data);
        setFullName(data.name || "");
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not load your Google profile.");
      });
    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/social-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, fullName, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not complete your profile.");
        return;
      }
      router.replace(data.route || "/login");
    } catch (err: any) {
      setError(err.message || "Could not complete your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#09090b] px-6 py-10 text-white">
      <main className="mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-[440px] flex-col justify-center">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-green-400">Google Sign In</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Finish your SkiD profile</h1>
          <p className="mt-3 text-sm font-medium text-zinc-400">
            Choose how you will use DireSkill so we can route your account correctly.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl">
          <div>
            <label className="ml-1 text-[13px] font-medium text-zinc-300">Email</label>
            <input
              value={profile?.email || ""}
              disabled
              className="mt-1.5 h-[52px] w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 text-sm font-medium text-zinc-400"
            />
          </div>

          <div>
            <label className="ml-1 text-[13px] font-medium text-zinc-300">Full name</label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              minLength={2}
              className="mt-1.5 h-[52px] w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium outline-none transition focus:border-green-400"
            />
          </div>

          <div>
            <label className="ml-1 text-[13px] font-medium text-zinc-300">Phone number</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              placeholder="0911 997 755"
              className="mt-1.5 h-[52px] w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium outline-none transition placeholder:text-zinc-500 focus:border-green-400"
            />
          </div>

          <div>
            <label className="ml-1 text-[13px] font-medium text-zinc-300">Account type</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(["client", "worker"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className={`h-[48px] rounded-2xl border text-sm font-bold capitalize transition ${
                    role === value ? "border-green-400 bg-green-400 text-black" : "border-zinc-700 bg-zinc-900 text-white"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-[52px] w-full rounded-full bg-green-400 text-sm font-black text-black transition hover:bg-green-500 disabled:opacity-70"
          >
            {isLoading ? "Saving..." : "Continue"}
          </button>
        </form>
      </main>
    </div>
  );
}
