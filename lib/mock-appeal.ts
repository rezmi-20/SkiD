export const DEMO_APPEAL_DATA = {
  appeal: {
    id: "app-gov-8910",
    reference: "DS-APL-2026-0814",
    appellant_user_id: "user-demo",
    target_id: "disp-bo-9082",
    target_type: "dispute_resolution",
    appeal_type: "dispute_resolution",
    status: "appeal_under_review", // or appeal_resolved
    reason: "new_evidence",
    explanation:
      "Submitting newly uncovered RF spectrum analyzer photos showing the antenna feed horn was physically damaged during factory transit rather than poor installation alignment. Additionally submitting supplier dispatch logs proving replacement hardware was dispatched within the original service SLA.",
    outcome: "appeal_granted",
    outcome_reason:
      "Super Admin Governance Review: The newly submitted RF spectrum logs and supplier dispatch records verify external hardware defects rather than craftsmanship fault. Milestone release reversed in worker's favour with 0 platform strikes recorded.",
    evidence_references: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    ],
    created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
    resolved_at: new Date(Date.now() - 0.5 * 864e5).toISOString(),
  },
  events: [
    {
      event_type: "appeal_lodged",
      actor_type: "user",
      created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
    },
    {
      event_type: "docket_assigned_super_admin",
      actor_type: "system",
      created_at: new Date(Date.now() - 1.8 * 864e5).toISOString(),
    },
    {
      event_type: "hardware_telemetry_verified",
      actor_type: "super_admin",
      created_at: new Date(Date.now() - 1 * 864e5).toISOString(),
    },
    {
      event_type: "governance_ruling_issued",
      actor_type: "super_admin",
      created_at: new Date(Date.now() - 0.5 * 864e5).toISOString(),
    },
  ],
};
