"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireAdminRole } from "@/lib/admin-authorization";
import { writeGovernanceAudit } from "@/lib/actions/governance";

export interface ServiceCategoryRow {
  id: string;
  slug: string;
  nameEn: string;
  nameAm: string | null;
  nameOm: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  linkedWorkerCount: number;
  linkedJobCount: number;
  updatedAt: string;
}

export interface ZoneRow {
  id: string;
  slug: string;
  nameEn: string;
  nameAm: string | null;
  nameOm: string | null;
  city: string;
  centerLat: number | null;
  centerLng: number | null;
  radiusKm: number;
  sortOrder: number;
  isActive: boolean;
  linkedWorkerCount: number;
  linkedJobCount: number;
  updatedAt: string;
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanText(value: unknown, max = 120) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function getActiveServiceCategories() {
  return sql`
    SELECT id, slug, name_en AS "nameEn", name_am AS "nameAm", name_om AS "nameOm", description, sort_order AS "sortOrder"
    FROM service_categories
    WHERE is_active = true
    ORDER BY sort_order ASC, name_en ASC
  `;
}

export async function getActiveZones() {
  return sql`
    SELECT
      id,
      slug,
      name_en AS "nameEn",
      name_am AS "nameAm",
      name_om AS "nameOm",
      city,
      center_lat AS "centerLat",
      center_lng AS "centerLng",
      radius_km AS "radiusKm",
      sort_order AS "sortOrder"
    FROM zones
    WHERE is_active = true
    ORDER BY sort_order ASC, name_en ASC
  `;
}

export async function getServiceCategoriesAdmin(): Promise<ServiceCategoryRow[]> {
  await requireAdminRole("super_admin");
  const rows = await sql`
    SELECT
      sc.id,
      sc.slug,
      sc.name_en AS "nameEn",
      sc.name_am AS "nameAm",
      sc.name_om AS "nameOm",
      sc.description,
      sc.sort_order AS "sortOrder",
      sc.is_active AS "isActive",
      sc.updated_at AS "updatedAt",
      (
        SELECT COUNT(*)::int
        FROM worker_profiles wp
        WHERE EXISTS (
          SELECT 1
          FROM unnest(COALESCE(wp.skills, ARRAY[]::text[])) AS s
          WHERE lower(trim(s)) IN (lower(sc.slug), lower(sc.name_en), replace(lower(sc.slug), '_', ' '), replace(lower(sc.slug), '-', ' '))
        )
      ) AS "linkedWorkerCount",
      (
        SELECT COUNT(*)::int
        FROM jobs j
        WHERE lower(COALESCE(j.title, '') || ' ' || COALESCE(j.description, '')) LIKE ('%' || lower(sc.name_en) || '%')
      ) AS "linkedJobCount"
    FROM service_categories sc
    ORDER BY sc.sort_order ASC, sc.name_en ASC
  `;

  return (rows || []).map((r: any) => ({
    ...r,
    sortOrder: Number(r.sortOrder || 0),
    isActive: Boolean(r.isActive),
    linkedWorkerCount: Number(r.linkedWorkerCount || 0),
    linkedJobCount: Number(r.linkedJobCount || 0),
    updatedAt: String(r.updatedAt),
  }));
}

export async function upsertServiceCategory(input: {
  id?: string | null;
  slug?: string;
  nameEn: string;
  nameAm?: string;
  nameOm?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const admin = await requireAdminRole("super_admin");
  const nameEn = cleanText(input.nameEn, 120);
  if (nameEn.length < 2) {
    return { success: false, error: "English category name is required." };
  }

  const slug = toSlug(input.slug || nameEn);
  if (!slug) {
    return { success: false, error: "A valid category slug is required." };
  }

  const nameAm = cleanText(input.nameAm, 120) || null;
  const nameOm = cleanText(input.nameOm, 120) || null;
  const description = cleanText(input.description, 400) || null;
  const sortOrder = Number.isFinite(Number(input.sortOrder)) ? Math.max(0, Math.trunc(Number(input.sortOrder))) : 0;
  const isActive = input.isActive !== false;

  try {
    if (input.id) {
      const prevRows = await sql`SELECT * FROM service_categories WHERE id = ${input.id} LIMIT 1`;
      if (prevRows.length === 0) return { success: false, error: "Category not found." };
      const prev = prevRows[0];

      const updated = await sql`
        UPDATE service_categories
        SET
          slug = ${slug},
          name_en = ${nameEn},
          name_am = ${nameAm},
          name_om = ${nameOm},
          description = ${description},
          sort_order = ${sortOrder},
          is_active = ${isActive},
          updated_at = NOW()
        WHERE id = ${input.id}
        RETURNING id
      `;
      if (updated.length === 0) return { success: false, error: "Category not found." };

      await writeGovernanceAudit({
        actorType: "admin",
        adminEmployeeId: admin.id,
        adminRole: admin.role,
        action: "master_data_category_updated",
        module: "settings",
        targetType: "service_category",
        targetId: input.id,
        previousState: { slug: prev.slug, nameEn: prev.name_en, isActive: prev.is_active },
        newState: { slug, nameEn, isActive },
      }).catch(() => undefined);
    } else {
      const inserted = await sql`
        INSERT INTO service_categories (slug, name_en, name_am, name_om, description, sort_order, is_active)
        VALUES (${slug}, ${nameEn}, ${nameAm}, ${nameOm}, ${description}, ${sortOrder}, ${isActive})
        RETURNING id
      `;

      await writeGovernanceAudit({
        actorType: "admin",
        adminEmployeeId: admin.id,
        adminRole: admin.role,
        action: "master_data_category_created",
        module: "settings",
        targetType: "service_category",
        targetId: String(inserted[0].id),
        newState: { slug, nameEn, isActive },
      }).catch(() => undefined);
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/categories");
    revalidatePath("/client/search");
    return { success: true };
  } catch (error: any) {
    if (String(error?.message || "").includes("unique") || String(error?.code || "") === "23505") {
      return { success: false, error: `A category with slug "${slug}" already exists.` };
    }
    return { success: false, error: "Failed to save service category." };
  }
}

export async function toggleServiceCategoryActive(id: string, isActive: boolean) {
  const admin = await requireAdminRole("super_admin");
  const rows = await sql`
    UPDATE service_categories
    SET is_active = ${Boolean(isActive)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, slug, name_en
  `;
  if (rows.length === 0) return { success: false, error: "Category not found." };

  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: isActive ? "master_data_category_enabled" : "master_data_category_disabled",
    module: "settings",
    targetType: "service_category",
    targetId: id,
    newState: { slug: rows[0].slug, isActive: Boolean(isActive) },
  }).catch(() => undefined);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/categories");
  return { success: true };
}

export async function deleteServiceCategory(id: string) {
  const admin = await requireAdminRole("super_admin");
  const rows = await sql`SELECT * FROM service_categories WHERE id = ${id} LIMIT 1`;
  const cat = rows[0];
  if (!cat) return { success: false, error: "Category not found." };

  const usage = await sql`
    SELECT
      (
        SELECT COUNT(*)::int
        FROM worker_profiles wp
        WHERE EXISTS (
          SELECT 1
          FROM unnest(COALESCE(wp.skills, ARRAY[]::text[])) AS s
          WHERE lower(trim(s)) IN (lower(${cat.slug}), lower(${cat.name_en}), replace(lower(${cat.slug}), '_', ' '), replace(lower(${cat.slug}), '-', ' '))
        )
      ) AS worker_count,
      (
        SELECT COUNT(*)::int
        FROM jobs j
        WHERE lower(COALESCE(j.title, '') || ' ' || COALESCE(j.description, '')) LIKE ('%' || lower(${cat.name_en}) || '%')
      ) AS job_count
  `;

  const workers = Number(usage[0]?.worker_count || 0);
  const jobs = Number(usage[0]?.job_count || 0);
  if (workers > 0 || jobs > 0) {
    return {
      success: false,
      error: `Cannot delete "${cat.name_en}" because it is linked to ${workers} worker profile(s) and ${jobs} job(s). Soft-disable it instead.`,
    };
  }

  await sql`DELETE FROM service_categories WHERE id = ${id}`;
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "master_data_category_deleted",
    module: "settings",
    targetType: "service_category",
    targetId: id,
    previousState: { slug: cat.slug, nameEn: cat.name_en },
  }).catch(() => undefined);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/categories");
  return { success: true };
}

export async function getZonesAdmin(): Promise<ZoneRow[]> {
  await requireAdminRole("super_admin");
  const rows = await sql`
    SELECT
      z.id,
      z.slug,
      z.name_en AS "nameEn",
      z.name_am AS "nameAm",
      z.name_om AS "nameOm",
      z.city,
      z.center_lat AS "centerLat",
      z.center_lng AS "centerLng",
      z.radius_km AS "radiusKm",
      z.sort_order AS "sortOrder",
      z.is_active AS "isActive",
      z.updated_at AS "updatedAt",
      (
        SELECT COUNT(*)::int
        FROM worker_profiles wp
        WHERE lower(trim(COALESCE(wp.district, ''))) IN (lower(z.slug), lower(z.name_en))
           OR lower(COALESCE(wp.district, '')) LIKE ('%' || lower(z.name_en) || '%')
      ) AS "linkedWorkerCount",
      (
        SELECT COUNT(*)::int
        FROM jobs j
        WHERE lower(COALESCE(j.location, '')) LIKE ('%' || lower(z.name_en) || '%')
      ) AS "linkedJobCount"
    FROM zones z
    ORDER BY z.sort_order ASC, z.name_en ASC
  `;

  return (rows || []).map((r: any) => ({
    ...r,
    centerLat: r.centerLat !== null && r.centerLat !== undefined ? Number(r.centerLat) : null,
    centerLng: r.centerLng !== null && r.centerLng !== undefined ? Number(r.centerLng) : null,
    radiusKm: Number(r.radiusKm || 3.0),
    sortOrder: Number(r.sortOrder || 0),
    isActive: Boolean(r.isActive),
    linkedWorkerCount: Number(r.linkedWorkerCount || 0),
    linkedJobCount: Number(r.linkedJobCount || 0),
    updatedAt: String(r.updatedAt),
  }));
}

export async function upsertZone(input: {
  id?: string | null;
  slug?: string;
  nameEn: string;
  nameAm?: string;
  nameOm?: string;
  city?: string;
  centerLat?: number | string | null;
  centerLng?: number | string | null;
  radiusKm?: number | string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const admin = await requireAdminRole("super_admin");
  const nameEn = cleanText(input.nameEn, 120);
  if (nameEn.length < 2) {
    return { success: false, error: "Zone name is required." };
  }

  const slug = toSlug(input.slug || nameEn);
  if (!slug) {
    return { success: false, error: "A valid zone slug is required." };
  }

  const nameAm = cleanText(input.nameAm, 120) || null;
  const nameOm = cleanText(input.nameOm, 120) || null;
  const city = cleanText(input.city, 80) || "Dire Dawa";
  const parsedLat = input.centerLat === "" || input.centerLat === null || input.centerLat === undefined ? null : Number(input.centerLat);
  const parsedLng = input.centerLng === "" || input.centerLng === null || input.centerLng === undefined ? null : Number(input.centerLng);
  if (parsedLat !== null && (!Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90)) {
    return { success: false, error: "Center latitude must be between -90 and 90." };
  }
  if (parsedLng !== null && (!Number.isFinite(parsedLng) || parsedLng < -180 || parsedLng > 180)) {
    return { success: false, error: "Center longitude must be between -180 and 180." };
  }

  const radiusKm = Number.isFinite(Number(input.radiusKm)) ? Math.max(0.5, Math.min(50, Number(input.radiusKm))) : 3.0;
  const sortOrder = Number.isFinite(Number(input.sortOrder)) ? Math.max(0, Math.trunc(Number(input.sortOrder))) : 0;
  const isActive = input.isActive !== false;

  try {
    if (input.id) {
      const prevRows = await sql`SELECT * FROM zones WHERE id = ${input.id} LIMIT 1`;
      if (prevRows.length === 0) return { success: false, error: "Zone not found." };
      const prev = prevRows[0];

      await sql`
        UPDATE zones
        SET
          slug = ${slug},
          name_en = ${nameEn},
          name_am = ${nameAm},
          name_om = ${nameOm},
          city = ${city},
          center_lat = ${parsedLat},
          center_lng = ${parsedLng},
          radius_km = ${radiusKm},
          sort_order = ${sortOrder},
          is_active = ${isActive},
          updated_at = NOW()
        WHERE id = ${input.id}
      `;

      await writeGovernanceAudit({
        actorType: "admin",
        adminEmployeeId: admin.id,
        adminRole: admin.role,
        action: "master_data_zone_updated",
        module: "settings",
        targetType: "zone",
        targetId: input.id,
        previousState: { slug: prev.slug, nameEn: prev.name_en, isActive: prev.is_active },
        newState: { slug, nameEn, isActive, radiusKm },
      }).catch(() => undefined);
    } else {
      const inserted = await sql`
        INSERT INTO zones (slug, name_en, name_am, name_om, city, center_lat, center_lng, radius_km, sort_order, is_active)
        VALUES (${slug}, ${nameEn}, ${nameAm}, ${nameOm}, ${city}, ${parsedLat}, ${parsedLng}, ${radiusKm}, ${sortOrder}, ${isActive})
        RETURNING id
      `;

      await writeGovernanceAudit({
        actorType: "admin",
        adminEmployeeId: admin.id,
        adminRole: admin.role,
        action: "master_data_zone_created",
        module: "settings",
        targetType: "zone",
        targetId: String(inserted[0].id),
        newState: { slug, nameEn, isActive, radiusKm },
      }).catch(() => undefined);
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/zones");
    revalidatePath("/client/search");
    return { success: true };
  } catch (error: any) {
    if (String(error?.message || "").includes("unique") || String(error?.code || "") === "23505") {
      return { success: false, error: `A zone with slug "${slug}" already exists.` };
    }
    return { success: false, error: "Failed to save zone." };
  }
}

export async function toggleZoneActive(id: string, isActive: boolean) {
  const admin = await requireAdminRole("super_admin");
  const rows = await sql`
    UPDATE zones
    SET is_active = ${Boolean(isActive)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, slug, name_en
  `;
  if (rows.length === 0) return { success: false, error: "Zone not found." };

  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: isActive ? "master_data_zone_enabled" : "master_data_zone_disabled",
    module: "settings",
    targetType: "zone",
    targetId: id,
    newState: { slug: rows[0].slug, isActive: Boolean(isActive) },
  }).catch(() => undefined);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/zones");
  return { success: true };
}

export async function deleteZone(id: string) {
  const admin = await requireAdminRole("super_admin");
  const rows = await sql`SELECT * FROM zones WHERE id = ${id} LIMIT 1`;
  const zone = rows[0];
  if (!zone) return { success: false, error: "Zone not found." };

  const usage = await sql`
    SELECT
      (
        SELECT COUNT(*)::int
        FROM worker_profiles wp
        WHERE lower(trim(COALESCE(wp.district, ''))) IN (lower(${zone.slug}), lower(${zone.name_en}))
           OR lower(COALESCE(wp.district, '')) LIKE ('%' || lower(${zone.name_en}) || '%')
      ) AS worker_count,
      (
        SELECT COUNT(*)::int
        FROM jobs j
        WHERE lower(COALESCE(j.location, '')) LIKE ('%' || lower(${zone.name_en}) || '%')
      ) AS job_count
  `;

  const workers = Number(usage[0]?.worker_count || 0);
  const jobs = Number(usage[0]?.job_count || 0);
  if (workers > 0 || jobs > 0) {
    return {
      success: false,
      error: `Cannot delete "${zone.name_en}" because it is linked to ${workers} worker profile(s) and ${jobs} job(s). Soft-disable it instead.`,
    };
  }

  await sql`DELETE FROM zones WHERE id = ${id}`;
  await writeGovernanceAudit({
    actorType: "admin",
    adminEmployeeId: admin.id,
    adminRole: admin.role,
    action: "master_data_zone_deleted",
    module: "settings",
    targetType: "zone",
    targetId: id,
    previousState: { slug: zone.slug, nameEn: zone.name_en },
  }).catch(() => undefined);

  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/zones");
  return { success: true };
}
