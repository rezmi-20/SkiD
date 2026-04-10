import { auth } from "@/lib/auth";

export default async function TestUpdatePage() {
  const session = await auth();
  
  return (
    <div style={{ padding: '50px', background: '#eef2f3', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#0070f3' }}>🚀 UPDATE SUCCESSFUL</h1>
      <p>If you can see this page, Vercel is correctly deploying your code.</p>
      <hr />
      <h3>Session Info:</h3>
      <pre style={{ background: '#ddd', padding: '15px', borderRadius: '8px' }}>
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
