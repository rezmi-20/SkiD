"use client";

import { useEffect, useState } from "react";
import MessagesContent from "@/components/MessagesContent";

export default function WorkerMessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <MessagesContent 
      conversations={conversations}
      loading={loading}
      role="worker"
    />
  );
}
