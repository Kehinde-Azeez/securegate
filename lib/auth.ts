import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { AuthOptions } from "next-auth";
import { prisma } from "./prisma";
import bcryptjs from "bcryptjs";
import { rateLimit } from "./rate-limit";
import { headers } from "next/headers";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        // Rate limiting
        const reqHeaders = headers();
        const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
        const limit = await rateLimit(ip, "signin", 5, 10 * 60 * 1000);
        if (!limit.success) {
          throw new Error("Too many login attempts. Please try again in 10 minutes.");
        }
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) {
          throw new Error("Invalid credentials");
        }
        const valid = await bcryptjs.compare(credentials.password, user.password);
        if (!valid) {
          throw new Error("Invalid credentials");
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.emailVerified = !!user.emailVerified;
      }
      if (trigger === "update" && session) {
        token.emailVerified = !!session.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
