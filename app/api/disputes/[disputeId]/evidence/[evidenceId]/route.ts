import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { getAdminPrincipal, hasAdminPermission } from "@/lib/admin-authorization";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ disputeId: string; evidenceId: string }> },
) {
  const session = await auth();
  const admin = await getAdminPrincipal().catch(() => null);
  if (!session?.user?.id && !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { disputeId, evidenceId } = await params;
  const rows = await sql`
    SELECT
      e.file_url,
      e.mime_type,
      e.file_name,
      d.client_id,
      d.worker_id
    FROM dispute_evidence e
    JOIN disputes d ON d.id = e.dispute_id
    WHERE e.id = ${evidenceId}
      AND e.dispute_id = ${disputeId}
      AND e.is_removed = false
    LIMIT 1
  `;
  const evidence = rows[0];
  if (!evidence) return NextResponse.json({ error: "Evidence not found" }, { status: 404 });

  const isParticipant = session?.user?.id === evidence.client_id || session?.user?.id === evidence.worker_id;
  const isDisputeAdmin = Boolean(admin && hasAdminPermission(admin, "disputes.read"));
  if (!isParticipant && !isDisputeAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const upstream = await fetch(evidence.file_url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Unable to load evidence" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": evidence.mime_type || upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `inline; filename="${String(evidence.file_name || "evidence").replace(/"/g, "")}"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
