"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import { Field, PageHeader, PageLoader, Spinner } from "@/components/ui";
import { pharmacistApi, toList } from "@/lib/api";
import { num } from "@/lib/utils";

const newLine = () => ({ medicineId: "", medicineName: "", quantity: "1" });

export default function CreatePatientBillPage() {
  const [medicines, setMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(true);
  const [patientQuery, setPatientQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [lines, setLines] = useState([newLine()]);
  const [activeMedicineIndex, setActiveMedicineIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    pharmacistApi.medicines()
      .then((data) => alive && setMedicines(toList(data, "medicines")))
      .catch((error) => alive && toast.error(error.message || "Could not load medicine stock."))
      .finally(() => alive && setLoadingMedicines(false));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const query = patientQuery.trim();
    if (query.length < 2 || selectedPatient?.name === query) {
      setPatients([]);
      setSearchingPatients(false);
      return;
    }
    let alive = true;
    setSearchingPatients(true);
    const timer = window.setTimeout(() => {
      pharmacistApi.searchPatients(query)
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
  }, [patientQuery, selectedPatient]);

  const updateLine = (index, values) => setLines((current) => current.map((line, i) => i === index ? { ...line, ...values } : line));
  const selectedMedicines = useMemo(() => new Map(medicines.map((medicine) => [medicine._id, medicine])), [medicines]);
  const billTotal = useMemo(() => {
    let totalCents = 0;
    for (const line of lines) {
      const medicine = selectedMedicines.get(line.medicineId);
      const quantity = Number(line.quantity);
      if (!medicine || !Number.isFinite(medicine.price) || !Number.isInteger(quantity) || quantity < 1) return null;
      totalCents += Math.round(medicine.price * 100) * quantity;
      if (!Number.isSafeInteger(totalCents)) return null;
    }
    return totalCents / 100;
  }, [lines, selectedMedicines]);

  const submit = async (event) => {
    event.preventDefault();
    if (!selectedPatient) return toast.error("Search for and select a patient.");
    if (lines.some((line) => !line.medicineId || !Number.isInteger(Number(line.quantity)) || Number(line.quantity) < 1)) {
      return toast.error("Choose a medicine and enter a whole-number quantity for every row.");
    }
    const requestedQuantities = new Map();
    for (const line of lines) requestedQuantities.set(line.medicineId, (requestedQuantities.get(line.medicineId) || 0) + Number(line.quantity));
    for (const [medicineId, quantity] of requestedQuantities) {
      const medicine = selectedMedicines.get(medicineId);
      if (!medicine) return toast.error("Select a medicine from the suggestions.");
      if (!Number.isFinite(medicine.price)) {
        return toast.error(`Set a price for ${medicine.name} in Medicine stock before creating a bill.`);
      }
      if (quantity > num(medicine.stockQuantity)) {
        return toast.error(`Only ${num(medicine.stockQuantity)} ${medicine.unit || "units"} of ${medicine.name} are in stock.`);
      }
    }

    setSaving(true);
    try {
      await pharmacistApi.createBill({
        patientId: selectedPatient._id,
        items: lines.map((line) => ({ medicineId: line.medicineId, quantity: Number(line.quantity) })),
      });
      toast.success("Patient bill created and stock updated.");
      const refreshedMedicines = await pharmacistApi.medicines().catch(() => null);
      if (refreshedMedicines) setMedicines(toList(refreshedMedicines, "medicines"));
      setPatientQuery("");
      setSelectedPatient(null);
      setPatients([]);
      setLines([newLine()]);
    } catch (error) {
      toast.error(error.message || "Could not create the patient bill.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingMedicines) return <PageLoader label="Loading medicine stock..." />;

  return (
    <>
      <Link href="/pharmacist/medicines" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900">
        <FiArrowLeft /> Medicine stock
      </Link>
      <PageHeader title="Create bill" subtitle="Select a patient and add the medicines to dispense." />

      <form className="panel space-y-6 p-5 sm:p-6" onSubmit={submit}>
        <Field label="Patient">
          <input
            className="input"
            value={patientQuery}
            onChange={(event) => {
              setPatientQuery(event.target.value);
              setSelectedPatient(null);
              setPatients([]);
            }}
            placeholder="Enter patient name or email"
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={patients.length > 0}
          />
          {searchingPatients && <p className="mt-2 text-sm text-brand-800/70">Searching patients...</p>}
          {!searchingPatients && patientQuery.trim().length >= 2 && !selectedPatient && patients.length === 0 && (
            <p className="mt-2 text-sm text-brand-800/70">No matching patients found.</p>
          )}
          {patients.length > 0 && (
            <ul role="listbox" aria-label="Matching patients" className="mt-1 max-h-52 overflow-y-auto rounded-lg border border-brand-200 bg-white shadow-lg">
              {patients.map((patient) => (
                <li key={patient._id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-brand-50 focus:bg-brand-50 focus:outline-none"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setPatientQuery(patient.name);
                      setPatients([]);
                    }}
                  >
                    <span className="block text-sm font-semibold text-ink">{patient.name}</span>
                    <span className="block text-xs text-brand-800/70">{patient.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Field>

        <div>
          <h2 className="mb-3 font-bold text-ink">Medicines</h2>
          <div className="space-y-3">
            {lines.map((line, index) => {
              const medicine = selectedMedicines.get(line.medicineId);
              const medicineOptions = medicines.filter((item) =>
                item.name.toLowerCase().includes(line.medicineName.trim().toLowerCase())
              );
              const medicineListId = `bill-medicine-options-${index}`;
              return (
                <div key={index} className="grid gap-3 rounded-xl border border-brand-100 p-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-end">
                  <Field label={`Medicine ${index + 1}`}>
                    <div className="relative">
                      <input
                        className="input"
                        value={line.medicineName}
                        onChange={(event) => updateLine(index, { medicineName: event.target.value, medicineId: "" })}
                        onFocus={() => setActiveMedicineIndex(index)}
                        onBlur={() => setActiveMedicineIndex(null)}
                        placeholder="Search medicines"
                        autoComplete="off"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={activeMedicineIndex === index}
                        aria-controls={medicineListId}
                      />
                      {activeMedicineIndex === index && (
                        <div
                          id={medicineListId}
                          role="listbox"
                          aria-label={`Matching medicines for medicine ${index + 1}`}
                          className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-brand-200 bg-white shadow-lg"
                        >
                          {medicineOptions.length > 0 ? medicineOptions.map((option) => (
                            <button
                              key={option._id}
                              type="button"
                              role="option"
                              aria-selected={option._id === line.medicineId}
                              className="block w-full px-3 py-2 text-left hover:bg-brand-50 focus:bg-brand-50 focus:outline-none"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                updateLine(index, { medicineName: option.name, medicineId: option._id });
                                setActiveMedicineIndex(null);
                              }}
                            >
                              <span className="block text-sm font-semibold text-ink">{option.name}</span>
                              <span className="block text-xs text-brand-800/70">
                                {num(option.stockQuantity)} {option.unit || "units"} in stock
                                {Number.isFinite(option.price) ? ` · ${option.price.toFixed(2)} per ${option.unit || "unit"}` : " · Price not set"}
                              </span>
                            </button>
                          )) : (
                            <p className="px-3 py-2 text-sm text-brand-800/70">No matching medicines found.</p>
                          )}
                        </div>
                      )}
                    </div>
                    {medicine && (
                      <p className="mt-1 text-xs text-brand-800/70">
                        In stock: {num(medicine.stockQuantity)} {medicine.unit || "units"}
                        {Number.isFinite(medicine.price)
                          ? ` · Price: ${medicine.price.toFixed(2)} per ${medicine.unit || "unit"}`
                          : " · Price not set; update it in Medicine stock"}
                      </p>
                    )}
                  </Field>
                  <Field label="Quantity">
                    <input
                      type="number"
                      min={1}
                      className="input"
                      value={line.quantity}
                      onChange={(event) => updateLine(index, { quantity: event.target.value })}
                    />
                  </Field>
                  {lines.length > 1 && (
                    <button type="button" className="btn btn-outline" onClick={() => setLines((current) => current.filter((_, i) => i !== index))} aria-label={`Remove medicine ${index + 1}`}>
                      <FiTrash2 /> Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button type="button" className="btn btn-outline mt-3" onClick={() => setLines((current) => [...current, newLine()])}>
            <FiPlus /> Add medicine
          </button>
          <div className="mt-5 flex justify-end border-t border-brand-100 pt-4">
            <p className="text-right font-bold text-ink">
              Total amount: <span className="ml-2 text-brand-700">{billTotal === null ? "—" : billTotal.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-brand-100 pt-5">
          <button className="btn btn-primary" type="submit" disabled={saving || medicines.length === 0}>
            {saving && <Spinner size="sm" />} {saving ? "Creating bill..." : "Create bill"}
          </button>
        </div>
        {medicines.length === 0 && <p className="text-sm text-amber-800">No medicines are in stock yet. Add medicines from the Medicine stock page first.</p>}
      </form>
    </>
  );
}
