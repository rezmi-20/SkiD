import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

// ─── DEV ONLY: Environment Variable Check ────────────────────────────────────
// Logs which vars are present and warns about missing ones at server startup.
// ⚠️  REMOVE this block before deploying to production!
if (process.env.NODE_ENV === "development") {
  const requiredVars = [
    "DATABASE_URL",
    "NEON_AUTH_BASE_URL",
    "NEON_AUTH_COOKIE_SECRET",
    "NEXT_PUBLIC_APP_URL",
    "CHAPA_SECRET_KEY",
    "NEXT_PUBLIC_CHAPA_PUBLIC_KEY",
  ];
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🔑  DireSkill ENV Variable Check (dev only)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  requiredVars.forEach((key) => {
    const val = process.env[key];
    if (!val || val.includes("your_") || val.includes("_here")) {
      console.warn(`  ⚠️  MISSING or PLACEHOLDER: ${key}`);
    } else {
      console.log(`  ✅  ${key} = ${val.substring(0, 20)}...`);
    }
  });
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}
// ─────────────────────────────────────────────────────────────────────────────


const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "DireSkill | Find Verified Workers in Dire Dawa",
  description: "Hire Fayda-verified electricians, plumbers and more in Dire Dawa. Fast, safe, and contract-backed.",
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#f8f9fb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className="bg-background text-on-background font-body min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
