import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "400", "700", "800"],
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
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var d = document.documentElement;
                  var t = localStorage.getItem('theme');
                  if (t) {
                    d.setAttribute('data-theme', t);
                  } else {
                    d.setAttribute('data-theme', 'grayscale');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-text-high font-body min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
