"use client";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import { MessagingProvider } from "@/context/MessagingContext";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(`[CRITICAL_CRASH] ${event.message} at ${event.filename}:${event.lineno}`);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] bg-red-900 text-white p-10 font-mono text-xs overflow-auto">
        <h1 className="text-xl font-bold mb-4">APPLICATION CRASHED</h1>
        <pre className="whitespace-pre-wrap">{error}</pre>
        <button onClick={() => window.location.reload()} className="mt-6 bg-white text-black px-4 py-2 rounded">Reload Page</button>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        <LocationProvider>
          <MessagingProvider>
            <NeonAuthUIProvider authClient={authClient} emailOTP social={{ providers: ['google'] }}>
              {children}
            </NeonAuthUIProvider>
          </MessagingProvider>
        </LocationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
