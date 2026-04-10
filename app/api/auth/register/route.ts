import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email().nullable().or(z.literal("")).optional(),
  password: z.string().min(6),
  role: z.enum(["client", "worker"]),
  fullName: z.string().min(2),
  phone: z.string().min(9),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  district: z.string().optional(),
  skills: z.array(z.string()).optional(),
  faydaDocUrl: z.string().optional(),
  bio: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      console.error("[REGISTER_VALIDATION_ERROR]", parsed.error.flatten());
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, role, fullName, phone } = parsed.data;

    // Check if email already exists (if provided)
    if (email) {
      const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
      if (existing.length > 0) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user
    const newUser = await sql`
       INSERT INTO users (email, password_hash, role, phone)
       VALUES (${email || `phone-${phone}`}, ${passwordHash}, ${role}, ${phone})
       RETURNING id, email, role`;

    const userId = newUser[0].id;

    // Insert role-specific profile
    if (role === "worker") {
      const { dateOfBirth, gender, district, skills, faydaDocUrl, bio } = parsed.data;
      await sql`
        INSERT INTO worker_profiles (user_id, full_name, date_of_birth, gender, district, skills, fayda_doc_url, bio)
        VALUES (
          ${userId}, 
          ${fullName}, 
          ${dateOfBirth ? new Date(dateOfBirth) : null}, 
          ${gender ?? null}, 
          ${district ?? null}, 
          ${skills ?? null}, 
          ${faydaDocUrl ?? null}, 
          ${bio ?? null}
        )`;
    } else {
      await sql`INSERT INTO client_profiles (user_id, full_name) VALUES (${userId}, ${fullName})`;
    }

    return NextResponse.json(
      { message: "Registration successful", userId },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
