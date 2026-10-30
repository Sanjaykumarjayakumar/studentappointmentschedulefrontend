"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Logo from "@/components/Logo";
import { Field, Spinner } from "@/components/ui";
import { authApi } from "@/lib/api";
import { ROLE_HOME, useAuth } from "@/lib/auth";
import { isEmail } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { startSession } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("Enter your full name.");
    if (!isEmail(form.email)) return toast.error("Enter a valid email address.");
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone)) return toast.error("Enter a valid phone number.");
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return toast.error("Passwords do not match.");

    setBusy(true);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: "patient",
      };
      const data = await authApi.signUp(body);
      if (data?.token) {
        startSession(data, "patient");
        toast.success("Account created. Welcome!");
        router.replace(ROLE_HOME.patient);
      } else {
        toast.success("Account created. Please sign in.");
        router.replace("/login");
      }
    } catch (err) {
      toast.error(err.message || "Could not create your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100/70 px-4 py-5 sm:px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-brand-100 bg-white p-5 shadow-xl shadow-brand-900/5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-100 pb-5">
          <div>
            <p className="text-sm font-semibold text-brand-600">Get started</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">Create your account</h1>
            <p className="mt-1 text-sm text-brand-800/70">Register as a patient to book campus appointments.</p>
          </div>
          <Logo compact />
        </div>

        <form onSubmit={submit} className="mt-5 grid gap-x-5 gap-y-3.5 sm:grid-cols-2" noValidate>
          <Field label="Full name">
            <input className="input" value={form.name} onChange={set("name")} placeholder="Your full name" autoComplete="name" />
          </Field>
          <Field label="Email address">
            <input type="email" className="input" value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
          </Field>
          <Field label="Phone (optional)">
            <input className="input" value={form.phone} onChange={set("phone")} placeholder="Mobile number" autoComplete="tel" />
          </Field>
          <Field label="Password" hint="At least 6 characters">
            <input type="password" className="input" value={form.password} onChange={set("password")} autoComplete="new-password" />
          </Field>
          <Field label="Confirm password">
            <input type="password" className="input" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
          </Field>
          <div className="flex items-end sm:justify-end">
            <button type="submit" disabled={busy} className="btn btn-primary w-full py-3 sm:w-auto sm:min-w-48">
              {busy && <Spinner size="sm" />} {busy ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        <p className="mt-5 border-t border-brand-100 pt-4 text-center text-sm text-brand-800/70">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
