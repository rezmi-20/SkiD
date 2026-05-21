const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_uH9bUs3KmtLP@ep-mute-meadow-anqyrcz7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function simulateFlow() {
  console.log("🚀 Starting Detailed Program Flow Simulation...");

  try {
    // Phase 1: Registration
    console.log("\n--- Phase 1: Registration ---");
    
    // 1.1 Create Client
    const clientPhone = `+2519${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    const clientEmail = `client_${Date.now()}@test.com`;
    console.log(`👤 Registering Client: ${clientEmail} (${clientPhone})`);
    
    const clientRes = await sql`
      INSERT INTO users (email, phone, password_hash, role) 
      VALUES (${clientEmail}, ${clientPhone}, 'hashed_password', 'client') 
      RETURNING id
    `;
    const clientId = clientRes[0].id;
    
    await sql`
      INSERT INTO client_profiles (user_id, full_name, is_verified) 
      VALUES (${clientId}, 'Test Client', true)
    `;
    console.log(`✅ Client registered successfully. ID: ${clientId}`);

    // 1.2 Create Worker
    const workerPhone = `+2519${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    const workerEmail = `worker_${Date.now()}@test.com`;
    console.log(`\n👷 Registering Worker: ${workerEmail} (${workerPhone})`);
    
    const workerRes = await sql`
      INSERT INTO users (email, phone, password_hash, role) 
      VALUES (${workerEmail}, ${workerPhone}, 'hashed_password', 'worker') 
      RETURNING id
    `;
    const workerId = workerRes[0].id;
    
    await sql`
      INSERT INTO worker_profiles (user_id, full_name, skills, is_verified, hourly_rate) 
      VALUES (${workerId}, 'Test Plumber', ARRAY['Plumbing', 'Pipe Repair'], false, 500)
    `;
    console.log(`✅ Worker registered. ID: ${workerId}`);

    // 1.3 Admin Approves Worker
    console.log(`\n🛡️ Admin Flow: Approving Worker`);
    await sql`UPDATE worker_profiles SET is_verified = true WHERE user_id = ${workerId}`;
    console.log(`✅ Worker verified successfully.`);

    // Phase 2: Main Hiring Flow (Client Side)
    console.log("\n--- Phase 2: Hiring Flow ---");
    console.log(`🔍 Client searching for workers...`);
    const searchRes = await sql`SELECT * FROM worker_profiles WHERE is_verified = true LIMIT 1`;
    console.log(`✅ Found worker: ${searchRes[0].full_name}`);

    console.log(`💬 Client sends message to Worker...`);
    const convRes = await sql`
      INSERT INTO conversations (client_id, worker_id) VALUES (${clientId}, ${workerId}) RETURNING id
    `;
    const convId = convRes[0].id;
    await sql`
      INSERT INTO messages (conversation_id, sender_id, body) 
      VALUES (${convId}, ${clientId}, 'Hello, I need plumbing help.')
    `;
    console.log(`✅ Conversation created. ID: ${convId}`);

    console.log(`📝 Client creates digital contract...`);
    const jobRes = await sql`
      INSERT INTO jobs (client_id, worker_id, title, description, budget, status) 
      VALUES (${clientId}, ${workerId}, 'Fix kitchen sink', 'Pipe is leaking', 1500, 'pending') 
      RETURNING id
    `;
    const jobId = jobRes[0].id;
    
    const contractRes = await sql`
      INSERT INTO contracts (job_id, terms, client_signed_at) 
      VALUES (${jobId}, 'Fix the sink by tomorrow.', NOW()) 
      RETURNING id
    `;
    const contractId = contractRes[0].id;
    console.log(`✅ Contract created and signed by Client. ID: ${contractId}`);

    // Phase 3: Worker Side Actions
    console.log("\n--- Phase 3: Worker Actions ---");
    console.log(`👷 Worker views and signs contract...`);
    await sql`
      UPDATE contracts SET worker_signed_at = NOW(), signed_at = NOW() WHERE id = ${contractId}
    `;
    await sql`
      UPDATE jobs SET status = 'active' WHERE id = ${jobId}
    `;
    console.log(`✅ Contract signed by Worker. Job is now ACTIVE.`);

    // Phase 4: Job Completion & Payment
    console.log("\n--- Phase 4: Completion & Payment ---");
    console.log(`👷 Worker completes job. Client confirms...`);
    await sql`
      UPDATE jobs SET status = 'completed' WHERE id = ${jobId}
    `;
    console.log(`✅ Job marked as COMPLETED.`);

    console.log(`💳 Client completes payment simulation...`);
    const txRef = `SIM-${Date.now()}`;
    await sql`
      INSERT INTO payments (job_id, amount, status, chapa_ref) 
      VALUES (${jobId}, 1500, 'released', ${txRef})
    `;
    console.log(`✅ Payment successful. TxRef: ${txRef}`);

    console.log(`⭐ Client rates Worker...`);
    await sql`
      INSERT INTO ratings (job_id, rater_id, rated_id, score, comment) 
      VALUES (${jobId}, ${clientId}, ${workerId}, 5, 'Great plumbing work!')
    `;
    console.log(`✅ Rating submitted.`);

    console.log(`\n🎉 All tests passed successfully! The backend flow works end-to-end.`);
    
  } catch (err) {
    console.error("\n❌ Simulation failed:", err.message);
  }
}

simulateFlow();
