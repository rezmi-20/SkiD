"use client";

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.hostname.startsWith('192.168.') ||
                    window.location.hostname.startsWith('10.') ||
                    window.location.hostname.endsWith('.local');

    console.debug("[DIREDAWA-DIAG] SW Registration mounting, isLocal:", isLocal);

    if ('serviceWorker' in navigator) {
        if (!isLocal) {
          const register = () => {
            navigator.serviceWorker.register('/sw.js').then(
              (reg) => {
                console.debug('SW registered');
                // Check for updates on every mount
                reg.update();
              },
              (err) => console.log('SW failed', err)
            );
          };

          // EMERGENCY SELF-HEALING:
          // If the page has crashed or is showing a white screen repeatedly,
          // the user can add ?clear_cache=true to the URL to force unregister
          if (window.location.search.includes('clear_cache=true')) {
            navigator.serviceWorker.getRegistrations().then(regs => {
              for(let r of regs) r.unregister();
              window.location.href = window.location.pathname;
            });
          }

          if (document.readyState === 'complete') {
            register();
          } else {
            window.addEventListener('load', register);
            return () => window.removeEventListener('load', register);
          }
        } else {
          // Force unregister on local dev to prevent cache issues
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister().then((success) => {
                if (success) console.debug('SW unregistered successfully for local dev');
              });
            }
          });
        }
    }
  }, []);

  return null;
}
