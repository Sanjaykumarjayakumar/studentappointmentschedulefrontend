"use client";

import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import AccountForm from "@/components/AccountForm";
import { PageHeader } from "@/components/ui";
import { adminApi } from "@/lib/api";

const FIELDS = [
  { key: "name", label: "Hospital name", required: true, wide: true },
  { key: "address", label: "Address", required: true, wide: true },
  { key: "phone", label: "Phone", required: true },
  { key: "loginEmail", label: "Login email", type: "email", required: true, hint: "The hospital signs in with this email" },
  { key: "password", label: "Login password", type: "password", required: true, hint: "At least 6 characters" },
  { key: "website", label: "Website" },
  { key: "image", label: "Image URL", wide: true },
];

export default function AdminPage() {
  const [added, setAdded] = useState([]);

  return (
    <>
      <PageHeader title="Register a hospital" subtitle="Each hospital gets its own account to add doctors and pharmacists." />
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2">
          <AccountForm fields={FIELDS} submitLabel="Register hospital" onSubmit={adminApi.createHospital}
            onDone={(body) => setAdded((l) => [{ name: body.name, email: body.loginEmail }, ...l].slice(0, 8))} />
        </section>
        <section className="panel p-6">
          <h2 className="mb-3 font-bold text-ink">Registered this session</h2>
          {added.length === 0 ? (
            <p className="text-sm text-brand-800/70">Hospitals you register will be listed here.</p>
          ) : (
            <ul className="space-y-3">
              {added.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-brand-600" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink">{a.name}</span>
                    <span className="block truncate text-brand-800/70">{a.email}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
