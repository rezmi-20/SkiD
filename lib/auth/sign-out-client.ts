"use client";

import { authClient } from "@/lib/auth/client";

/**
 * Robust, unified sign-out handler for clients and workers.
 * Ensures the session is revoked on Neon, cookies are cleared by the server,
 * client-accessible storage/cookies are wiped, and hard-redirects to /login?logout=1
 * so middleware never bounces the user back to their dashboard.
 */
export async function handleAppSignOut(redirectUrl = "/login?logout=1") {
  try {
    // 1. Ask Neon Auth to invalidate the session remotely, with an 800ms race timeout
    // to avoid hanging if the remote auth service is slow or unresponsive.
    await Promise.race([
      authClient.signOut().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch (_) {
    // Non-blocking: remote signout failure should not block local signout
  }

  try {
    // 2. Call our server route to expire session cookies via Set-Cookie headers
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });
  } catch (_) {
    // Non-blocking
  }

  try {
    // 3. Clear all client-accessible cookies
    if (typeof document !== "undefined" && document.cookie) {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      }
    }

    // 4. Clear browser sessionStorage
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  } catch (_) {}

  // 5. Hard reload to login with ?logout=1 to guarantee a fresh request
  // and ensure middleware allows rendering the login page without bouncing
  window.location.href = redirectUrl;
}
