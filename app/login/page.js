"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import Logo from "@/components/Logo";
import { Spinner } from "@/components/ui";
import { authApi } from "@/lib/api";
import { ROLE_HOME, useAuth } from "@/lib/auth";
import { signInWithGoogle } from "@/lib/firebase";
import { isEmail } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { user, ready, startSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace(ROLE_HOME[user.role] || "/");
  }, [ready, user, router]);

  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) return toast.error("Enter a valid email address.");
    if (!password) return toast.error("Enter your password.");

    setBusy(true);
    try {
      const body = { email: email.trim().toLowerCase(), password };
      const data = await authApi.signIn(body);
      const loggedIn = startSession(data, "patient");
      toast.success(`Welcome back${loggedIn.name ? `, ${loggedIn.name}` : ""}!`);
      router.replace(ROLE_HOME[loggedIn.role] || "/");
    } catch (err) {
      toast.error(err.message || "Sign in failed.");
    } finally {
      setBusy(false);
    }
  };

  const submitGoogle = async () => {
    setGoogleBusy(true);
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      const data = await authApi.firebaseSignIn(idToken);
      const loggedIn = startSession(data, "patient");
      toast.success(`Welcome${loggedIn.name ? `, ${loggedIn.name}` : ""}!`);
      router.replace(ROLE_HOME[loggedIn.role] || "/");
    } catch (err) {
      toast.error(err.message || "Google sign in failed.");
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100/70">
      <header className="mx-auto flex w-full max-w-7xl items-center px-5 py-3 sm:px-8">
        <Logo />
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-5 pb-6 pt-2 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(400px,0.95fr)] lg:items-center lg:gap-10 lg:pb-8">
        <section className="relative hidden min-h-[430px] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-700 p-8 text-white shadow-xl md:flex md:flex-col md:justify-between xl:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-[36px] border-white/5" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-white/5" aria-hidden="true" />
          <div className="relative">
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight xl:text-5xl">
              Your health center, all in one place.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-brand-100">
              Book appointments, keep track of your visits, and access the care you need on campus.
            </p>
          </div>
          <div className="relative rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm font-bold">A smoother way to get care</p>
            <p className="mt-1 text-sm leading-6 text-brand-100">
              Sign in to manage appointments and connect with the BIT Student Health Center.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-xl shadow-brand-900/5 sm:p-7">
            <div className="mb-5 md:hidden">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-600">BIT Student Health Center</p>
            </div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-brand-600">Your care starts here</p>
              <h2 className="mt-1.5 text-3xl font-extrabold tracking-tight text-ink">Welcome back</h2>
              <p className="mt-1.5 text-sm leading-5 text-brand-800/70">
                Sign in to continue to your health center account.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-3.5 top-3.5 text-brand-400" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    required
                    className="input pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={busy || googleBusy}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="label">Password</label>
                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-3.5 top-3.5 text-brand-400" aria-hidden="true" />
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="input pl-10 pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={busy || googleBusy}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((current) => !current)}
                    className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-brand-500 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    aria-label={show ? "Hide password" : "Show password"}
                    aria-pressed={show}
                    disabled={busy || googleBusy}
                  >
                    {show ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={busy || googleBusy} className="btn btn-primary w-full py-3">
                {busy ? <><Spinner size="sm" /> Signing in...</> : <>Sign in <FiArrowRight aria-hidden="true" /></>}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-[0.16em] text-brand-500">
                <span className="bg-white px-3">or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={submitGoogle}
              disabled={busy || googleBusy}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {googleBusy ? <Spinner size="sm" /> : <span className="text-lg font-extrabold text-[#4285f4]" aria-hidden="true">G</span>}
              {googleBusy ? "Connecting to Google..." : "Continue with Google"}
            </button>

            <p className="mt-5 border-t border-brand-100 pt-4 text-center text-sm text-brand-800/70">
              New to the health center?{" "}
              <Link href="/register" className="font-bold text-brand-600 hover:text-brand-800 hover:underline">
                Create a patient account
              </Link>
            </p>
          </div>
          <p className="mt-3 text-center text-xs text-brand-800/50">
            BIT Student Health Center · Secure account access
          </p>
        </section>
      </main>
    </div>
  );
}
