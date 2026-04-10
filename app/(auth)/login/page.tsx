"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("The credentials you provided are incorrect.");
      } else {
        // Fetch session to determine role-based redirect
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const role = (session?.user as any)?.role;

        if (role === "admin") {
          window.location.href = "/admin/dashboard";
        } else if (role === "worker") {
          window.location.href = "/worker/dashboard";
        } else if (role === "client") {
          window.location.href = "/client/dashboard";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#000000] text-black dark:text-white transition-colors duration-500 font-inter selection:bg-blue-500/30">
      
      {/* Precision Header */}
      <header className="p-8 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center rounded-lg rotate-0 group-hover:rotate-45 transition-transform duration-500">
             <span className="material-symbols-outlined text-[18px] text-white dark:text-black font-black">bolt</span>
          </div>
          <span className="text-sm font-black tracking-[0.3em] uppercase">DireSkill</span>
        </div>
        <div className="flex items-center gap-6">
           <a href="/register/client" className="text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors">Register</a>
           <div className="h-4 w-px bg-gray-100 dark:bg-white/10" />
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Auth System</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px] space-y-12"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tightest">Sign In</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              Access your workspace to manage your professional tasks and earnings.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 ml-1">Account Identifier</label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/5 font-medium"
                placeholder="Email or phone number"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Secure Access Key</label>
                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors">Forgot?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/5 font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 shadow-sm flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Enter Workspace
                  <span className="material-symbols-outlined text-[16px] font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-8 border-t border-gray-100 dark:border-white/10 text-center space-y-4">
             <p className="text-xs text-gray-400 font-medium">
               New to the marketplace? {" "}
               <a href="/register/client" className="text-black dark:text-white font-black decoration-blue-500 hover:underline underline-offset-4">Create Account</a>
             </p>
             <p className="text-[10px] text-gray-300 dark:text-gray-600 font-black uppercase tracking-[0.2em]">
               Digital ID Verification required by Fayda
             </p>
          </div>
        </motion.div>
      </main>

      {/* High-End Footer */}
      <footer className="p-8 hidden md:flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-white/10">
         <div>© 2026 Dire Enterprise</div>
         <div className="flex gap-8">
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Support</a>
         </div>
      </footer>
    </div>
  );
}
