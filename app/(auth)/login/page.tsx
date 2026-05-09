"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";
  const needsVerification = searchParams.get("verify") === "true";

  // Detect input type
  const isEmail = identifier.includes("@");
  const isPhone = !isEmail && /^[0-9+]/.test(identifier);

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      const { authClient } = await import("@/lib/auth/client");
      const { data: session } = await authClient.getSession();
      if (session) {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { role } = await res.json();
          if (role === "client") router.replace("/client/search");
          else if (role === "worker") router.replace("/worker/dashboard");
          else if (role === "admin") router.replace("/admin/dashboard");
        }
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { authClient } = await import("@/lib/auth/client");

      let emailToUse = identifier.trim();

      // If the user typed a phone number, look up their email from our DB
      if (!isEmail) {
        const lookupRes = await fetch("/api/auth/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: identifier }),
        });

        if (!lookupRes.ok) {
          setError("No account found with this phone number.");
          setIsLoading(false);
          return;
        }

        const { email } = await lookupRes.json();
        emailToUse = email;
      }

      const { error: signInError } = await authClient.signIn.email({
        email: emailToUse,
        password,
      });

      if (signInError) {
        setError("Invalid credentials. Please check your email/phone and password.");
      } else {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { role } = await res.json();
          if (role === "admin") window.location.href = "/admin/dashboard";
          else if (role === "worker") window.location.href = "/worker/dashboard";
          else if (role === "client") window.location.href = "/client/search";
          else window.location.href = "/";
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
    <div className="min-h-[100dvh] w-full flex bg-[#09090b] text-white font-inter overflow-x-hidden selection:bg-green-400/30">
      
      {/* Desktop Art / Branding Side (Left) */}
      <div className="hidden lg:flex w-1/2 relative bg-[#09090b] border-r border-zinc-800/50 overflow-hidden items-center justify-center p-12">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop" 
            alt="Office Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[#09090b]/40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/30"></div>
        </div>

        {/* Subtle Ambient Green Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/15 blur-[120px] pointer-events-none rounded-full z-0 mix-blend-screen" />
        
        <div className="absolute top-12 left-12 flex items-center gap-3 z-20">
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-2xl shadow-lg shadow-white/5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#09090b]">
              <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
              <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Dire<span className="text-green-400">Skill</span></span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white/5 border border-white/10 flex items-center justify-center rounded-3xl backdrop-blur-xl mb-8 shadow-2xl">
             <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
              <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
              <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
            </svg>
          </div>
          <h2 className="text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
            Elevate your <br/><span className="text-green-400">Professional</span> Journey
          </h2>
          <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
            Join the premier marketplace for top-tier professionals and extraordinary opportunities.
          </p>
        </div>
        
        <div className="absolute bottom-12 left-12 flex items-center gap-4 text-sm font-medium text-zinc-500">
          <Link href="#" className="hover:text-green-400 transition-colors">Privacy Policy</Link>
          <span>&bull;</span>
          <Link href="#" className="hover:text-green-400 transition-colors">Terms of Service</Link>
        </div>
      </div>

      {/* Form Side (Right on Desktop, Full on Mobile) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[100dvh]">
        
        {/* Mobile Ambient Glow */}
        <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[150px] pointer-events-none rounded-full" />

        <div className="w-full max-w-[420px] px-6 py-12 z-10 flex flex-col min-h-[100dvh] items-center justify-center relative">
          
          {/* Header Section */}
          <div className="flex flex-col items-center mb-8 space-y-5 w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-white flex items-center justify-center rounded-2xl shadow-lg shadow-white/5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-[#09090b]">
                  <path d="M 11 2 C 3 2 1 10 1 15 L 7 15 C 7 11 9 8 11 8 Z" />
                  <path d="M 13 22 C 21 22 23 14 23 9 L 17 9 C 17 13 15 16 13 16 Z" />
                </svg>
              </div>
              <span className="text-[28px] font-bold tracking-tight text-white">Dire<span className="text-green-400">Skill</span></span>
            </div>
            
            <div className="text-center space-y-1.5">
              <h1 className="text-[28px] font-bold tracking-tight text-white flex items-center justify-center gap-2">
                Hi, Welcome Back <span>👋</span>
              </h1>
              <p className="text-zinc-500 text-[15px] font-medium">
                Sign in with your email or phone number
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 mb-6 w-full shadow-[0_0_20px_rgba(239,68,68,0.1)]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </motion.div>
            )}
            
            {isRegistered && !error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-sm font-semibold flex flex-col gap-2 mb-6 w-full shadow-[0_0_20px_rgba(34,197,94,0.1)]"
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Account Created Successfully!</span>
                </div>
                {needsVerification && (
                  <p className="text-[12px] text-zinc-400 font-medium ml-8 leading-relaxed">
                    A verification link has been sent to your email. Please verify your account before signing in.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">

            {/* Unified Email / Phone Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">
                Email or Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <AnimatePresence mode="wait">
                    {isEmail ? (
                      <motion.svg key="email-icon" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </motion.svg>
                    ) : isPhone ? (
                      <motion.svg key="phone-icon" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.09 1.18 2 2 0 012 .05h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"></path>
                      </motion.svg>
                    ) : (
                      <motion.svg key="default-icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                        <circle cx="12" cy="8" r="4"></circle>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path>
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onBlur={() => {
                    // Phone blur formatting: strip leading 0 if 10 digits
                    if (!isEmail && identifier.length === 10 && identifier.startsWith("0")) {
                      setIdentifier(identifier.slice(1));
                    }
                  }}
                  className="w-full h-[52px] pl-[44px] pr-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                  placeholder="you@example.com or 0911 997 755"
                />
              </div>
              {/* Subtle hint showing detected mode */}
              <AnimatePresence>
                {identifier.length > 0 && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] ml-1 font-bold uppercase tracking-widest"
                    style={{ color: isEmail || isPhone ? "#4ade80" : "#71717a" }}
                  >
                    {isEmail ? "✓ Signing in with email" : isPhone ? "✓ Signing in with phone number" : "Enter email or phone"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] pl-[44px] pr-12 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                  placeholder="Enter your password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 hover:text-white">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 hover:text-white">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end pt-1 pb-1">
              <Link href="#" className="text-[13px] font-bold text-green-400 hover:text-green-300 transition-colors tracking-wide">
                Forgot Password?
              </Link>
            </div>

            {/* Primary Login Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-green-400 hover:bg-green-500 text-black rounded-full font-bold text-[15px] active:scale-[0.98] transition-all disabled:opacity-70 shadow-[0_0_20px_-5px_rgba(74,222,128,0.4)] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-7 w-full">
            <div className="flex-grow border-t border-zinc-800/80"></div>
            <span className="flex-shrink-0 mx-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Or Sign in with</span>
            <div className="flex-grow border-t border-zinc-800/80"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-3.5 w-full">
            <button type="button" className="w-full h-[52px] flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-full font-medium text-[14px] text-white transition-colors active:scale-[0.98] shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
            <button type="button" className="w-full h-[52px] flex items-center justify-center gap-3 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-full font-medium text-[14px] text-white transition-colors active:scale-[0.98] shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.05 13.92c-.02-2.31 1.89-3.42 1.98-3.48-1.08-1.58-2.76-1.79-3.36-1.82-1.42-.14-2.78.84-3.51.84-.73 0-1.85-.82-3.03-.8-1.53.02-2.95.89-3.74 2.26-1.6 2.78-.41 6.89 1.16 9.16.76 1.1 1.66 2.33 2.85 2.29 1.14-.04 1.58-.74 2.96-.74 1.38 0 1.78.74 2.98.71 1.23-.02 2.01-1.12 2.76-2.22.87-1.27 1.23-2.5 1.25-2.56-.03-.01-2.28-.88-2.3-3.64zM14.94 4.54c.63-.76 1.05-1.82.93-2.88-1.02.04-2.21.68-2.85 1.44-.57.67-1.07 1.75-.93 2.79 1.14.09 2.22-.59 2.85-1.35z"/>
              </svg>
              Sign in with Apple
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-[13px] text-zinc-400 font-medium mt-auto pt-10 pb-6 w-full">
            Don't have an account?{" "}
            <Link href="/register/client" className="text-green-400 font-bold hover:text-green-300 transition-colors">
              Register
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
