"use client";

import React, { useTransition } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { forgotPasswordAction } from "../actions/forgot-password";
import { ActionState } from "../lib/definitions";

export default function ForgotPasswordPage() {
  const initialState: ActionState = {
    success: false,
    message: "",
  };

  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useFormState(
    forgotPasswordAction,
    initialState
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(217,70,239,0.1),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20 mb-3">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Request a secure password reset link
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-8">
          {state?.message && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm border ${
                state.success
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              } animate-fade-in`}
            >
              {state.message}
            </div>
          )}

          {state?.success ? (
            <div className="text-center py-4 animate-fade-in">
              <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                  />
                </svg>
              </div>
              <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                If the email address exists in our system, we have sent instructions on how to reset your password. Please check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex w-full justify-center btn-premium py-2.5 px-4 text-sm font-medium"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form action={(formData) => startTransition(() => formAction(formData))} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-300 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full input-premium text-sm"
                />
                {state?.errors?.email && (
                  <p className="mt-1.5 text-xs text-red-400">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full btn-premium py-2.5 px-4 text-sm flex items-center justify-center gap-2 mt-6"
              >
                {isPending ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Sending request...
                  </>
                ) : (
                  "Request Password Reset"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer Redirect */}
        <p className="mt-6 text-center text-sm text-zinc-400">
          Back to{" "}
          <Link
            href="/login"
            className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
