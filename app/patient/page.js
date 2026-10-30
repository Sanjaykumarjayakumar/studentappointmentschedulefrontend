"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowRight, FiCalendar, FiFileText, FiSearch, FiUsers } from "react-icons/fi";
import DoctorPhoto from "@/components/DoctorPhoto";
import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { patientApi, toList } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    patientApi
      .doctors()
      .then((data) => alive && setDoctors(toList(data, "doctors")))
      .catch((error) => alive && toast.error(error.message || "Could not load doctors."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const filteredDoctors = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return doctors;
    return doctors.filter((doctor) =>
      `${doctor.name || ""} ${doctor.email || ""} ${doctor.speciality || ""}`.toLowerCase().includes(term)
    );
  }, [doctors, query]);

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[32px] border-white/5" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 right-36 h-56 w-56 rounded-full bg-white/5" aria-hidden="true" />
        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1fr)_15rem] md:items-center">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-brand-100">
              <FiUsers aria-hidden="true" /> STUDENT HEALTH CENTER
            </p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-brand-100 sm:text-base">
              Find a campus doctor and book an appointment that fits your day.
            </p>
            <a href="#available-doctors" className="btn mt-6 bg-white text-brand-800 shadow-sm hover:bg-brand-50">
              Find a doctor <FiArrowRight aria-hidden="true" />
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <Link href="/patient/appointments" className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-4 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15 text-white">
                <FiCalendar size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">My appointments</span>
                <span className="mt-0.5 block text-xs text-brand-100">View bookings and tokens</span>
              </span>
              <FiArrowRight className="shrink-0 text-brand-100 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link href="/patient/bills" className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 p-4 transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15 text-white">
                <FiFileText size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">Your bills</span>
                <span className="mt-0.5 block text-xs text-brand-100">Review pharmacy bills</span>
              </span>
              <FiArrowRight className="shrink-0 text-brand-100 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="available-doctors" className="scroll-mt-24">
        <PageHeader
          title="Find your doctor"
          subtitle="Browse campus doctors and choose the right care for you."
        />

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-brand-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <FiSearch className="absolute left-3.5 top-3.5 text-brand-400" aria-hidden="true" />
            <input
              className="input border-transparent bg-brand-50/70 pl-10 focus:border-brand-500"
              placeholder="Search by doctor, email, or speciality"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search doctors by name, email, or speciality"
            />
          </div>
          {!loading && (
            <p className="px-2 text-sm text-brand-800/60" aria-live="polite">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? "doctor" : "doctors"}
            </p>
          )}
        </div>

        {loading ? (
          <PageLoader label="Loading doctors..." />
        ) : filteredDoctors.length === 0 ? (
          <EmptyState
            icon={FiUsers}
            title={doctors.length ? "No doctors match your search" : "No doctors available"}
            hint={doctors.length ? "Try a different name or speciality." : "Please check back later."}
            action={query && <button className="btn btn-outline" onClick={() => setQuery("")}>Clear search</button>}
          />
        ) : (
          <ul className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <li key={doctor._id}>
                <Link
                  href={`/patient/doctors/${doctor._id}`}
                  className="group flex h-full flex-col rounded-2xl border border-brand-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <div className="flex items-center gap-4">
                    <DoctorPhoto name={doctor.name} image={doctor.image} className="h-16 w-16 ring-4 ring-brand-50" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-ink">Dr. {doctor.name}</p>
                      <p className="mt-1 truncate text-sm text-brand-800/60">{doctor.email}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-brand-100 pt-4">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                      {doctor.speciality || "General"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                      View profile
                      <FiArrowRight className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
