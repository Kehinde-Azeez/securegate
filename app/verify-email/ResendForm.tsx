"use client";

import React, { useState } from "react";
import { resendVerificationAction } from "../actions/resend-verification";

export default function ResendForm({ initialEmail }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(
    null
  );

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setStatus(null);

    try {
      const result = await resendVerificationAction(email);
      setStatus(result);
    } catch (err) {
      setStatus({
        success: false,
        message: "Failed to resend verification email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-4 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 animate-fade-in text-left">
      <h4 className="text-sm font-semibold text-zinc-200 mb-2">Resend Verification Link</h4>
      <p className="text-xs text-zinc-400 mb-4 leading-normal">
        Enter your email address below to receive a new, secure verification link (valid for 15 minutes).
      </p>

      {status && (
        <div
          className={`mb-4 p-3 rounded text-xs border ${
            status.success
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleResend} className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="flex-1 input-premium text-xs py-1.5"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-premium text-xs px-4 py-1.5 flex items-center justify-center min-w-[90px]"
        >
          {loading ? (
            <svg
              className="animate-spin h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            "Send Link"
          )}
        </button>
      </form>
    </div>
  );
}
