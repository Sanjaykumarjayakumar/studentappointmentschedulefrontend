"use client";

import { useEffect } from "react";
import { FiInbox, FiX } from "react-icons/fi";
import { initials } from "@/lib/utils";

export function Spinner({ size = "md" }) {
  const dim = size === "lg" ? "h-10 w-10 border-4" : size === "sm" ? "h-4 w-4 border-2" : "h-6 w-6 border-[3px]";
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-brand-200 border-t-brand-600 ${dim}`}
    />
  );
}

export function PageLoader({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-brand-700">
      <Spinner /> {label}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-brand-800/70">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon = FiInbox, title, hint, action }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-6 py-12 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-brand-600">
        <Icon size={22} />
      </span>
      <p className="font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-brand-800/70">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

const BADGES = {
  booked: "bg-brand-100 text-brand-700",
  available: "bg-brand-100 text-brand-700",
  "in stock": "bg-brand-100 text-brand-700",
  completed: "bg-green-100 text-green-700",
  full: "bg-amber-100 text-amber-700",
  low: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-600",
  "out of stock": "bg-red-100 text-red-600",
};

export function StatusBadge({ status }) {
  const key = String(status || "").toLowerCase();
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        BADGES[key] || "bg-brand-50 text-brand-700"
      }`}
    >
      {status || "-"}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, tone = "blue" }) {
  const tones = {
    blue: "bg-brand-100 text-brand-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-600",
  };
  return (
    <div className="panel flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="text-2xl font-extrabold text-ink">{value}</p>
        <p className="text-sm text-brand-800/70">{label}</p>
      </div>
    </div>
  );
}

export function Avatar({ name, image, size = "md" }) {
  const dim = size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={name} className={`${dim} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`${dim} grid shrink-0 place-items-center rounded-full bg-brand-100 font-bold text-brand-700`}>
      {initials(name)}
    </span>
  );
}

export function Field({ label, hint, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-brand-800/60">{hint}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-brand-950/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-brand-100 px-6 py-4">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-brand-700 hover:bg-brand-50" aria-label="Close">
            <FiX size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-brand-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", busy }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={busy}>
            Keep it
          </button>
          <button
            className="btn bg-red-600 text-white hover:bg-red-700"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <Spinner size="sm" /> : null} {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-brand-800/80">{message}</p>
    </Modal>
  );
}
