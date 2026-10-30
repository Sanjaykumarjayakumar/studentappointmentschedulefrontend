"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCalendar, FiMapPin, FiPhone } from "react-icons/fi";
import DoctorPhoto from "@/components/DoctorPhoto";
import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { patientApi, toList } from "@/lib/api";

export default function DoctorDetailsPage() {
  const params = useParams();
  const doctorId = params?.doctorId;
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) return;
    let alive = true;
    setLoading(true);
    patientApi
      .doctor(doctorId)
      .then((data) => alive && setDoctor(data?.doctor || null))
      .catch((error) => {
        if (alive) {
          setDoctor(null);
          toast.error(error.message || "Could not load doctor details.");
        }
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [doctorId]);

  if (loading) return <PageLoader label="Loading doctor details..." />;
  if (!doctor) {
    return <EmptyState title="Doctor not found" hint="This doctor may no longer be available." action={<Link href="/patient" className="btn btn-primary">Back to doctors</Link>} />;
  }

  const hospitals = toList(doctor.hospitals);

  return (
    <>
      <Link href="/patient" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900">
        <FiArrowLeft /> All doctors
      </Link>
      <PageHeader title={`Dr. ${doctor.name}`} subtitle={doctor.speciality || "General practitioner"} />

      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <DoctorPhoto name={doctor.name} image={doctor.image} className="h-28 w-28" />
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-ink">Doctor information</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-600">Name</dt>
                <dd className="mt-1 text-sm text-ink">Dr. {doctor.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-600">Email</dt>
                <dd className="mt-1 break-all text-sm text-ink"><a href={`mailto:${doctor.email}`} className="hover:text-brand-700">{doctor.email}</a></dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-600">Speciality</dt>
                <dd className="mt-1 text-sm text-ink">{doctor.speciality || "General"}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-600"><FiPhone /> Phone</dt>
                <dd className="mt-1 text-sm text-ink">{doctor.phone || "Not provided"}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 border-t border-brand-100 pt-6">
          <h2 className="flex items-center gap-2 font-bold text-ink"><FiMapPin className="text-brand-600" /> Hospital affiliations</h2>
          {hospitals.length === 0 ? (
            <p className="mt-3 text-sm text-brand-800/70">No hospital information available.</p>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {hospitals.map((hospital) => (
                <li key={hospital._id} className="rounded-xl bg-brand-50 p-4">
                  <p className="font-semibold text-ink">{hospital.name}</p>
                  <p className="mt-1 text-sm text-brand-800/70">{hospital.address || "Address not provided"}</p>
                  {hospital.phone && <p className="mt-1 text-sm text-brand-800/70">{hospital.phone}</p>}
                  {hospital.email && <a className="mt-1 block break-all text-sm text-brand-700 hover:underline" href={`mailto:${hospital.email}`}>{hospital.email}</a>}
                  {hospital.website && <a className="mt-1 block break-all text-sm text-brand-700 hover:underline" href={/^https?:\/\//i.test(hospital.website) ? hospital.website : `https://${hospital.website}`} target="_blank" rel="noreferrer">{hospital.website}</a>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 flex justify-end border-t border-brand-100 pt-6">
          <Link href={`/patient/doctors/${doctor._id}/book`} className="btn btn-primary"><FiCalendar /> Book appointment</Link>
        </div>
      </section>
    </>
  );
}
