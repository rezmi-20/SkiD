import { getNotifications } from "@/lib/actions/notifications";
import NotificationsContent from "@/components/NotificationsContent";

export const metadata = {
  title: "Notifications | DireSkill",
  description: "Stay informed about your contracts, messages, and activity.",
};

export default async function ClientNotificationsPage() {
  const notifications = await getNotifications();
  return <NotificationsContent initialNotifications={notifications as any} />;
}
