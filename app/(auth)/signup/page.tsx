"use client";

import React, { useState, FormEvent, useMemo, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function isValidEmail(email: string) {
  return email.includes("@") && email.includes(".") && email.length > 5;
}

export default function SignupPage() {
  const supabase = useMemo(() => createClient(), []);
  const isSubmitting = useRef(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting.current) return;
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    isSubmitting.current = true;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim() } },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Check your email</h1>
          <p className="text-muted text-sm">
            We sent a confirmation link to your email address.
            Click the link to activate your account.
          </p>
          <Link href="/login" className="inline-block mt-6 text-sm text-accent font-medium hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-semibold text-foreground">PayNudge</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
          <p className="text-muted text-sm mt-1">Start getting paid on time</p>
        </div>

        <form onSubmit={handleSignup} className="card p-8">
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-danger">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
            <input type="text" placeholder="Alex Johnson" className="input-base"
              autoComplete="name" disabled={loading}
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input type="email" placeholder="you@example.com" className="input-base"
              autoComplete="email" disabled={loading}
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input type="password" placeholder="Create a strong password" className="input-base"
              autoComplete="new-password" disabled={loading}
              value={password} onChange={(e) => setPassword(e.target.value)} />
            {password && (
              <div className="mt-2 text-xs space-y-1">
                <p className={password.length >= 8 ? "text-success" : "text-muted"}>✓ At least 8 characters</p>
                <p className={/[A-Z]/.test(password) ? "text-success" : "text-muted"}>✓ One uppercase letter</p>
                <p className={/[0-9]/.test(password) ? "text-success" : "text-muted"}>✓ One number</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
            <input type="password" placeholder="Repeat your password" className="input-base"
              autoComplete="new-password" disabled={loading}
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Creating account..." : "Create free account"}
          </button>

          <p className="text-xs text-muted text-center mt-4">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="hover:underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>.
          </p>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </p>

      </div>
    </div>
  );
  }
