"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { resendVerificationAction } from "../actions/resend-verification";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Resend state
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    // Look for error codes or redirects in searchParams
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setError("Invalid email or password.");
    } else if (errorParam) {
      setError(errorParam);
    }

    const verifiedParam = searchParams.get("verified");
    if (verifiedParam === "true") {
      setSuccess("Email verified successfully! You can now log in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowResend(false);
    setIsLoading(true);

    try {
      // 1. Trigger NextAuth Sign In
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Show rate limiting message or generic credentials failure
        if (result.error.includes("attempts")) {
          setError(result.error);
        } else {
          setError("Invalid credentials. Please try again.");
        }
      } else {
        // 2. Query session to check if user is verified
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        
        if (session?.user && !session.user.emailVerified) {
          setError("Your email address is not verified yet.");
          setResendEmail(email);
          setShowResend(true);
          // Sign out immediately to clean session
          await signIn("credentials", { redirect: false, callbackUrl: "/login" });
          await fetch("/api/auth/signout", { method: "POST" });
        } else {
          setSuccess("Login successful! Redirecting...");
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err) {
      console.error(err);
      setError("An internal security error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await resendVerificationAction(resendEmail);
      if (result.success) {
        setSuccess(result.message);
        setShowResend(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to resend verification email.");
    } finally {
      setResendLoading(false);
    }
  };

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
            Sign In
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your credentials to unlock SecureGate
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-8">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in flex flex-col gap-2">
              <span>{error}</span>
              {showResend && (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  type="button"
                  className="text-left text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors mt-1"
                >
                  {resendLoading ? "Sending new link..." : "Resend Verification Email"}
                </button>
              )}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full input-premium text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full input-premium text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-premium py-2.5 px-4 text-sm flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer Redirect */}
        <p className="mt-6 text-center text-sm text-zinc-400">
          {"Don't have an account?"}{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12">
        <div className="animate-spin h-8 w-8 text-violet-500 rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
