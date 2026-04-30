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
              (reg) => console.debug('SW registered'),
              (err) => console.log('SW failed', err)
            );
          };

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
