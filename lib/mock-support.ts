export const DEMO_SUPPORT_TICKET = {
  ticket: {
    id: "tkt-demo-501",
    reference: "DS-SUP-2026-4402",
    category: "payment_inquiry",
    priority: "high",
    subject: "Telebirr Milestone Settlement Confirmation Delay",
    description:
      "Client initiated milestone payment via Telebirr SuperApp at 2:15 PM today, but the transaction ledger status still indicates awaiting gateway verification. Transaction reference TB-994812.",
    status: "in_progress", // open, in_progress, awaiting_user, resolved, closed
    created_at: new Date(Date.now() - 1.5 * 864e5).toISOString(),
    updated_at: new Date(Date.now() - 0.2 * 864e5).toISOString(),
    assigned_staff: "Senior Support Desk - Addis Ababa",
  },
  messages: [
    {
      id: "msg-1",
      actor_type: "client",
      sender_name: "Almaz Bekele",
      sender_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      content:
        "Hello Support, I completed the Telebirr transfer for Job #BO-204 (4,000 ETB). The funds left my account, but the status is still showing as awaiting settlement. Could you please reconcile this?",
      created_at: new Date(Date.now() - 1.5 * 864e5).toISOString(),
    },
    {
      id: "msg-2",
      actor_type: "staff",
      sender_name: "DireSkill Support Specialist",
      sender_avatar: null,
      content:
        "Greetings Almaz. Thank you for reaching out! We received your Telebirr reference TB-994812. Ethio Telecom’s gateway batch settlement was undergoing routine maintenance. We have initiated a manual webhook check with Chapa.",
      created_at: new Date(Date.now() - 0.8 * 864e5).toISOString(),
    },
    {
      id: "msg-3",
      actor_type: "staff",
      sender_name: "DireSkill Support Specialist",
      sender_avatar: null,
      content:
        "Update: Gateway confirmation received! The 4,000 ETB is now securely locked under Milestone Protection. The technician Tadesse Hailu has been notified that work is clear to begin.",
      created_at: new Date(Date.now() - 0.2 * 864e5).toISOString(),
    },
  ],
  events: [
    {
      event_type: "ticket_opened",
      created_at: new Date(Date.now() - 1.5 * 864e5).toISOString(),
    },
    {
      event_type: "assigned_to_desk",
      created_at: new Date(Date.now() - 1.4 * 864e5).toISOString(),
    },
    {
      event_type: "telebirr_reconciliation_initiated",
      created_at: new Date(Date.now() - 0.8 * 864e5).toISOString(),
    },
    {
      event_type: "milestone_lock_confirmed",
      created_at: new Date(Date.now() - 0.2 * 864e5).toISOString(),
    },
  ],
  attachments: [
    {
      id: "att-1",
      file_name: "telebirr_sms_receipt_tb994812.png",
      url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
      mime_type: "image/png",
      file_size: 420000,
    },
  ],
};
