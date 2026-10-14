import "./globals.css";
import Providers from "@/components/Providers";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function isExtensionError(msg, file, stack) {
                  var str = ((msg || '') + ' ' + (file || '') + ' ' + (stack || '')).toLowerCase();
                  return str.indexOf('chrome-extension://') !== -1 ||
                         str.indexOf('moz-extension://') !== -1 ||
                         str.indexOf('chrome: call method') !== -1 ||
                         str.indexOf('resizeobserver loop') !== -1;
                }
                window.addEventListener('error', function(e) {
                  if (isExtensionError(e.message, e.filename, e.error && e.error.stack)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = e.reason || {};
                  if (isExtensionError(reason.message || reason, '', reason.stack)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-on-background font-body min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
