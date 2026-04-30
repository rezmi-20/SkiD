"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import { useState, useEffect } from "react";

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

  console.debug("[DIREDAWA-DIAG] Providers rendering");
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme" defaultTheme="grayscale" themes={["light", "dark", "grayscale"]}>
        <LanguageProvider>
          <LocationProvider>
            {children}
          </LocationProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
