import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({ identifier: z.string().min(3), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const { identifier, password } = parsed.data;

        // Find user by email OR phone
        const rows = await sql`
          SELECT id, email, password_hash, role 
          FROM users 
          WHERE email = ${identifier} OR phone = ${identifier} 
          LIMIT 1`;

        const user = rows[0] as
          | { id: string; email: string; password_hash: string; role: string }
          | undefined;

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) return null;

        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
