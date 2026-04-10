"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientRegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "client" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please check field formats.");
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-black dark:text-white flex flex-col font-inter transition-colors duration-500">
      
      {/* Precision Navigation */}
      <nav className="p-8 flex justify-between items-center bg-white dark:bg-[#000000] sticky top-0 z-50">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center rounded-lg transition-transform duration-500 group-hover:rotate-12">
             <span className="material-symbols-outlined text-[18px] text-white dark:text-black font-black">group_add</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Client Onboarding</span>
        </div>
        <div className="flex items-center gap-6">
           <a href="/login" className="text-xs font-bold text-gray-400 hover:text-black dark:hover:text-white transition-colors">Sign In</a>
           <div className="h-4 w-px bg-gray-100 dark:bg-white/5" />
           <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-white/10 italic">Dire System</span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 md:py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[450px] space-y-12"
        >
          <header className="space-y-4">
             <h1 className="text-5xl font-black tracking-tightest leading-tight">Start Hiring.</h1>
             <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-lg">
                Create a high-trust client profile to engage with verified professionals in Dire Dawa.
             </p>
          </header>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-5 rounded-xl text-xs font-semibold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Identity Display Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-14 px-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-medium"
                placeholder="Personal or Business Name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Email Identifier</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-14 px-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-medium"
                    placeholder="name@email.com"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Direct Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-14 px-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-medium"
                    placeholder="+251..."
                  />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-gray-500 ml-1">Account Safety Key</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-14 px-5 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none font-medium"
                placeholder="Create Password (Min 6 characters)"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-black dark:bg-white text-white dark:text-black rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-black/10 dark:shadow-white/5 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Register Archive
                  <span className="material-symbols-outlined text-[18px] font-black">add_circle</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-12 border-t border-gray-100 dark:border-white/10 text-center space-y-6">
             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                By joining, you agree to the Dire Marketplace terms for high-trust digital contracts and escrow protocols.
             </div>
             <div>
                <a href="/register/worker" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline underline-offset-8 decoration-blue-500/50">
                   Switch to Worker Onboarding instead
                </a>
             </div>
          </div>
        </motion.div>
      </main>

      {/* Decorative Text Component */}
      <div className="fixed bottom-10 right-10 font-black text-[10vw] text-gray-50 dark:text-white/[0.01] pointer-events-none select-none tracking-tightest leading-none">
        0C
      </div>
    </div>
  );
}
