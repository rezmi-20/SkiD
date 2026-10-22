export async function readRegistrationResponse(response: Response): Promise<{ error?: string; [key: string]: unknown }> {
  const rawBody = await response.text();
  if (rawBody) {
    try {
      return JSON.parse(rawBody) as { error?: string; [key: string]: unknown };
    } catch {
      // Hosting proxies and crashed functions can return an HTML error page.
    }
  }

  if (response.status === 413) {
    return { error: "The registration upload is too large. Use a smaller Fayda document or fewer/smaller certificates." };
  }

  if (/^\s*</.test(rawBody)) {
    const requestId = response.headers.get("x-vercel-id");
    const requestReference = requestId ? ` Vercel request ID: ${requestId}.` : "";
    return { error: `The registration server returned an HTML error page (HTTP ${response.status}), not its normal JSON response.${requestReference} Check the Vercel function logs for this request.` };
  }

  return { error: `The registration server returned HTTP ${response.status} without a readable JSON response.` };
}

export function explainRegistrationException(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/Unexpected token ['"]?</i.test(message) || /not valid JSON/i.test(message)) {
    return "A registration service returned an HTML page instead of JSON. Check the Vercel function logs and confirm the Neon Auth URL is configured correctly.";
  }
  return message || "An unexpected error occurred. Please try again.";
}
