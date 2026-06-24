async function main() {
  const res = await fetch("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@dire-skill.com", password: "admin123" })
  });
  console.log("Status:", res.status);
  console.log("Set-Cookie Header:", res.headers.get("set-cookie"));
}
main().catch(console.error);
