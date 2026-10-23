import { neon } from "@neondatabase/serverless";
import dns from "node:dns";
import { Agent, setGlobalDispatcher } from "undici";
import { validateProductionEnvironment } from "@/lib/env";

validateProductionEnvironment();

// Optimize connection on cellular hotspots and networks with unroutable IPv6 (LOCAL DEV ONLY)
if (!process.env.VERCEL) {
  if (typeof dns?.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }

  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // Ignore in environments where setServers is unsupported
  }

  // Configure Undici with 30s connection timeout and clean IPv4 routing for Neon pooler
  const globalDispatcherKey = Symbol.for("skid.undici.dispatcher");
  if (!(global as any)[globalDispatcherKey]) {
    try {
      const agent = new Agent({
        connect: {
          lookup: (hostname, options, callback) => {
            dns.resolve4(hostname, (err, addresses) => {
              if (err || !addresses?.length) {
                return dns.lookup(hostname, options, callback);
              }
              // Filter out CGNAT 100.x or Route53 NS 205.x returned by buggy cellular hotspot DNS
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
      (global as any)[globalDispatcherKey] = true;
    } catch {
      // Fallback gracefully if custom dispatcher is restricted
    }
  }
}

/**
 * DATABASE SINGLETON
 * We use a global variable to ensure that the database client is initialized only once.
 * This is crucial for serverless environments like Vercel to prevent "Too many connections" errors.
 */
const globalForDb = global as unknown as {
  sql: ReturnType<typeof neon> | undefined;
};

const getDbClient = () => {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is missing in production.");
    }
    // Return a dummy for build time
    return () => { throw new Error("Database accessed during build without URL."); };
  }
  
  if (!globalForDb.sql) {
    globalForDb.sql = neon(process.env.DATABASE_URL);
  }
  return globalForDb.sql;
};

/**
 * SQL PROXY
 * This allows us to use `sql` as a tagged template literal OR as a function.
 * We also add a `.query` helper to prevent crashes if code tries to call sql.query().
 */
export const sql = new Proxy(() => {}, {
  get: (target, prop) => {
    const client = getDbClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
  apply: (target, thisArg, args) => {
    const client = getDbClient();
    return (client as any)(...args);
  },
}) as any;
