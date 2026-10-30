"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiCalendar, FiClock } from "react-icons/fi";
import { EmptyState, PageHeader, PageLoader, StatusBadge } from "@/components/ui";
import { patientApi, toList } from "@/lib/api";
import { fmtDate, fmtTime, nameOf } from "@/lib/utils";

const FILTERS = ["all", "booked", "completed", "cancelled"];

export default function MyAppointmentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    patientApi
      .appointments()
      .then((d) => setItems(toList(d, "appointments")))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(
    () =>
      [...items]
        .filter((a) => filter === "all" || a.status === filter)
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    [items, filter]
  );

  const count = (f) => (f === "all" ? items.length : items.filter((a) => a.status === f).length);

  return (
    <>
      <PageHeader
        title="My appointments"
        subtitle="Your token number is what you show at reception."
        action={<Link href="/patient" className="btn btn-primary">Book new</Link>}
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
              filter === f ? "bg-brand-600 text-white" : "bg-white text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
            }`}>
            {f} ({count(f)})
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : sorted.length === 0 ? (
        <EmptyState icon={FiCalendar} title="No appointments here"
          hint="Book a slot with a campus doctor to see it listed."
          action={<Link href="/patient" className="btn btn-primary">Book an appointment</Link>} />
      ) : (
        <ul className="space-y-3">
          {sorted.map((a) => (
            <li key={a._id} className="panel flex flex-wrap items-center gap-4 p-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
                <div className="text-center leading-none">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-100">Token</p>
                  <p className="mt-1 text-2xl font-extrabold">{a.tokenNumber}</p>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">Dr. {nameOf(a.doctor, "Doctor")}</p>
                <p className="text-sm text-brand-800/70">
                  {a.doctor?.speciality || "Appointment"}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brand-800/80">
                  <span className="flex items-center gap-1.5"><FiCalendar /> {fmtDate(a.date)}</span>
                  <span className="flex items-center gap-1.5"><FiClock /> {fmtTime(a.time)}</span>
                </p>
              </div>
              <StatusBadge status={a.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
