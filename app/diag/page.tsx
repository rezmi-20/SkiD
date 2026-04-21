export default function DiagPage() {
  return (
    <div style={{ padding: '50px', background: 'white', color: 'black' }}>
      <h1>Diagnostic Page</h1>
      <p>If you can see this, the basic Next.js routing and rendering is working.</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}
