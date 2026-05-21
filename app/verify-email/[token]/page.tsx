export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import React from "react";
import Link from "next/link";
import { verifyEmailAction } from "../../actions/verify-email";
import ResendForm from "../ResendForm";

export default async function VerifyEmailPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const result = await verifyEmailAction(token);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(217,70,239,0.1),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up text-center">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-3">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Account Verification
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Confirming your registration with SecureGate
          </p>
        </div>

        {/* Status Card */}
        <div className="glass-panel p-8 flex flex-col items-center">
          {result.success ? (
            <div className="animate-fade-in flex flex-col items-center">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Success!</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                {result.message}
              </p>
              <Link
                href="/login?verified=true"
                className="w-full btn-premium py-2.5 px-4 text-sm inline-block font-medium"
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col items-center w-full">
              <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8"
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
              <h3 className="text-xl font-semibold text-white mb-2">Verification Failed</h3>
              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
                {result.message}
              </p>

              {/* Offer resend verification form */}
              <ResendForm initialEmail={result.email} />

              <Link
                href="/signup"
                className="mt-6 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                Back to Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
