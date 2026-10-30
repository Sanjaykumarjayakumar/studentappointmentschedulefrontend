"use client";

import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { FaPills, FaUserMd } from "react-icons/fa";
import AccountForm from "@/components/AccountForm";
import { PageHeader } from "@/components/ui";
import { hospitalApi } from "@/lib/api";

const COMMON = [
  { key: "name", label: "Full name", required: true },
  { key: "email", label: "Email", type: "email", required: true },
  { key: "password", label: "Temporary password", type: "password", required: true, hint: "At least 6 characters" },
  { key: "phone", label: "Phone" },
];

const DOCTOR_FIELDS = [...COMMON, { key: "speciality", label: "Speciality" }, { key: "image", label: "Photo URL", wide: true }];
const PHARMACIST_FIELDS = [...COMMON, { key: "image", label: "Photo URL" }];

export default function HospitalPage() {
  const [tab, setTab] = useState("doctor");
  const [added, setAdded] = useState([]);

  const record = (role) => (body) =>
    setAdded((list) => [{ name: body.name, email: body.email, role }, ...list].slice(0, 8));

  return (
    <>
      <PageHeader title="Add hospital staff" subtitle="Create sign-in accounts for the doctors and pharmacists at your hospital." />

      <div className="mb-5 flex gap-2">
        {[{ id: "doctor", label: "Doctor", icon: FaUserMd }, { id: "pharmacist", label: "Pharmacist", icon: FaPills }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id}
            className={`btn ${tab === id ? "btn-primary" : "btn-outline"}`}><Icon /> {label}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2">
          {tab === "doctor" ? (
            <AccountForm key="doctor" fields={DOCTOR_FIELDS} submitLabel="Add doctor"
              onSubmit={hospitalApi.createDoctor} onDone={record("Doctor")} />
          ) : (
            <AccountForm key="pharmacist" fields={PHARMACIST_FIELDS} submitLabel="Add pharmacist"
              onSubmit={hospitalApi.createPharmacist} onDone={record("Pharmacist")} />
          )}
        </section>

        <section className="panel p-6">
          <h2 className="mb-3 font-bold text-ink">Added this session</h2>
          {added.length === 0 ? (
            <p className="text-sm text-brand-800/70">Accounts you create will be listed here.</p>
          ) : (
            <ul className="space-y-3">
              {added.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <FiCheckCircle className="mt-0.5 shrink-0 text-brand-600" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink">{a.name}</span>
                    <span className="block truncate text-brand-800/70">{a.role} - {a.email}</span>
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
