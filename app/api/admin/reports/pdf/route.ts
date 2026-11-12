import { NextRequest, NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/admin-authorization";
import { generateGovernancePdfBuffer, GovernanceReportData } from "@/lib/reports-pdf-generator";
import { writeGovernanceAudit } from "@/lib/actions/governance";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminPermission("reports.read");

    const body: GovernanceReportData = await req.json();

    const pdfBuffer = await generateGovernancePdfBuffer({
      ...body,
      author: admin.fullName || admin.employeeId || "Super Administrator",
    });

    // Audit log this export
    await writeGovernanceAudit({
      actorType: "admin",
      adminEmployeeId: admin.id,
      adminRole: admin.role,
      action: "governance_pdf_report_exported",
      module: "reports",
      reason: `Admin generated PDF report: ${body.reportTitle}`,
      highRisk: false,
    });

    const safeTitle = (body.reportTitle || "governance_report")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    const filename = `DireSkill_${safeTitle}_${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}

