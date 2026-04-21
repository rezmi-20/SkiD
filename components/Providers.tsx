"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";

export default function Providers({ children }: { children: React.ReactNode }) {
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
