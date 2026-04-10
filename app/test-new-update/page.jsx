import { auth } from "@/lib/auth";

export default async function TestUpdatePage() {
  const session = await auth();
  
  return (
    <div style={{ padding: '50px', background: '#eef2f3', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#0070f3' }}>🚀 UPDATE SUCCESSFUL</h1>
      <p>If you can see this page, Vercel is correctly deploying your code.</p>
      <h3>Vercel Environment Checklist:</h3>
      <ul style={{ background: '#fff', padding: '20px', borderRadius: '8px', listStyle: 'none' }}>
        <li>✅ <strong>DATABASE_URL:</strong> {process.env.DATABASE_URL ? "FOUND" : "❌ MISSING (Go to Vercel Settings -> Environment Variables)"}</li>
        <li>✅ <strong>AUTH_SECRET:</strong> {process.env.AUTH_SECRET ? "FOUND" : "❌ MISSING (Go to Vercel Settings -> Environment Variables)"}</li>
      </ul>

      <hr />
      <h3>Session Info:</h3>
      <pre style={{ background: '#ddd', padding: '15px', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(session, null, 2)}
      </pre>
      <p><strong>Status:</strong> {session?.user ? "LOGGED IN" : "NOT LOGGED IN"}</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ marginRight: '20px' }}>Back to Home</a>
        <a href="/login">Go to Login</a>
      </div>
    </div>
  );
}
