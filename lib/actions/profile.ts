"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isTrustedUploadReference } from "@/lib/security";

function normalizeFaydaFan(value: unknown) {
  const fan = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!fan) return null;
  return fan.replace(/[^A-Z0-9-]/g, "").slice(0, 64);
}

function maskFaydaFan(value: unknown) {
  const fan = String(value || "").trim();
  if (!fan) return null;
  if (fan.length <= 6) return `${fan.slice(0, 2)}••${fan.slice(-2)}`;
  return `${fan.slice(0, 6)}••••••••${fan.slice(-2)}`;
}

export async function getProfileData() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const role = (session.user as any).role;

  try {
    const userRows = await sql`SELECT email, phone FROM users WHERE id = ${userId}`;
    const user = userRows[0];

    let profile;
    if (role === "worker") {
      const rows = await sql`SELECT * FROM worker_profiles WHERE user_id = ${userId}`;
      profile = rows[0];
    } else {
      const rows = await sql`SELECT * FROM client_profiles WHERE user_id = ${userId}`;
      profile = rows[0];
    }

    const fullFanNumber = profile?.fayda_fan_number;
    const safeProfile = profile
      ? {
          ...profile,
          fayda_fan_number: undefined,
          masked_fayda_fan_number: maskFaydaFan(fullFanNumber),
          has_fayda_fan_number: Boolean(fullFanNumber),
        }
      : profile;

    return {
      ...user,
      ...safeProfile,
      role
    };
  } catch (error) {
    console.error("[GET_PROFILE_ERROR]", error);
    return null;
  }
}

export async function updateProfile(data: any) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const isAdmin = session.user.role === "admin";
  const targetUserId = (isAdmin && data.userId) ? data.userId : session.user.id;

  let targetRole = (session.user as any).role;
  if (isAdmin && data.userId) {
    const roleRows = await sql`SELECT role FROM users WHERE id = ${targetUserId}`;
    if (roleRows && roleRows[0]) {
      targetRole = roleRows[0].role;
    }
  }

  try {
    // 1. Fetch current verification status
    let currentProfile;
    if (targetRole === "worker") {
      const rows = await sql`SELECT is_verified, full_name, avatar_url FROM worker_profiles WHERE user_id = ${targetUserId}`;
      currentProfile = rows[0];
    } else {
      const rows = await sql`SELECT is_verified, full_name, avatar_url FROM client_profiles WHERE user_id = ${targetUserId}`;
      currentProfile = rows[0];
    }

    const isVerified = currentProfile?.is_verified || false;
    const faydaFanNumber = normalizeFaydaFan(data.faydaFanNumber);

    // 2. Update Users table (email/phone always editable for now, or follow system rules)
    if (data.email || data.phone) {
        await sql`
          UPDATE users 
          SET 
            email = COALESCE(${data.email}, email),
            phone = COALESCE(${data.phone}, phone)
          WHERE id = ${targetUserId}
        `;
    }

    // 3. Update Profile tables
    if (targetRole === "worker") {
      await sql`
        UPDATE worker_profiles 
        SET 
          full_name = ${isVerified ? currentProfile.full_name : data.fullName},
          avatar_url = ${isVerified ? currentProfile.avatar_url : data.avatarUrl},
          bio = ${data.bio},
          skills = ${data.skills},
          gender = ${data.gender},
          date_of_birth = ${data.dateOfBirth},
          district = ${data.district},
          hourly_rate = ${data.hourlyRate},
          fayda_fan_number = COALESCE(${faydaFanNumber}, fayda_fan_number)
        WHERE user_id = ${targetUserId}
      `;
    } else {
      await sql`
        UPDATE client_profiles 
        SET 
          full_name = ${isVerified ? currentProfile.full_name : data.fullName},
          avatar_url = ${isVerified ? currentProfile.avatar_url : data.avatarUrl},
          fayda_fan_number = COALESCE(${faydaFanNumber}, fayda_fan_number)
        WHERE user_id = ${targetUserId}
      `;
    }

    revalidatePath(`/${targetRole}/profile`);
    revalidatePath(`/${targetRole}/profile/settings`);
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_PROFILE_ERROR]", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function resubmitVerification(faydaDocUrl: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "worker") {
    return { success: false, error: "Unauthorized" };
  }

  if (!isTrustedUploadReference(faydaDocUrl, { allowDataImage: true })) {
    return { success: false, error: "Invalid Fayda document reference" };
  }

  try {
    await sql`
      UPDATE worker_profiles 
      SET 
        fayda_doc_url = ${faydaDocUrl}, 
        verification_status = 'pending',
        is_verified = false
      WHERE user_id = ${session.user.id}
    `;

    revalidatePath("/worker/pending-verification");
    return { success: true };
  } catch (error) {
    console.error("[RESUBMIT_VERIFICATION_ERROR]", error);
    return { success: false, error: "Failed to resubmit verification document" };
  }
}

