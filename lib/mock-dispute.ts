export interface MockDisputeScenario {
  id: string;
  label: string;
  description: string;
  data: any;
}

export const MOCK_DISPUTE_SCENARIOS: Record<string, MockDisputeScenario> = {
  under_review: {
    id: "under_review",
    label: "1. Under Admin Investigation",
    description: "Initial client filing, evidence uploaded, worker response requested.",
    data: {
      dispute: {
        id: "disp-bo-9082",
        contract_id: "cnt-bole-204",
        job_id: "job-dish-101",
        job_title: "Commercial Satellite Dish & LNB Alignment",
        title: "Incomplete Signal Calibration and Missing LNB Bracket",
        category: "incomplete_work",
        requested_resolution: "partial_refund_and_release",
        description:
          "The technician aligned the dish for standard frequencies, but 4 HD transponders show zero signal. Additionally, the weatherproof cable grommet was not installed as agreed in the contract terms. We request completion or a 30% adjustment on the milestone release.",
        status: "under_investigation",
        created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
        resolved_at: null,
        opened_by_role: "client",
        final_decision: null,
        final_reason: null,
        current_job_status: "in_progress",
        current_contract_status: "disputed",
        current_payment_status: "held",
        required_action: "worker_response_required",
      },
      events: [
        {
          event_type: "dispute_opened",
          actor_type: "client",
          created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
          note: "Dispute opened by client with 2 attached photos of mounting setup.",
        },
        {
          event_type: "milestone_frozen",
          actor_type: "system",
          created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
          note: "Milestone release halted under DireSkill Milestone Protection protocol.",
        },
        {
          event_type: "response_requested",
          actor_type: "admin",
          created_at: new Date(Date.now() - 1.5 * 864e5).toISOString(),
          note: "Admin requested worker clarification regarding transponder calibration.",
        },
      ],
      evidence: [
        {
          id: "evi-1",
          file_name: "dish_bracket_missing_grommet.jpg",
          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
          mime_type: "image/jpeg",
          file_size: 2450000,
          created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
        },
        {
          id: "evi-2",
          file_name: "rf_signal_meter_snr_zero.png",
          url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
          mime_type: "image/png",
          file_size: 1820000,
          created_at: new Date(Date.now() - 1.8 * 864e5).toISOString(),
        },
      ],
      responses: [
        {
          id: "resp-1",
          requested_from: "worker",
          status: "requested",
          instruction:
            "Please provide photo verification of the final transponder SNR spectrum scan or propose a site revisit time.",
          due_at: new Date(Date.now() + 1.2 * 864e5).toISOString(),
          response_text: null,
        },
      ],
    },
  },
  mutual_evidence: {
    id: "mutual_evidence",
    label: "2. Counter-Evidence Exchanged",
    description: "Worker provided technical receipts and photos showing transponders.",
    data: {
      dispute: {
        id: "disp-bo-9082",
        contract_id: "cnt-bole-204",
        job_id: "job-dish-101",
        job_title: "Commercial Satellite Dish & LNB Alignment",
        title: "Incomplete Signal Calibration and Missing LNB Bracket",
        category: "incomplete_work",
        requested_resolution: "partial_refund_and_release",
        description:
          "The technician aligned the dish for standard frequencies, but 4 HD transponders show zero signal. Additionally, the weatherproof cable grommet was not installed as agreed in the contract terms.",
        status: "evidence_review",
        created_at: new Date(Date.now() - 3 * 864e5).toISOString(),
        resolved_at: null,
        opened_by_role: "client",
        final_decision: null,
        final_reason: null,
        current_job_status: "in_progress",
        current_contract_status: "disputed",
        current_payment_status: "held",
        required_action: "admin_deliberation",
      },
      events: [
        {
          event_type: "dispute_opened",
          actor_type: "client",
          created_at: new Date(Date.now() - 3 * 864e5).toISOString(),
        },
        {
          event_type: "worker_response_submitted",
          actor_type: "worker",
          created_at: new Date(Date.now() - 1.2 * 864e5).toISOString(),
        },
        {
          event_type: "evidence_submitted",
          actor_type: "worker",
          created_at: new Date(Date.now() - 1.1 * 864e5).toISOString(),
        },
      ],
      evidence: [
        {
          id: "evi-1",
          file_name: "dish_bracket_missing_grommet.jpg",
          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
          mime_type: "image/jpeg",
          file_size: 2450000,
          created_at: new Date(Date.now() - 3 * 864e5).toISOString(),
        },
        {
          id: "evi-2",
          file_name: "technician_calibration_receipt.pdf",
          url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
          mime_type: "application/pdf",
          file_size: 940000,
          created_at: new Date(Date.now() - 1.1 * 864e5).toISOString(),
        },
      ],
      responses: [
        {
          id: "resp-1",
          requested_from: "worker",
          status: "completed",
          instruction:
            "Please provide photo verification of the final transponder SNR spectrum scan.",
          due_at: new Date(Date.now() - 864e5).toISOString(),
          response_text:
            "I calibrated the primary feed to 86% SNR at 4:30 PM. The client’s indoor splitter box is unpowered, which dampens the high-frequency HD bands. I am willing to return tomorrow at 10 AM to rewire their distribution box.",
        },
      ],
    },
  },
  resolved_favour_client: {
    id: "resolved_favour_client",
    label: "3. Resolved: Partial Refund (Settled)",
    description: "Admin issued mutual settlement: 30% refund to client, 70% released to worker.",
    data: {
      dispute: {
        id: "disp-bo-9082",
        contract_id: "cnt-bole-204",
        job_id: "job-dish-101",
        job_title: "Commercial Satellite Dish & LNB Alignment",
        title: "Incomplete Signal Calibration and Missing LNB Bracket",
        category: "incomplete_work",
        requested_resolution: "partial_refund_and_release",
        description:
          "The technician aligned the dish for standard frequencies, but 4 HD transponders show zero signal.",
        status: "resolved",
        created_at: new Date(Date.now() - 5 * 864e5).toISOString(),
        resolved_at: new Date(Date.now() - 1 * 864e5).toISOString(),
        opened_by_role: "client",
        final_decision: "partial_refund",
        final_reason:
          "Independent review confirms core antenna alignment completed (70% value), but weatherproofing and transponder 4 certification incomplete (30% value). 1,200 ETB refunded to client wallet; 2,800 ETB milestone released to worker.",
        current_job_status: "completed",
        current_contract_status: "completed",
        current_payment_status: "released",
        required_action: "none",
      },
      events: [
        {
          event_type: "dispute_opened",
          actor_type: "client",
          created_at: new Date(Date.now() - 5 * 864e5).toISOString(),
        },
        {
          event_type: "evidence_reviewed",
          actor_type: "admin",
          created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
        },
        {
          event_type: "dispute_resolved",
          actor_type: "admin",
          created_at: new Date(Date.now() - 1 * 864e5).toISOString(),
        },
      ],
      evidence: [
        {
          id: "evi-1",
          file_name: "dish_bracket_missing_grommet.jpg",
          url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
          mime_type: "image/jpeg",
          file_size: 2450000,
          created_at: new Date(Date.now() - 5 * 864e5).toISOString(),
        },
      ],
      responses: [
        {
          id: "resp-1",
          requested_from: "worker",
          status: "completed",
          instruction: "Please provide photo verification.",
          due_at: new Date(Date.now() - 3 * 864e5).toISOString(),
          response_text: "Agreed to mutual 30% adjustment for remaining indoor cabling.",
        },
      ],
    },
  },
};
