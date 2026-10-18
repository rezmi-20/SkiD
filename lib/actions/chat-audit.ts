import { sql } from "@/lib/db";

export interface ChatMilestoneParams {
  clientId: string;
  workerId: string;
  actorId?: string | null;
  eventType:
    | "job_invited"
    | "job_accepted"
    | "job_rejected"
    | "job_started"
    | "contract_created"
    | "terms_submitted"
    | "terms_accepted"
    | "terms_rejected"
    | "contract_signed"
    | "contract_activated"
    | "escrow_funded"
    | "completion_requested"
    | "job_completed"
    | "dispute_opened";
  title: string;
  description: string;
  actionUrl?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Records an automated, legally tamper-evident contract/job milestone
 * directly inside the in-app chat thread between the client and worker.
 * Acts as verifiable legal audit evidence showing the chronological meeting of minds.
 */
export async function recordChatMilestone(params: ChatMilestoneParams) {
  try {
    const { clientId, workerId, actorId, eventType, title, description, actionUrl, metadata } = params;

    console.log(`[CHAT_AUDIT] 👉 Recording milestone [${eventType}]: "${title}" (client: ${clientId}, worker: ${workerId})`);

    if (!clientId || !workerId) {
      console.warn(`[CHAT_AUDIT] ⚠️ Missing clientId or workerId`, { clientId, workerId });
      return null;
    }

    // 1. Find or create the conversation thread between these two parties
    let convRows = await sql`
      SELECT id FROM conversations
      WHERE (client_id = ${clientId} AND worker_id = ${workerId})
         OR (client_id = ${workerId} AND worker_id = ${clientId})
      LIMIT 1
    `;

    let conversationId: string;
    if (convRows.length > 0) {
      conversationId = convRows[0].id;
    } else {
      const newConv = await sql`
        INSERT INTO conversations (client_id, worker_id)
        VALUES (${clientId}, ${workerId})
        RETURNING id
      `;
      conversationId = newConv[0].id;
    }

    // 2. Prepare milestone payload
    const formattedBody = title ? `${title}: ${description}` : description;
    const finalMetadata = JSON.stringify({
      title,
      description,
      eventType,
      actionUrl,
      timestamp: new Date().toISOString(),
      ...(metadata || {}),
    });

    // 3. Insert system audit milestone message
    const msgRows = await sql`
      INSERT INTO messages (
        conversation_id,
        sender_id,
        body,
        is_system,
        event_type,
        action_url,
        metadata,
        is_read
      )
      VALUES (
        ${conversationId},
        ${actorId || null},
        ${formattedBody},
        TRUE,
        ${eventType},
        ${actionUrl || null},
        ${finalMetadata}::jsonb,
        FALSE
      )
      RETURNING id, conversation_id, body, is_system, event_type, action_url, metadata, created_at
    `;

    const recorded = msgRows[0] ?? null;
    if (recorded) {
      console.log(`[CHAT_AUDIT] ✅ Milestone successfully recorded: msg_id=${recorded.id} in conversation=${conversationId}`);
    }
    return recorded;
  } catch (err) {
    console.error("[RECORD_CHAT_MILESTONE_ERROR]", err);
    return null;
  }
}
