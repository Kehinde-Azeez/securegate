import React from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // airtight redirect logic (Phase 2 & 3 verification protection)
  if (!session || !session.user) {
    redirect("/login");
  }

  // Fallback check just in case middleware is bypassed
  if (!session.user.emailVerified) {
    redirect("/login?error=Your email is not verified yet.");
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Premium Background Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(217,70,239,0.05),transparent_50%)] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              SecureGate
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="text-zinc-200 font-semibold">{session.user.name}</span>
              <span className="text-zinc-500">{session.user.email}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="animate-slide-up space-y-8">
          {/* Welcome Area */}
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Welcome Back, <span className="text-gradient">{session.user.name}</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Your credentials have been securely verified and your active session is established.
            </p>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Session Card */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Identity Session</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-normal">
                Your NextAuth token-based JWT session is currently alive and securely validated.
              </p>
              <div className="border-t border-zinc-900 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Method</span>
                  <span className="text-zinc-300 font-medium">NextAuth Credentials</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Token Strategy</span>
                  <span className="text-zinc-300 font-medium">Stateless JWT</span>
                </div>
              </div>
            </div>

            {/* Security Status Card */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Account Security</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Secure
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-normal">
                Your account database status has passed all strict verification checks.
              </p>
              <div className="border-t border-zinc-900 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Email Verified</span>
                  <span className="text-emerald-400 font-semibold">Yes (Verified)</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Hashing Rounds</span>
                  <span className="text-zinc-300 font-medium">12 Salt Rounds (bcrypt)</span>
                </div>
              </div>
            </div>

            {/* API Status Card */}
            <div className="glass-panel p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Rate Hardening</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Active
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-normal">
                All auth operations are guarded under active IP-based sliding-window rate-limiting.
              </p>
              <div className="border-t border-zinc-900 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Brute Force Limit</span>
                  <span className="text-zinc-300 font-medium">5 attempts / 10 min</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Endpoint Guard</span>
                  <span className="text-zinc-300 font-medium">Signin & Resets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Session Display Info */}
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold text-white mb-4">Cryptographic User Token</h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Below is the raw token payload decrypted securely from your NextAuth cookies on the server:
            </p>
            <div className="bg-black/60 border border-zinc-800 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-violet-400 font-mono">
                {JSON.stringify(
                  {
                    user: {
                      id: session.user.id,
                      name: session.user.name,
                      email: session.user.email,
                      emailVerified: session.user.emailVerified,
                    },
                    expires: session.expires,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
