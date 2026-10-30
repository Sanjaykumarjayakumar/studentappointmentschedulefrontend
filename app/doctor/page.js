"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiClock, FiPlus, FiXCircle } from "react-icons/fi";
import { ConfirmModal, EmptyState, Field, PageHeader, PageLoader, Spinner, StatusBadge } from "@/components/ui";
import { doctorApi, toList } from "@/lib/api";
import { fmtDate, num, timeRange, todayISO } from "@/lib/utils";

export default function DoctorSlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "", maxAppointments: "" });
  const [now, setNow] = useState(() => new Date());
  const [saving, setSaving] = useState(false);
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = filterDate ? await doctorApi.slotsByDate(filterDate) : await doctorApi.slots();
      setSlots(toList(d, "slots"));
    } catch (e) {
      setSlots([]);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    load();
  }, [load]);

  // Keep today's slots up to date while this page remains open.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const currentDate = todayISO(now);
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const activeSlots = slots.filter((slot) => {
    if (!slot.date || !slot.endTime) return true;
    return slot.date > currentDate || (slot.date === currentDate && slot.endTime > currentTime);
  });

  const grouped = useMemo(() => {
    const map = {};
    activeSlots.forEach((s) => (map[s.date] = [...(map[s.date] || []), s]));
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, list]) => [date, list.sort((x, y) => x.startTime.localeCompare(y.startTime))]);
  }, [activeSlots]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    if (!form.date) return toast.error("Choose a date.");
    if (form.date < currentDate) return toast.error("You cannot create a slot in the past.");
    if (!form.startTime) return toast.error("Choose a start time.");
    if (!form.endTime) return toast.error("Choose an end time.");
    if (form.date === currentDate && form.startTime <= currentTime) return toast.error("Start time must be later than the current time.");
    if (form.date === currentDate && form.endTime <= currentTime) return toast.error("End time must be later than the current time.");
    if (form.endTime <= form.startTime) return toast.error("End time must be after the start time.");
    const max = Number(form.maxAppointments);
    if (!Number.isInteger(max) || max < 1) return toast.error("Maximum patients must be at least 1.");

    setSaving(true);
    try {
      await doctorApi.createSlot({
        dates: [form.date],
        startTime: form.startTime,
        endTime: form.endTime,
        maxAppointments: max,
      });
      toast.success("Slot created.");
      setForm({ date: "", startTime: "", endTime: "", maxAppointments: "" });
      load();
    } catch (err) {
      toast.error(err.message || "Could not create the slot.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      await doctorApi.cancelSlot(toCancel._id);
      toast.success("Slot cancelled.");
      setToCancel(null);
      load();
    } catch (err) {
      toast.error(err.message || "Could not cancel the slot.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <PageHeader title="My slots" subtitle="Create time slots for patients to book and cancel them when you are unavailable." />

      <form onSubmit={create} className="panel mb-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5" noValidate>
        <Field label="Date">
          <input type="date" className="input" min={currentDate} value={form.date} onChange={set("date")} />
        </Field>
        <Field label="Start time">
          <input type="time" className="input" value={form.startTime} onChange={set("startTime")} />
        </Field>
        <Field label="End time">
          <input type="time" className="input" value={form.endTime} onChange={set("endTime")} />
        </Field>
        <Field label="Max patients">
          <input type="number" min={1} className="input" value={form.maxAppointments} onChange={set("maxAppointments")} />
        </Field>
        <div className="flex items-end">
          <button className="btn btn-primary w-full" disabled={saving}>
            {saving ? <Spinner size="sm" /> : <FiPlus />} Create slot
          </button>
        </div>
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Scheduled slots</h2>
        <div className="flex items-center gap-2">
          <input type="date" className="input !w-auto" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
            aria-label="Filter by date" />
          {filterDate && (
            <button className="btn btn-outline btn-sm" onClick={() => setFilterDate("")}>Show all</button>
          )}
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : grouped.length === 0 ? (
        <EmptyState icon={FiClock} title="No slots yet" hint="Use the form above to add your first slot." />
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, list]) => (
            <section key={date}>
              <h3 className="mb-2 text-sm font-bold text-brand-700">{fmtDate(date)}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => {
                  const pct = Math.min(100, (num(s.bookedAppointments) / Math.max(num(s.maxAppointments, 1), 1)) * 100);
                  return (
                    <div key={s._id} className="panel p-4">
                      <div className="flex items-start justify-between">
                        <p className="flex items-center gap-2 font-bold text-ink">
                          <FiClock className="text-brand-600" /> {timeRange(s.startTime, s.endTime)}
                        </p>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-xs text-brand-800/70">
                          <span>Booked</span>
                          <span>{num(s.bookedAppointments)} / {s.maxAppointments}</span>
                        </div>
                        <div className="h-2 rounded-full bg-brand-100">
                          <div className="h-2 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {s.status !== "cancelled" && (
                        <button className="btn btn-danger btn-sm mt-4" onClick={() => setToCancel(s)}>
                          <FiXCircle /> Cancel slot
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!toCancel}
        onClose={() => setToCancel(null)}
        onConfirm={cancel}
        busy={cancelling}
        title="Cancel this slot?"
        confirmLabel="Cancel slot"
        message={toCancel ? `${fmtDate(toCancel.date)}, ${timeRange(toCancel.startTime, toCancel.endTime)}. Patients will no longer be able to book it.` : ""}
      />
    </>
  );
}
