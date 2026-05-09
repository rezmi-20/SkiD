import { auth } from "./lib/auth/server";

async function testAuth() {
  console.log("Testing Neon Auth Configuration...");
  console.log("Base URL:", process.env.NEON_AUTH_BASE_URL);
  
  try {
    // This is a dummy call to see if the handlers initialize
    const handlers = auth.handlers;
    console.log("Handlers initialized successfully");
  } catch (err) {
    console.error("Handlers failed to initialize:", err);
  }
}

testAuth();
