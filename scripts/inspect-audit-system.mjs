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
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'audit_logs'
    ORDER BY ordinal_position
  `;
  console.log("=== AUDIT_LOGS COLUMNS ===");
  console.table(cols);

  const count = await sql`SELECT count(*) FROM audit_logs`;
  console.log("Total audit logs:", count[0].count);

  const sample = await sql`SELECT id, actor_type, user_id, admin_employee_id, action, module, target_type, target_id, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 5`;
  console.log("Recent audit logs:", sample);

  // Check triggers on audit_logs
  const triggers = await sql`
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE event_object_table = 'audit_logs'
  `;
  console.log("=== AUDIT_LOGS TRIGGERS ===");
  console.log(triggers);
}

main().catch(console.error);
