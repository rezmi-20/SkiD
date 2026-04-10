import { neon } from "@neondatabase/serverless";

// We use a proxy to prevent the build from crashing if DATABASE_URL is missing.
// This allows Next.js to pre-render/scan files without a database connection.
// An error will only be thrown if a database query is actually executed.
export const sql = new Proxy({}, {
  get(target, prop) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set. Please add it to your environment variables or Vercel settings.");
    }
    
    // Initialize neon connection lazily
    const connection = neon(process.env.DATABASE_URL);
    
    // Handle both property access and function calls
    const value = (connection as any)[prop];
    return typeof value === 'function' ? value.bind(connection) : value;
  },
  // Handle calling sql`...`
  apply(target, thisArg, argumentsList) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set. Please add it to your environment variables or Vercel settings.");
    }
    const connection = neon(process.env.DATABASE_URL);
    return (connection as any)(...argumentsList);
  }
}) as any;
