import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  ChapaApiError,
  createChapaSubaccount,
  extractChapaSubaccountId,
} from "@/lib/chapa";

const createSubaccountSchema = z.object({
  workerId: z.string().uuid(),
  accountName: z.string().trim().min(2),
  accountNumber: z.string().trim().min(5).max(40),
  bankCode: z.string().trim().min(1),
  bankName: z.string().trim().min(1).optional(),
  splitType: z.enum(["percentage", "flat"]).default("percentage"),
  splitValue: z.coerce.number().positive().default(0.05),
});

function validateSplit(splitType: "percentage" | "flat", splitValue: number) {
  if (splitType === "percentage" && (splitValue <= 0 || splitValue >= 1)) {
    return "Percentage splitValue must be a decimal between 0 and 1, for example 0.05 for 5%.";
  }

  if (splitType === "flat" && splitValue <= 0) {
    return "Flat splitValue must be greater than 0.";
  }

  return null;
}

async function writeAuditLog(userId: string, details: Record<string, unknown>) {
  try {
    await sql`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (${userId}, 'worker_chapa_subaccount_created', ${JSON.stringify(details)})
    `;
  } catch (error) {
    console.warn("[CREATE_SUBACCOUNT_AUDIT_SKIPPED]", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const parsed = createSubaccountSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid subaccount details.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const input = parsed.data;
    if (session.user.role !== "admin" && session.user.id !== input.workerId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const splitError = validateSplit(input.splitType, input.splitValue);
    if (splitError) {
      return NextResponse.json({ success: false, error: splitError }, { status: 400 });
    }

    if (!Number.isFinite(Number(input.bankCode))) {
      return NextResponse.json({ success: false, error: "Bank code must be numeric for Chapa." }, { status: 400 });
    }

    const workers = await sql`
      SELECT u.id, u.role, wp.id as profile_id, wp.chapa_subaccount_id
      FROM users u
      LEFT JOIN worker_profiles wp ON wp.user_id = u.id
      WHERE u.id = ${input.workerId}
      LIMIT 1
    `;

    if (workers.length === 0 || workers[0].role !== "worker") {
      return NextResponse.json({ success: false, error: "Worker not found." }, { status: 404 });
    }

    if (!workers[0].profile_id) {
      return NextResponse.json(
        { success: false, error: "Worker profile must exist before creating a payout subaccount." },
        { status: 409 },
      );
    }

    if (workers[0].chapa_subaccount_id) {
      return NextResponse.json({
        success: true,
        subaccountId: workers[0].chapa_subaccount_id,
        message: "Worker already has a Chapa subaccount.",
      });
    }

    console.info("[CHAPA_CREATE_SUBACCOUNT_REQUEST]", {
      workerId: input.workerId,
      bankCode: input.bankCode,
      splitType: input.splitType,
      splitValue: input.splitValue,
    });

    const chapaResponse = await createChapaSubaccount({
      accountName: input.accountName,
      accountNumber: input.accountNumber,
      bankCode: input.bankCode,
      splitType: input.splitType,
      splitValue: input.splitValue,
    });
    const subaccountId = extractChapaSubaccountId(chapaResponse);

    if (!subaccountId) {
      console.error("[CHAPA_CREATE_SUBACCOUNT_MISSING_ID]", chapaResponse);
      return NextResponse.json(
        { success: false, error: "Chapa did not return a subaccount ID.", details: chapaResponse },
        { status: 502 },
      );
    }

    await sql`
      UPDATE worker_profiles
      SET chapa_subaccount_id = ${subaccountId},
          bank_account = ${input.accountNumber},
          bank_name = ${input.bankName ?? null},
          bank_code = ${input.bankCode},
          chapa_split_type = ${input.splitType},
          chapa_split_value = ${input.splitValue}
      WHERE user_id = ${input.workerId}
    `;

    await writeAuditLog(session.user.id, {
      workerId: input.workerId,
      subaccountId,
      bankCode: input.bankCode,
      splitType: input.splitType,
      splitValue: input.splitValue,
    });

    return NextResponse.json({
      success: true,
      subaccountId,
      message: "Chapa subaccount created successfully.",
    });
  } catch (error) {
    console.error("[CREATE_SUBACCOUNT_ERROR]", error);

    if (error instanceof ChapaApiError) {
      return NextResponse.json(
        { success: false, error: error.message, details: error.payload },
        { status: error.status || 502 },
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unable to create subaccount." },
      { status: 500 },
    );
  }
}
