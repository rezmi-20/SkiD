import { DEMO_IDS, connectDemoDatabase, resetDemoData } from "./demo-data-fixtures.mjs";

try {
  const sql = connectDemoDatabase();
  await resetDemoData(sql);

  await sql`
    INSERT INTO users (
      id,
      email,
      password_hash,
      role,
      is_suspended,
      admin_role,
      admin_status,
      admin_activation_required,
      admin_created_at,
      admin_updated_at
    )
    VALUES
      (${DEMO_IDS.client}, 'demo.client@direskill.local', 'demo-auth-managed-externally', 'client', false, null, null, false, null, null),
      (${DEMO_IDS.worker}, 'demo.worker@direskill.local', 'demo-auth-managed-externally', 'worker', false, null, null, false, null, null),
      (${DEMO_IDS.unverifiedWorker}, 'demo.unverified@direskill.local', 'demo-auth-managed-externally', 'worker', false, null, null, false, null, null),
      (${DEMO_IDS.secondClient}, 'demo.second-client@direskill.local', 'demo-auth-managed-externally', 'client', false, null, null, false, null, null),
      (${DEMO_IDS.secondWorker}, 'demo.second-worker@direskill.local', 'demo-auth-managed-externally', 'worker', false, null, null, false, null, null),
      (${DEMO_IDS.rejectedWorker}, 'demo.rejected-worker@direskill.local', 'demo-auth-managed-externally', 'worker', false, null, null, false, null, null),
      (${DEMO_IDS.suspendedWorker}, 'demo.suspended-worker@direskill.local', 'demo-auth-managed-externally', 'worker', true, null, null, false, null, null),
      (${DEMO_IDS.revokedWorker}, 'demo.revoked-worker@direskill.local', 'demo-auth-managed-externally', 'worker', false, null, null, false, null, null),
      (${DEMO_IDS.unverifiedClient}, 'demo.unverified-client@direskill.local', 'demo-auth-managed-externally', 'client', false, null, null, false, null, null)
  `;

  await sql`
    INSERT INTO admin_employees (
      id,
      admin_employee_id,
      work_email,
      full_name,
      department,
      admin_role,
      admin_status,
      admin_activation_required,
      password_hash,
      activation_completed_at,
      identity_reference,
      identity_note,
      session_version,
      created_at,
      updated_at
    )
    VALUES (
      ${DEMO_IDS.admin},
      'OWN-9001',
      'demo.admin@direskill.local',
      'DEMO - Super Admin',
      'Development Testing',
      'super_admin',
      'active',
      false,
      'demo-auth-managed-externally',
      NOW(),
      'browser_smoke_demo',
      'development_test_admin_seed',
      0,
      NOW(),
      NOW()
    )
  `;

  await sql`
    INSERT INTO client_profiles (user_id, full_name, is_verified, verification_status, fin_last4, latitude, longitude)
    VALUES
      (${DEMO_IDS.client}, 'DEMO - Amina Client', true, 'approved', '1202', 9.6009, 41.8501),
      (${DEMO_IDS.secondClient}, 'DEMO - Second Client', true, 'approved', '1205', 9.6014, 41.8510),
      (${DEMO_IDS.unverifiedClient}, 'DEMO - Unverified Client', false, 'incomplete', null, 9.6020, 41.8515)
  `;

  await sql`
    INSERT INTO worker_profiles (
      user_id,
      full_name,
      bio,
      skills,
      latitude,
      longitude,
      district,
      is_verified,
      verification_status,
      verification_reason,
      verified_by,
      verified_at,
      fin_last4,
      hourly_rate,
      experience_years,
      availability,
      chapa_subaccount_id
    )
    VALUES
      (
        ${DEMO_IDS.worker},
        'DEMO - Yusuf Electrician',
        'Demo verified electrician for the final presentation workflow.',
        ARRAY['Electrician', 'House Wiring', 'Generator Repair'],
        9.6004,
        41.8497,
        'Kezira',
        true,
        'approved',
        'Demo worker approved for presentation data only.',
        null,
        NOW(),
        '1203',
        300,
        5,
        'available',
        'demo-chapa-subaccount'
      ),
      (
        ${DEMO_IDS.secondWorker},
        'DEMO - Hana Plumber',
        'Second approved worker used for authorization and duplicate-invitation checks.',
        ARRAY['Plumber', 'Pipe Repair'],
        9.5998,
        41.8507,
        'Kezira',
        true,
        'approved',
        'Demo worker approved for browser workflow tests.',
        null,
        NOW(),
        '1206',
        260,
        4,
        'available',
        'demo-chapa-subaccount-2'
      ),
      (
        ${DEMO_IDS.unverifiedWorker},
        'DEMO - Pending Worker',
        'Demo unverified worker for admin verification queue.',
        ARRAY['Plumber'],
        9.6011,
        41.8488,
        'Kezira',
        false,
        'pending',
        null,
        null,
        null,
        null,
        220,
        2,
        'available',
        null
      ),
      (
        ${DEMO_IDS.rejectedWorker},
        'DEMO - Rejected Worker',
        'Demo worker rejected for discovery filtering.',
        ARRAY['Painter'],
        9.6015,
        41.8491,
        'Kezira',
        false,
        'rejected',
        null,
        null,
        null,
        null,
        180,
        1,
        'available',
        null
      ),
      (
        ${DEMO_IDS.suspendedWorker},
        'DEMO - Suspended Worker',
        'Demo worker suspended for discovery filtering.',
        ARRAY['Mason'],
        9.6017,
        41.8485,
        'Kezira',
        false,
        'suspended',
        null,
        null,
        null,
        null,
        200,
        3,
        'available',
        null
      ),
      (
        ${DEMO_IDS.revokedWorker},
        'DEMO - Revoked Worker',
        'Demo worker revoked for discovery filtering.',
        ARRAY['Carpenter'],
        9.6001,
        41.8479,
        'Kezira',
        false,
        'revoked',
        null,
        null,
        null,
        null,
        240,
        6,
        'available',
        null
      )
  `;

  await sql`
    INSERT INTO contract_setups (user_id, pin_hash, accepted_policy, accepted_signature_use, completed_at, updated_at)
    VALUES
      (${DEMO_IDS.client}, 'demo-auth-managed-externally', true, true, NOW(), NOW()),
      (${DEMO_IDS.worker}, 'demo-auth-managed-externally', true, true, NOW(), NOW()),
      (${DEMO_IDS.secondClient}, 'demo-auth-managed-externally', true, true, NOW(), NOW()),
      (${DEMO_IDS.secondWorker}, 'demo-auth-managed-externally', true, true, NOW(), NOW())
  `;

  await sql`
    INSERT INTO jobs (id, client_id, worker_id, title, description, status, budget, location, requested_date)
    VALUES
      (${DEMO_IDS.jobPending}, ${DEMO_IDS.client}, ${DEMO_IDS.worker}, 'DEMO - Pending outlet repair', 'Initial hiring request waiting for worker response.', 'pending', 1200, 'Kezira, Dire Dawa', NOW()),
      (${DEMO_IDS.jobActive}, ${DEMO_IDS.client}, ${DEMO_IDS.worker}, 'DEMO - Active lighting repair', 'Signed job ready to begin.', 'active', 1800, 'Kezira, Dire Dawa', NOW()),
      (${DEMO_IDS.jobInProgress}, ${DEMO_IDS.client}, ${DEMO_IDS.worker}, 'DEMO - In-progress breaker replacement', 'Worker has started the service.', 'in_progress', 2500, 'Kezira, Dire Dawa', NOW()),
      (${DEMO_IDS.jobCompletionRequested}, ${DEMO_IDS.client}, ${DEMO_IDS.worker}, 'DEMO - Completion review wiring', 'Worker requested completion review.', 'completion_requested', 3000, 'Kezira, Dire Dawa', NOW()),
      (${DEMO_IDS.jobPaymentPending}, ${DEMO_IDS.client}, ${DEMO_IDS.worker}, 'DEMO - Payment pending ceiling lights', 'Client confirmed completion and payment is pending.', 'payment_pending', 3500, 'Kezira, Dire Dawa', NOW()),
      (${DEMO_IDS.jobPaid}, ${DEMO_IDS.client}, ${DEMO_IDS.worker}, 'DEMO - Paid panel maintenance', 'Payment released and rating is available.', 'paid', 4200, 'Kezira, Dire Dawa', NOW())
  `;

  await sql`
    INSERT INTO contracts (
      id,
      job_id,
      terms,
      status,
      job_title,
      job_description,
      work_location,
      payment_amount,
      estimated_completion_date,
      materials_responsibility,
      additional_notes,
      terms_status,
      terms_submitted_at,
      terms_submitted_by,
      terms_accepted_at,
      terms_accepted_by,
      finalized_at,
      finalized_by,
      client_signed_at,
      worker_signed_at,
      signed_at,
      activated_at,
      document_hash,
      pdf_url
    )
    VALUES (
      ${DEMO_IDS.contract},
      ${DEMO_IDS.jobPaid},
      'Demo final contract terms for panel maintenance.',
      'ACTIVE',
      'DEMO - Paid panel maintenance',
      'Inspect panel, tighten loose connections, and document safety checks.',
      'Kezira, Dire Dawa',
      4200,
      NOW() + INTERVAL '2 days',
      'Worker brings standard tools; client provides access to the panel.',
      'Presentation demo contract only.',
      'accepted',
      NOW(),
      ${DEMO_IDS.client},
      NOW(),
      ${DEMO_IDS.worker},
      NOW(),
      ${DEMO_IDS.client},
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      'demo-document-hash',
      '/api/contracts/10000000-0000-4000-8000-000000000201/pdf'
    )
  `;

  await sql`
    INSERT INTO contract_signatures (id, contract_id, user_id, role, consent_confirmed)
    VALUES
      (${DEMO_IDS.signatureClient}, ${DEMO_IDS.contract}, ${DEMO_IDS.client}, 'client', true),
      (${DEMO_IDS.signatureWorker}, ${DEMO_IDS.contract}, ${DEMO_IDS.worker}, 'worker', true)
  `;

  await sql`
    INSERT INTO payments (
      id,
      job_id,
      amount,
      commission_amount,
      net_amount,
      status,
      chapa_ref,
      chapa_reference,
      chapa_status,
      worker_subaccount_id
    )
    VALUES (
      ${DEMO_IDS.payment},
      ${DEMO_IDS.jobPaid},
      4200,
      210,
      3990,
      'released',
      'DIRESKILL-DEMO-PAID',
      'DEMO-CHAPA-REFERENCE',
      'success',
      'demo-chapa-subaccount'
    )
  `;

  await sql`
    INSERT INTO ratings (id, job_id, rater_id, rated_id, score, comment)
    VALUES (${DEMO_IDS.rating}, ${DEMO_IDS.jobPaid}, ${DEMO_IDS.client}, ${DEMO_IDS.worker}, 5, 'Demo review: punctual, professional, and clear.')
  `;

  await sql`
    INSERT INTO notifications (user_id, type, title, body, link_href)
    VALUES
      (${DEMO_IDS.client}, 'demo', 'DEMO - Payment ready', 'Use the payment pending demo job for the payment walkthrough.', '/client/payments'),
      (${DEMO_IDS.worker}, 'demo', 'DEMO - Completion requested', 'Use the in-progress demo job for worker completion flow.', '/worker/gigs'),
      (${DEMO_IDS.unverifiedWorker}, 'demo', 'DEMO - Verification pending', 'This worker remains unverified for the demo.', '/worker/pending-verification')
  `;

  console.log("PASS demo data seeded");
  console.log("Demo authentication accounts are not provisioned by this script; use the normal auth flow or auth admin tooling as documented.");
} catch (error) {
  console.error("MISSING demo data seed failed");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
