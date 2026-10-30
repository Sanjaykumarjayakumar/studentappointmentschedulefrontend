"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Field, Spinner } from "@/components/ui";
import { isEmail } from "@/lib/utils";

// Generic create-account form. `fields` = [{ key, label, type?, required?, hint? }]
export default function AccountForm({ fields, submitLabel, onSubmit, onDone }) {
  const blank = Object.fromEntries(fields.map((f) => [f.key, ""]));
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    for (const f of fields) {
      const v = String(form[f.key] || "").trim();
      if (f.required && !v) return toast.error(`${f.label} is required.`);
      if (f.type === "email" && v && !isEmail(v)) return toast.error(`Enter a valid ${f.label.toLowerCase()}.`);
      if (f.type === "password" && v && v.length < 6) return toast.error("Password must be at least 6 characters.");
    }
    setBusy(true);
    try {
      const body = {};
      fields.forEach((f) => {
        const v = String(form[f.key] || "").trim();
        if (v) body[f.key] = f.type === "email" ? v.toLowerCase() : v;
      });
      const res = await onSubmit(body);
      toast.success(`${submitLabel.replace(/^Add |^Register /, "")} saved.`);
      onDone?.(body, res);
      setForm(blank);
    } catch (err) {
      toast.error(err.message || "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      {fields.map((f) => (
        <div key={f.key} className={f.wide ? "sm:col-span-2" : ""}>
          <Field label={f.label + (f.required ? "" : " (optional)")} hint={f.hint}>
            <input
              type={f.type || "text"}
              className="input"
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              autoComplete="off"
            />
          </Field>
        </div>
      ))}
      <div className="sm:col-span-2">
        <button className="btn btn-primary" disabled={busy}>
          {busy && <Spinner size="sm" />} {busy ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
