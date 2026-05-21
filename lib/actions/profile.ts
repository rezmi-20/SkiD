"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

    return {
      ...user,
      ...profile,
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

  const userId = session.user.id;
  const role = (session.user as any).role;

  try {
    // 1. Fetch current verification status
    let currentProfile;
    if (role === "worker") {
      const rows = await sql`SELECT is_verified, full_name, avatar_url FROM worker_profiles WHERE user_id = ${userId}`;
      currentProfile = rows[0];
    } else {
      const rows = await sql`SELECT is_verified, full_name, avatar_url FROM client_profiles WHERE user_id = ${userId}`;
      currentProfile = rows[0];
    }

    const isVerified = currentProfile?.is_verified || false;

    // 2. Update Users table (email/phone always editable for now, or follow system rules)
    if (data.email || data.phone) {
        await sql`
          UPDATE users 
          SET 
            email = COALESCE(${data.email}, email),
            phone = COALESCE(${data.phone}, phone)
          WHERE id = ${userId}
        `;
    }

    // 3. Update Profile tables
    if (role === "worker") {
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
          hourly_rate = ${data.hourlyRate}
        WHERE user_id = ${userId}
      `;
    } else {
      await sql`
        UPDATE client_profiles 
        SET 
          full_name = ${isVerified ? currentProfile.full_name : data.fullName},
          avatar_url = ${isVerified ? currentProfile.avatar_url : data.avatarUrl}
        WHERE user_id = ${userId}
      `;
    }

    revalidatePath(`/${role}/profile`);
    revalidatePath(`/${role}/profile/settings`);
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_PROFILE_ERROR]", error);
    return { success: false, error: "Failed to update profile" };
  }
}
