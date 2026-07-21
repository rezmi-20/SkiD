"use client";

import { useParams } from "next/navigation";
import UnifiedChatWorkspace from "@/components/chat/UnifiedChatWorkspace";

export default function WorkerConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  return <UnifiedChatWorkspace role="worker" conversationId={conversationId} />;
}
