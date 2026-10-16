import { redirect } from "next/navigation";

export default function ClientWorkerIndexPage() {
  redirect("/client/search");
}
