import { auth } from "@/lib/auth/server";

export const { GET, POST, PUT, DELETE } = auth.handlers;

