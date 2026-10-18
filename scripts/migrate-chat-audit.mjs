import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import dns from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing.");
  process.exit(1);
}

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

async function run() {
  console.log("Applying chat audit columns to messages table...");

  await sql`
    ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;
  `;
  console.log("Added is_system column.");

  await sql`
    ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS event_type VARCHAR(50);
  `;
  console.log("Added event_type column.");

  await sql`
    ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS action_url VARCHAR(255);
  `;
  console.log("Added action_url column.");

  await sql`
    ALTER TABLE messages 
    ADD COLUMN IF NOT EXISTS metadata JSONB;
  `;
  console.log("Added metadata column.");

  await sql`
    ALTER TABLE messages 
    ALTER COLUMN sender_id DROP NOT NULL;
  `;
  console.log("Made sender_id nullable for system messages.");

  console.log("Migration complete!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
