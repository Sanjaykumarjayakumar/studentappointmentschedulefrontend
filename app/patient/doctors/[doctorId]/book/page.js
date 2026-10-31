"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiArrowLeft, FiCalendar, FiClock } from "react-icons/fi";
import DoctorPhoto from "@/components/DoctorPhoto";
import { EmptyState, PageHeader, PageLoader, Spinner } from "@/components/ui";
import { patientApi, toList } from "@/lib/api";
import { fmtDate, num, timeRange, todayISO } from "@/lib/utils";

export default function BookDoctorAppointmentPage() {
  const params = useParams();
  const doctorId = params?.doctorId;
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    let alive = true;
    patientApi.doctor(doctorId)
      .then((data) => alive && setDoctor(data?.doctor || null))
      .catch((error) => alive && toast.error(error.message || "Could not load doctor details."))
      .finally(() => alive && setLoadingDoctor(false));
    return () => { alive = false; };
  }, [doctorId]);

  useEffect(() => {
    if (!doctorId || !date) return;
    let alive = true;
    setLoadingSlots(true);
    setSelectedSlot(null);
    patientApi.slots(doctorId, date)
      .then((data) => alive && setSlots(toList(data, "slots")))
      .catch((error) => {
        if (alive) {
          setSlots([]);
          toast.error(error.message || "Could not check availability.");
        }
      })
      .finally(() => alive && setLoadingSlots(false));
    return () => { alive = false; };
  }, [doctorId, date]);

  const canBook = useCallback((slot) =>
    slot.status === "available" && num(slot.bookedAppointments) < num(slot.maxAppointments), []);
  const availableSlots = useMemo(() => slots.filter(canBook), [slots, canBook]);
  const fullSlots = useMemo(() => slots.filter((slot) => !canBook(slot)), [slots, canBook]);

  const book = async () => {
    if (!selectedSlot || !doctor) return;
    setBooking(true);
    try {
      const result = await patientApi.book({ slotId: selectedSlot._id, doctorId: doctor._id, date });
      const token = result?.appointment?.tokenNumber ?? result?.tokenNumber;
      toast.success(token ? `Appointment booked. Your token number is ${token}.` : "Appointment booked.");
      router.push("/patient/appointments");
    } catch (error) {
      toast.error(error.message || "Could not book this slot.");
      setSelectedSlot(null);
      const data = await patientApi.slots(doctorId, date).catch(() => null);
      if (data) setSlots(toList(data, "slots"));
    } finally {
      setBooking(false);
    }
  };

  if (loadingDoctor) return <PageLoader label="Loading doctor..." />;
  if (!doctor) {
    return <EmptyState title="Doctor not found" hint="This doctor may no longer be available." action={<Link href="/patient" className="btn btn-primary">Back to doctors</Link>} />;
  }

  return (
    <>
      <Link href={`/patient/doctors/${doctor._id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900">
        <FiArrowLeft /> Doctor details
      </Link>
      <PageHeader title="Book an appointment" subtitle={`Choose a date and an available time with Dr. ${doctor.name}.`} />

      <section className="panel p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-4 border-b border-brand-100 pb-5">
          <DoctorPhoto name={doctor.name} image={doctor.image} className="h-16 w-16" />
          <div className="min-w-0">
            <p className="font-bold text-ink">Dr. {doctor.name}</p>
            <p className="truncate text-sm text-brand-800/70">{doctor.email}</p>
            <p className="text-xs text-brand-600">{doctor.speciality || "General"}</p>
          </div>
        </div>

        <label className="label" htmlFor="appointment-date">Appointment date</label>
        <input
          id="appointment-date"
          type="date"
          className="input mb-6 max-w-xs"
          min={todayISO()}
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        <h2 className="mb-3 flex items-center gap-2 font-bold text-ink"><FiCalendar className="text-brand-600" /> Availability for {fmtDate(date)}</h2>

        {loadingSlots ? (
          <PageLoader label="Checking availability..." />
        ) : slots.length === 0 ? (
          <EmptyState icon={FiClock} title="Doctor unavailable" hint={`Dr. ${doctor.name} has no scheduled slots on ${fmtDate(date)}. Choose another date.`} />
        ) : (
          <>
            <p className="mb-3 text-sm text-brand-800/70">
              Dr. {doctor.name} is available at the times below. Full times are shown so you can see the doctor's schedule.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const open = canBook(slot);
                const selected = selectedSlot?._id === slot._id;
                return (
                  <li key={slot._id}>
                    <button
                      type="button"
                      disabled={!open}
                      onClick={() => setSelectedSlot(slot)}
                      aria-pressed={selected}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                        selected ? "border-brand-600 bg-brand-600 text-white" : open ? "border-brand-200 hover:bg-brand-50" : "cursor-not-allowed border-brand-100 bg-brand-50 text-brand-500"
                      }`}
                    >
                      <span>
                        <span className="flex items-center gap-2 font-semibold"><FiClock /> {timeRange(slot.startTime, slot.endTime)}</span>
                        <span className={`mt-1 block text-xs ${selected ? "text-brand-100" : "text-brand-800/60"}`}>
                          {open ? "Available" : "Full"}
                        </span>
                      </span>
                      <span className="text-xs font-semibold">{open ? "Select" : "Unavailable"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {availableSlots.length === 0 && fullSlots.length > 0 && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Dr. {doctor.name} is scheduled on this date, but all appointment times are full. Please choose another date.
              </p>
            )}
          </>
        )}

        {selectedSlot && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-brand-50 p-4">
            <p className="text-sm text-brand-800">Selected: <strong className="text-ink">{timeRange(selectedSlot.startTime, selectedSlot.endTime)}</strong></p>
            <button className="btn btn-primary" onClick={book} disabled={booking}>
              {booking && <Spinner size="sm" />} {booking ? "Booking..." : "Book appointment"}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
