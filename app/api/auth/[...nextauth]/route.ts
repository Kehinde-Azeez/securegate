import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../lib/prisma";
import bcryptjs from "bcryptjs";
import { rateLimit } from "../../../lib/rate-limit";
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

        // Apply rate-limiting (Phase 5 constraint): max 5 attempts per IP per 10 minutes
        const reqHeaders = headers();
        const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
        
        const rateLimitResult = await rateLimit(ip, "signin", 5, 10 * 60 * 1000);
        if (!rateLimitResult.success) {
          throw new Error("Too many login attempts. Please try again in 10 minutes.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          // Principle of Least Surprise: show generic "Invalid credentials" error rather than "User not found"
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Return user object including verified status, omit password
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
        session.user.id = token.id;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
