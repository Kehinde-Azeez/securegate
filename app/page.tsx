import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // If already authenticated and verified, redirect directly to dashboard
  if (session?.user && session.user.emailVerified) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Interactive premium ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(217,70,239,0.1),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-3xl animate-slide-up text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-6 mx-auto animate-pulse">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-none">
            Welcome to <span className="text-gradient">SecureGate</span>
          </h1>
          <p className="max-w-xl mx-auto text-base md:text-lg text-zinc-400 leading-relaxed">
            A focused authentication and endpoint hardening platform built to satisfy the highest standards of modern software security and user privacy.
          </p>
        </div>

        {/* Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="glass-panel p-6 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">12-Round Hashing</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Passwords are robustly salted and hashed using bcryptjs with a slow hashing factor of 12.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-3">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Double Email Guard</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Registration and password resets generate secure, short-lived verification tokens via Resend.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">Brute-Force Guard</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Login and forgot-password operations are rate-limited on the IP level to block credentials cracking.
            </p>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-[160px] btn-premium py-3 px-6 text-sm font-medium text-center"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-[160px] py-3 px-6 text-sm font-medium text-center text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800/80 transition-all"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
