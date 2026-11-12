"use client";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import { MessagingProvider } from "@/context/MessagingContext";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Capture and log without unmounting the application tree into a crash loop
      const msg = String(event.message || "");
      const file = String(event.filename || "");
      if (
        file.includes("chrome-extension://") ||
        file.includes("moz-extension://") ||
        msg.includes("chrome: call method") ||
        msg.includes("ResizeObserver loop") ||
        msg.includes("Minified React error") ||
        msg.includes("Suspense boundary") ||
        msg.includes("Hydration") ||
        msg.includes("hydration")
      ) {
        return;
      }
      console.warn("[CLIENT_ERROR_OBSERVED]", event.message, event.filename, event.lineno);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      console.warn("[UNHANDLED_REJECTION_CAPTURED]", event.reason?.message || event.reason);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        <LocationProvider>
          <MessagingProvider>
            {children}
          </MessagingProvider>
        </LocationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
