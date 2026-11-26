"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdminRole } from "@/lib/admin-authorization";
import { writeGovernanceAudit } from "@/lib/actions/governance";

export interface PlatformGovernanceSettings {
  strictFayda: boolean;
  maintenanceMode: boolean;
  mandatory2FA: boolean;
  auditLogging: boolean;
  sessionTimeout: "15m" | "30m" | "1h" | "8h";
}

const DEFAULT_GOVERNANCE_SETTINGS: PlatformGovernanceSettings = {
  strictFayda: true,
  maintenanceMode: false,
  mandatory2FA: false,
  auditLogging: true,
  sessionTimeout: "30m",
};

const GOVERNANCE_KEY = "governance_policy";

export async function getPlatformGovernanceSettings(): Promise<PlatformGovernanceSettings> {
  try {
    const rows = await sql`
      SELECT value
      FROM platform_settings
      WHERE key = ${GOVERNANCE_KEY}
      LIMIT 1
    `;
    const stored = rows[0]?.value;
    if (!stored || typeof stored !== "object") {
      return DEFAULT_GOVERNANCE_SETTINGS;
    }
    const timeout = ["15m", "30m", "1h", "8h"].includes(String((stored as any).sessionTimeout))
      ? ((stored as any).sessionTimeout as PlatformGovernanceSettings["sessionTimeout"])
      : "30m";

    return {
      strictFayda: typeof (stored as any).strictFayda === "boolean" ? (stored as any).strictFayda : true,
      maintenanceMode: typeof (stored as any).maintenanceMode === "boolean" ? (stored as any).maintenanceMode : false,
      mandatory2FA: typeof (stored as any).mandatory2FA === "boolean" ? (stored as any).mandatory2FA : false,
      auditLogging: typeof (stored as any).auditLogging === "boolean" ? (stored as any).auditLogging : true,
      sessionTimeout: timeout,
    };
  } catch {
    return DEFAULT_GOVERNANCE_SETTINGS;
  }
}

export async function savePlatformGovernanceSettings(input: PlatformGovernanceSettings) {
  const admin = await requireAdminRole("super_admin");
  const next: PlatformGovernanceSettings = {
    strictFayda: Boolean(input.strictFayda),
    maintenanceMode: Boolean(input.maintenanceMode),
    mandatory2FA: Boolean(input.mandatory2FA),
    auditLogging: Boolean(input.auditLogging),
    sessionTimeout: ["15m", "30m", "1h", "8h"].includes(input.sessionTimeout) ? input.sessionTimeout : "30m",
  };

  const prev = await getPlatformGovernanceSettings();

  await sql`
    INSERT INTO platform_settings (key, value, updated_by, updated_at)
    VALUES (${GOVERNANCE_KEY}, ${JSON.stringify(next)}::jsonb, ${admin.id}, NOW())
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
  `;

  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "platform_governance_settings_updated",
    module: "settings",
    targetType: "platform_settings",
    targetId: GOVERNANCE_KEY,
    previousState: prev as unknown as Record<string, unknown>,
    newState: next as unknown as Record<string, unknown>,
  }).catch(() => undefined);

  revalidatePath("/admin/settings");
  return { success: true, settings: next };
}
