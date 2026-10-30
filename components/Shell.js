"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { ROLE_HOME, useAuth } from "@/lib/auth";
import Logo from "./Logo";
import { Avatar, Spinner } from "./ui";

export default function Shell({ role, links, children }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role !== role) router.replace(ROLE_HOME[user.role] || "/login");
  }, [ready, user, role, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (!ready || !user || user.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isActive = (href) => (href === ROLE_HOME[role] ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav className="mt-8 flex flex-col gap-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
            isActive(href) ? "bg-white text-brand-800" : "text-brand-100 hover:bg-white/10"
          }`}
        >
          <Icon size={18} /> {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-brand-50/60">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-brand-900 p-5 lg:flex">
        <Logo light />
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="relative z-10 flex h-full w-64 flex-col bg-brand-900 p-5">
            <div className="flex items-center justify-between">
              <Logo light />
              <button onClick={() => setOpen(false)} className="text-white" aria-label="Close menu">
                <FiX size={22} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-100 bg-white px-4 py-3 sm:px-8">
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-brand-700 hover:bg-brand-50 lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu size={22} />
          </button>
          <p className="hidden text-sm font-semibold text-brand-700 lg:block">
            BIT Student Health Center
          </p>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink">{user.name || user.email}</p>
              <p className="text-xs capitalize text-brand-600">{user.role}</p>
            </div>
            <Avatar name={user.name || user.email} />
            <button onClick={logout} className="btn btn-outline btn-sm" title="Sign out">
              <FiLogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
