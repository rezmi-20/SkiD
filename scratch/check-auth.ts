import { auth } from "./lib/auth/server";

console.log("Auth keys:", Object.keys(auth));
if (auth.handlers) {
  console.log("Auth handlers keys:", Object.keys(auth.handlers));
}
