import dns from "node:dns";
import { resolve } from "node:path";
import { config } from "dotenv";
import { Agent, setGlobalDispatcher } from "undici";
import { neon } from "@neondatabase/serverless";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

if (typeof dns?.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}

const agent = new Agent({
  connect: {
    lookup: (hostname, options, callback) => {
      dns.resolve4(hostname, (err, addresses) => {
        if (err || !addresses?.length) {
          return dns.lookup(hostname, options, callback);
        }
        const valid = addresses.filter((ip) => !ip.startsWith("100.") && !ip.startsWith("205."));
        const targetIp = valid[0] || addresses[0];
        if (options && options.all) {
          callback(null, [{ address: targetIp, family: 4 }]);
        } else {
          callback(null, targetIp, 4);
        }
      });
    },
    timeout: 30000,
  },
});
setGlobalDispatcher(agent);

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const recentJobs = await sql`
    SELECT id, client_id, worker_id, title, status, created_at, updated_at
    FROM jobs
    ORDER BY created_at DESC
    LIMIT 5
  `;
  console.log("=== RECENT JOBS ===");
  console.log(JSON.stringify(recentJobs, null, 2));

  const recentContracts = await sql`
    SELECT id, job_id, status, terms_status, payment_amount, client_signed_at, worker_signed_at, created_at
    FROM contracts
    ORDER BY created_at DESC
    LIMIT 5
  `;
  console.log("=== RECENT CONTRACTS ===");
  console.log(JSON.stringify(recentContracts, null, 2));

  const recentMessages = await sql`
    SELECT id, conversation_id, sender_id, is_system, event_type, body, created_at
    FROM messages
    ORDER BY created_at DESC
    LIMIT 6
  `;
  console.log("=== RECENT MESSAGES ===");
  console.log(JSON.stringify(recentMessages, null, 2));
}

main().catch(console.error);
