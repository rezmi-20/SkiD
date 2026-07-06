import { NextRequest, NextResponse } from "next/server";
import { auth as serverAuth } from "@/lib/auth/server";
import { auth as wrapperAuth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const debug: any = {
        step1_cookies: null,
        step2_serverAuth: null,
        step3_wrapperAuth: null,
        step4_database: null,
        errors: [],
    };

    try {
        // Step 1: Check raw cookies
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        debug.step1_cookies = {
            count: allCookies.length,
            names: allCookies.map(c => c.name),
            sessionCookie: null,
        };

        const sessionCookie = cookieStore.get("neon-auth.local.session_data");
        if (sessionCookie) {
            debug.step1_cookies.sessionCookie = {
                name: sessionCookie.name,
                valueLength: sessionCookie.value.length,
                valuePreview: sessionCookie.value.substring(0, 50) + "...",
            };
        }

        // Step 2: Try serverAuth.getSession() directly
        try {
            const serverSession = await serverAuth.getSession();
            debug.step2_serverAuth = {
                success: true,
                hasData: !!serverSession?.data,
                hasUser: !!serverSession?.data?.user,
                userEmail: serverSession?.data?.user?.email || null,
                userId: serverSession?.data?.user?.id || null,
                fullData: JSON.stringify(serverSession?.data).substring(0, 200),
            };
        } catch (e: any) {
            debug.step2_serverAuth = { success: false, error: e.message };
            debug.errors.push("serverAuth.getSession failed: " + e.message);
        }

        // Step 3: Try wrapper auth()
        try {
            const wrapperSession = await wrapperAuth();
            debug.step3_wrapperAuth = {
                success: true,
                hasUser: !!wrapperSession?.user,
                userEmail: wrapperSession?.user?.email || null,
                userId: wrapperSession?.user?.id || null,
                role: (wrapperSession?.user as any)?.role || null,
            };
        } catch (e: any) {
            debug.step3_wrapperAuth = { success: false, error: e.message };
            debug.errors.push("wrapperAuth failed: " + e.message);
        }

        // Step 4: Check database (if we have a user ID)
        const userId = debug.step3_wrapperAuth?.userId || debug.step2_serverAuth?.userId;
        if (userId) {
            try {
                const rows = await sql`SELECT id, role, email FROM users WHERE id = ${userId}`;
                debug.step4_database = {
                    success: true,
                    rowCount: rows.length,
                    user: rows[0] || null,
                };
            } catch (e: any) {
                debug.step4_database = { success: false, error: e.message };
                debug.errors.push("Database query failed: " + e.message);
            }
        } else {
            debug.step4_database = { skipped: "No user ID available" };
        }

        return NextResponse.json(debug, { status: 200 });
    } catch (error: any) {
        debug.errors.push("Top-level error: " + error.message);
        return NextResponse.json(debug, { status: 500 });
    }
}