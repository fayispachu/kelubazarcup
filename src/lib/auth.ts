import bcrypt from "bcryptjs";
import type { Session } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";

import { connectDb } from "@/lib/db";
import { Admin } from "@/models/Admin";

async function bootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return null;

  const existingAdminCount = await Admin.countDocuments();
  if (existingAdminCount > 0) return null;

  const passwordHash = await bcrypt.hash(password, 12);
  return Admin.create({
    email,
    passwordHash,
    name: "Kelubazar Cup Admin",
  });
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) return null;

        await connectDb();
        await bootstrapAdmin();

        const admin = await Admin.findOne({ email });
        if (!admin) return null;

        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) return null;

        return {
          id: String(admin._id),
          email: admin.email,
          name: admin.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
};

export async function getAdminSession() {
  return getServerSession(authOptions) as Promise<Session | null>;
}
