"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiCalendar, FiPlus } from "react-icons/fi";
import { EmptyState, Field, Modal, PageHeader, PageLoader, Spinner, StatusBadge } from "@/components/ui";
import { doctorApi, toList } from "@/lib/api";
import { fmtDate, fmtTime, nameOf, num, timeRange, todayISO } from "@/lib/utils";

export default function DoctorAppointmentsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  const [open, setOpen] = useState(false);
  const [bookDate, setBookDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotId, setSlotId] = useState("");
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(toList(await doctorApi.appointments(), "appointments"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoadingSlots(true);
    setSlotId("");
    doctorApi
      .slotsByDate(bookDate)
      .then((d) => alive && setSlots(toList(d, "slots")))
      .catch((e) => {
        if (alive) {
          setSlots([]);
          toast.error(e.message);
        }
      })
      .finally(() => alive && setLoadingSlots(false));
    return () => {
      alive = false;
    };
  }, [open, bookDate]);

  useEffect(() => {
    const query = patientQuery.trim();
    if (!open || query.length < 2) {
      setPatients([]);
      setSearchingPatients(false);
      return;
    }

    let alive = true;
    setSearchingPatients(true);
    const timer = window.setTimeout(() => {
      doctorApi
        .searchPatients(query)
        .then((data) => alive && setPatients(toList(data, "patients")))
        .catch((error) => {
          if (alive) {
            setPatients([]);
            toast.error(error.message || "Could not search patients.");
          }
        })
        .finally(() => alive && setSearchingPatients(false));
    }, 250);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [open, patientQuery]);

  const visible = useMemo(
    () =>
      items
        .filter((a) => !date || a.date === date)
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`) || a.tokenNumber - b.tokenNumber),
    [items, date]
  );

  const bookable = slots.filter((s) => s.status === "available" && num(s.bookedAppointments) < num(s.maxAppointments));

  const submit = async () => {
    if (!selectedPatient) return toast.error("Search for and select a patient.");
    if (!slotId) return toast.error("Select a slot.");
    setSaving(true);
    try {
      const res = await doctorApi.bookForPatient({ slotId, date: bookDate, patientId: selectedPatient });
      const token = res?.appointment?.tokenNumber ?? res?.tokenNumber;
      toast.success(token ? `Appointment created. Token number ${token}.` : "Appointment created.");
      setOpen(false);
      setPatientQuery("");
      setPatients([]);
      setSelectedPatient("");
      load();
    } catch (e) {
      toast.error(e.message || "Could not create the appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Everyone booked with you. Add walk-in patients to an open slot."
        action={
          <button className="btn btn-primary" onClick={() => setOpen(true)}>
            <FiPlus /> Book for patient
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <input type="date" className="input !w-auto" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by date" />
        {date && <button className="btn btn-outline btn-sm" onClick={() => setDate("")}>Show all</button>}
      </div>

      {loading ? (
        <PageLoader />
      ) : visible.length === 0 ? (
        <EmptyState icon={FiCalendar} title="No appointments found" hint="Booked patients will appear here." />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-brand-100 bg-brand-50">
              <tr>
                <th className="th">Token</th>
                <th className="th">Patient</th>
                <th className="th">Date</th>
                <th className="th">Time</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {visible.map((a) => (
                <tr key={a._id}>
                  <td className="td font-extrabold text-brand-600">#{a.tokenNumber}</td>
                  <td className="td">
                    <p className="font-semibold text-ink">{nameOf(a.patient, "Patient")}</p>
                    {a.patient?.email && <p className="text-xs text-brand-800/60">{a.patient.email}</p>}
                  </td>
                  <td className="td">{fmtDate(a.date)}</td>
                  <td className="td">{fmtTime(a.time)}</td>
                  <td className="td"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Book for a patient"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setOpen(false)} disabled={saving}>Close</button>
            <button className="btn btn-primary" onClick={submit} disabled={saving}>
              {saving && <Spinner size="sm" />} Create appointment
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Search patient" hint="Search by name or email, then choose a match from the suggestions.">
            <input
              className="input"
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                setPatients([]);
                setSelectedPatient("");
              }}
              placeholder="Enter a name or email"
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={!selectedPatient && patients.length > 0}
            />
            {searchingPatients && <p className="mt-2 text-sm text-brand-800/70">Searching patients...</p>}
            {!searchingPatients && patientQuery.trim().length >= 2 && patients.length === 0 && (
              <p className="mt-2 text-sm text-brand-800/70">No matching patients found.</p>
            )}
            {!selectedPatient && patients.length > 0 && (
              <ul role="listbox" aria-label="Matching patients" className="mt-1 max-h-52 overflow-y-auto rounded-lg border border-brand-200 bg-white shadow-lg">
                {patients.map((item) => (
                  <li key={item._id} role="option" aria-selected="false">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-brand-50 focus:bg-brand-50 focus:outline-none"
                      onClick={() => {
                        setSelectedPatient(item._id);
                        setPatientQuery(`${item.name} (${item.email})`);
                        setPatients([]);
                      }}
                    >
                      <span className="block text-sm font-semibold text-ink">{item.name}</span>
                      <span className="block text-xs text-brand-800/70">{item.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Field>
          <Field label="Date">
            <input type="date" className="input" min={todayISO()} value={bookDate} onChange={(e) => setBookDate(e.target.value)} />
          </Field>
          <Field label="Slot">
            {loadingSlots ? (
              <PageLoader label="Loading slots..." />
            ) : bookable.length === 0 ? (
              <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-800/80">No open slots on this date. Create one under My slots.</p>
            ) : (
              <select className="input" value={slotId} onChange={(e) => setSlotId(e.target.value)}>
                <option value="">Select a slot</option>
                {bookable.map((s) => (
                  <option key={s._id} value={s._id}>
                    {timeRange(s.startTime, s.endTime)} ({num(s.maxAppointments) - num(s.bookedAppointments)} left)
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </Modal>
    </>
  );
}
