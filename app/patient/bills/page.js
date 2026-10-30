"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiCalendar, FiChevronDown, FiFileText, FiPackage, FiUser } from "react-icons/fi";
import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { patientApi, toList } from "@/lib/api";

const displayDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
};

export default function PatientBillsPage() {
  const [bills, setBills] = useState([]);
  const [expandedBills, setExpandedBills] = useState(() => new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    patientApi.bills()
      .then((data) => alive && setBills(toList(data, "bills")))
      .catch((error) => alive && toast.error(error.message || "Could not load your bills."))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  return (
    <>
      <PageHeader title="Your bills" subtitle="Review your medicine purchases, quantities, and bill totals." />
      {loading ? (
        <PageLoader label="Loading your bills..." />
      ) : bills.length === 0 ? (
        <EmptyState icon={FiFileText} title="No bills yet" hint="Medicine bills from the pharmacy will appear here." action={<Link href="/patient" className="btn btn-primary">Browse doctors</Link>} />
      ) : (
        <ul className="grid items-start gap-5 xl:grid-cols-2">
          {bills.map((bill) => {
            const billNumber = String(bill._id).slice(-8).toUpperCase();
            const isExpanded = expandedBills.has(bill._id);
            const detailsId = `bill-details-${bill._id}`;
            return (
              <li key={bill._id} className="panel overflow-hidden shadow-sm">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center justify-between gap-3 bg-brand-50/70 p-5 text-left transition-colors hover:bg-brand-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                  aria-expanded={isExpanded}
                  aria-controls={detailsId}
                  aria-label={`${isExpanded ? "Hide" : "Show"} details for bill ${billNumber}`}
                  onClick={() => setExpandedBills((current) => {
                    const next = new Set(current);
                    if (next.has(bill._id)) next.delete(bill._id);
                    else next.add(bill._id);
                    return next;
                  })}
                >
                  <span className="font-bold text-ink">BILL #{billNumber}</span>
                  <span className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-800/70">
                      <FiCalendar size={13} aria-hidden="true" />
                      {displayDate(bill.billedAt || bill.createdAt)}
                    </span>
                    <FiChevronDown
                      className={`shrink-0 text-brand-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {isExpanded && (
                  <div id={detailsId} className="p-5">
                    <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-1 text-xs font-semibold uppercase tracking-wide text-brand-800/50">
                      <span>Medicine</span>
                      <span className="text-right">Amount</span>
                    </div>
                    <ul className="divide-y divide-brand-100 rounded-xl border border-brand-100">
                      {(bill.items || []).map((item, index) => (
                        <li key={`${item.medicine || item.medicineName}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3.5">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                              <FiPackage size={15} aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink">{item.medicineName}</p>
                              <p className="mt-1 text-xs text-brand-800/60">
                                {item.quantity} {item.unit || "units"}
                                {Number.isFinite(item.unitPrice) && ` × ${item.unitPrice.toFixed(2)} per ${item.unit || "unit"}`}
                              </p>
                            </div>
                          </div>
                          <p className="text-right text-sm font-semibold text-ink">
                            {Number.isFinite(item.unitPrice)
                              ? (item.unitPrice * item.quantity).toFixed(2)
                              : "—"}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 px-4 py-3.5">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-brand-800/60">Total amount</p>
                        <p className="mt-0.5 text-xs text-brand-800/50">Final bill total</p>
                      </div>
                      <p className="text-2xl font-extrabold tracking-tight text-brand-700">
                        {Number.isFinite(bill.totalAmount) ? bill.totalAmount.toFixed(2) : "—"}
                      </p>
                    </div>

                    {bill.pharmacist?.name && (
                      <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-brand-800/60">
                        <FiUser size={13} aria-hidden="true" />
                        Issued by {bill.pharmacist.name}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
