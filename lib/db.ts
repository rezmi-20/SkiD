import { neon } from "@neondatabase/serverless";

/**
 * Build-Safe Database Proxy
 * 
 * In Next.js 15+, code is often executed during the build ('Collecting page data').
 * If DATABASE_URL is missing during build, a standard initialization would crash the process.
 * 
 * This Proxy targets a dummy function to allow both:
 * 1. Tagged template usage: sql`SELECT...`
 * 2. Property access: sql.transaction(...)
 * 
 * It only initializes the 'neon' client when a query is actually attempted.
 */
const dummy = () => {};

export const sql = new Proxy(dummy, {
  get(target, prop) {
    if (!process.env.DATABASE_URL) {
      // Return undefined for property access during build if no DB URL
      return undefined;
    }
    const connection = neon(process.env.DATABASE_URL);
    const value = (connection as any)[prop];
    return typeof value === 'function' ? value.bind(connection) : value;
  },
  apply(target, thisArg, argumentsList) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set. Please add it to your environment variables or Vercel settings.");
    }
    const connection = neon(process.env.DATABASE_URL);
    return (connection as any)(...argumentsList);
  }
}) as any;
