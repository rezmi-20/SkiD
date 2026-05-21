import { auth } from "@/lib/auth/server";

export const dynamic = 'force-dynamic';

const handlers = auth.handler();

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
