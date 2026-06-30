"use server";

import { sql } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type NotificationType =
  | "new_message"
  | "contract_signed"
  | "contract_completed"
  | "job_accepted"
  | "job_rejected"
  | "job_request"
  | "job_status_update"
  | "fayda_approved"
  | "fayda_rejected"
  | "new_review"
  | "payment_initiated"
  | "payment_confirmed"
  | "post_liked"
  | "post_commented";

export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await sql`
      SELECT * FROM notifications
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
      LIMIT 60
    `;
  } catch (error) {
    console.error("[GET_NOTIFICATIONS_ERROR]", error);
    return [];
  }
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  try {
    const rows = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${session.user.id} AND is_read = false
    `;
    return Number(rows[0]?.count ?? 0);
  } catch {
    return 0;
  }
}

export async function markAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  await sql`
    UPDATE notifications SET is_read = true
    WHERE id = ${notificationId} AND user_id = ${session.user.id}
  `;
  revalidatePath("/client/notifications");
  revalidatePath("/worker/notifications");
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await sql`
    UPDATE notifications SET is_read = true
    WHERE user_id = ${session.user.id} AND is_read = false
  `;
  revalidatePath("/client/notifications");
  revalidatePath("/worker/notifications");
}

/** Internal utility — call from other server actions to create notifications */
export async function createNotification({
  userId,
  type,
  title,
  body,
  linkHref,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkHref?: string;
}) {
  try {
    await sql`
      INSERT INTO notifications (user_id, type, title, body, link_href)
      VALUES (${userId}, ${type}, ${title}, ${body}, ${linkHref ?? null})
    `;
  } catch (error) {
    console.error("[CREATE_NOTIFICATION_ERROR]", error);
  }
}
