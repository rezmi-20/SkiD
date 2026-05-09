import { NextRequest, NextResponse } from "next/server";

/**
 * Custom Neon Auth proxy that replaces the browser Origin header with a
 * trusted production origin. This allows localhost development to work
 * even though Neon Auth's dashboard rejects single-label domains like "localhost".
 *
 * Add https://ski-d.vercel.app to your Neon Auth trusted origins in the dashboard.
 */

const NEON_AUTH_BASE_URL = process.env.NEON_AUTH_BASE_URL!;
// The trusted origin registered in Neon Auth dashboard
const TRUSTED_ORIGIN = "https://ski-d.vercel.app";

const PROXY_HEADERS = ["user-agent", "authorization", "content-type", "cookie"];

async function proxyToNeonAuth(request: NextRequest, path: string): Promise<Response> {
  const upstreamUrl = new URL(`${NEON_AUTH_BASE_URL}/${path}`);
  // Preserve query params from the original request
  upstreamUrl.search = new URL(request.url).search;

  // Build headers, forwarding allowed headers but overriding Origin with trusted origin
  const headers = new Headers();
  for (const header of PROXY_HEADERS) {
    const value = request.headers.get(header);
    if (value) headers.set(header, value);
  }
  headers.set("Origin", TRUSTED_ORIGIN);
  headers.set("x-neon-auth-middleware", "true");

  const body = request.body ? await request.text() : undefined;

  const upstreamResponse = await fetch(upstreamUrl.toString(), {
    method: request.method,
    headers,
    body,
  });

  // Forward response headers back to the client
  const responseHeaders = new Headers();
  const ALLOWED_RESPONSE_HEADERS = [
    "content-type",
    "content-length",
    "set-cookie",
    "date",
    "x-neon-ret-request-id",
  ];
  for (const header of ALLOWED_RESPONSE_HEADERS) {
    const value = upstreamResponse.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  const responseBody = await upstreamResponse.text();
  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToNeonAuth(request, path.join("/"));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToNeonAuth(request, path.join("/"));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToNeonAuth(request, path.join("/"));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyToNeonAuth(request, path.join("/"));
}
