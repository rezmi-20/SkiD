import { auth } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const handlers = auth.handler();

const proxyHandler = async (req: NextRequest, context: any) => {
  try {
    // 1. Rewrite Cookie header going UP to the remote server
    const headers = new Headers(req.headers);
    const cookieStr = headers.get("cookie");
    if (cookieStr) {
      // The remote server expects __Secure-, so we add it back if it's missing
      const rewrittenCookie = cookieStr
        .replace(/neon-auth\.session_token=/g, "__Secure-neon-auth.session_token=")
        .replace(/neon-auth\.session_data=/g, "__Secure-neon-auth.session_data=")
        .replace(/neon-auth\.session_challenge=/g, "__Secure-neon-auth.session_challenge=");
      headers.set("cookie", rewrittenCookie);
    }

    // Use the native better-auth handler with the modified request
    const newReq = new NextRequest(req.url, {
      method: req.method,
      headers: headers,
      body: req.body ? req.body : undefined,
      duplex: 'half'
    } as any);

    const res = await handlers[req.method as keyof typeof handlers](newReq, context) as Response;
    
    if (!res) return new NextResponse(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });

    // 2. Rewrite Set-Cookie headers coming DOWN to the browser
    const newRes = new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: new Headers(res.headers)
    });

    const setCookieHeader = res.headers.get("set-cookie");
    if (setCookieHeader) {
      newRes.headers.delete("set-cookie");
      const rawHeaders = (res.headers as any).getSetCookie ? (res.headers as any).getSetCookie() : res.headers.get("set-cookie")?.split(/,(?=[^ ])/);
      if (Array.isArray(rawHeaders)) {
        for (const cookie of rawHeaders) {
          // Strip Secure prefix and attribute for localhost HTTP
          const insecureCookie = cookie
            .replace(/__Secure-/g, "")
            .replace(/;\s*Secure/gi, "");
          newRes.headers.append("set-cookie", insecureCookie);
        }
      }
    }

    return newRes;
  } catch (err: any) {
    console.error("[PROXY_HANDLER_ERROR]", err);
    return new NextResponse(JSON.stringify({ error: "Internal Auth Error", details: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

const routeHandler = async (req: NextRequest, ctx: any) => {
  const url = new URL(req.url);
  // Only apply the proxy workaround if running on localhost (HTTP)
  if (url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
    return proxyHandler(req, ctx);
  }
  // Otherwise (like on Vercel), use the native handler directly!
  return handlers[req.method as keyof typeof handlers](req, ctx);
};

export const GET = routeHandler;
export const POST = routeHandler;
export const PUT = routeHandler;
export const DELETE = routeHandler;
