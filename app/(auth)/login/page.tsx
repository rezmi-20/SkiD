"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const checkSession = async () => {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      if (session) {
        const role = (session.user as any)?.role;
        if (role === "client") router.replace("/client/search");
        else if (role === "worker") router.replace("/worker/dashboard");
        else if (role === "admin") router.replace("/admin/dashboard");
      }
    };
    checkSession();
  }, [router]);

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
        setError("Invalid credentials. Please try again.");
      } else {
        const { getSession } = await import("next-auth/react");
        const session = await getSession();
        const role = (session?.user as any)?.role;

        if (role === "admin") window.location.href = "/admin/dashboard";
        else if (role === "worker") window.location.href = "/worker/dashboard";
        else if (role === "client") window.location.href = "/client/search";
        else window.location.href = "/";
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
          {/* Subtle dark tint to ensure white text remains readable, without hiding the image */}
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
            Join the premier marketplace for top-tier freelancers and extraordinary opportunities.
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
            {/* Logo and App Name */}
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
                Sign in to your account
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-semibold flex items-center gap-3 mb-6 w-full"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-300 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 4l10 8 10-8" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-[52px] pl-[44px] pr-4 bg-zinc-900 border border-zinc-700 rounded-2xl focus:border-green-400/80 focus:ring-1 focus:ring-green-400/80 outline-none transition-all placeholder:text-zinc-500 font-medium text-[14px] text-white shadow-sm"
                  placeholder="Enter your email"
                />
              </div>
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

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center pt-2 pb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${rememberMe ? 'bg-white border-white' : 'border-zinc-700 bg-transparent group-hover:border-zinc-500'}`}>
                  {rememberMe && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <span className="text-[13px] font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
              </label>
              <Link href="#" className="text-[13px] font-bold text-green-400 hover:text-green-300 transition-colors tracking-wide">
                Forgot Password?
              </Link>
            </div>

            {/* Primary Login Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-green-400 hover:bg-green-500 text-black rounded-full font-bold text-[15px] active:scale-[0.98] transition-all disabled:opacity-70 shadow-[0_0_20px_-5px_rgba(74,222,128,0.4)] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  "Login"
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
