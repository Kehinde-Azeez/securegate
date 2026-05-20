"use client";

import React, { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { resetPasswordAction } from "../../actions/reset-password";
import { ActionState } from "../../lib/definitions";

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState<{
    label: string;
    class: string;
    score: number;
  }>({ label: "None", class: "", score: 0 });

  const analyzePassword = (val: string) => {
    setPassword(val);
    if (!val) {
      setStrength({ label: "None", class: "", score: 0 });
      return;
    }

    let score = 0;
    if (val.length >= 8) score += 1;

    const hasLowercase = /[a-z]/.test(val);
    const hasUppercase = /[A-Z]/.test(val);
    const hasDigit = /[0-9]/.test(val);
    const hasSpecial = /[^a-zA-Z0-9]/.test(val);

    const categories = [hasLowercase, hasUppercase, hasDigit, hasSpecial].filter(
      Boolean
    ).length;

    if (categories >= 2) score += 1;
    if (categories === 4 && val.length >= 10) score += 1;

    if (score <= 1) {
      setStrength({ label: "Weak", class: "weak", score: 1 });
    } else if (score === 2) {
      setStrength({ label: "Fair", class: "fair", score: 2 });
    } else {
      setStrength({ label: "Strong", class: "strong", score: 3 });
    }
  };

  const initialState: ActionState = {
    success: false,
    message: "",
  };

  // Bind the token to the server action so we pass it correctly
  const resetPasswordWithToken = resetPasswordAction.bind(null, token);

  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useFormState(
    resetPasswordWithToken,
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
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Establish a strong new password for your account
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                Your password has been successfully reset. You can now log in with your new credentials.
              </p>
              <Link
                href="/login"
                className="inline-flex w-full justify-center btn-premium py-2.5 px-4 text-sm font-medium"
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <form action={(formData) => startTransition(() => formAction(formData))} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300 mb-1.5"
                >
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => analyzePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full input-premium text-sm mb-2"
                />

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1.5 mb-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Strength:</span>
                      <span
                        className={`font-medium ${
                          strength.score === 1
                            ? "text-red-400"
                            : strength.score === 2
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`strength-bar ${strength.class}`} />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Must contain at least 8 characters, with uppercase, lowercase, numbers, and special characters.
                    </p>
                  </div>
                )}

                {state?.errors?.password && (
                  <div className="mt-1.5 text-xs text-red-400 space-y-1">
                    {state.errors.password.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
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
                    Saving new password...
                  </>
                ) : (
                  "Reset Password"
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
