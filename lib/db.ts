import { neon } from "@neondatabase/serverless";

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
