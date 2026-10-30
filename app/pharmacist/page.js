"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiFileText,
  FiPackage,
  FiTrendingUp,
  FiXOctagon,
} from "react-icons/fi";
import { EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { pharmacistApi, toList } from "@/lib/api";
import { num } from "@/lib/utils";

const topName = (item) =>
  item.medicineName ||
  item.name ||
  item._id?.name ||
  (typeof item._id === "string" ? item._id : "Medicine");
const topQty = (item) =>
  num(item.quantitySold ?? item.totalQuantity ?? item.totalSold ?? item.quantity ?? item.sold ?? item.total);

function MetricCard({ icon: Icon, label, value, detail, tone = "blue" }) {
  const tones = {
    blue: "bg-brand-100 text-brand-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-600",
  };

  return (
    <article className="panel flex items-start gap-4 p-5">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon size={21} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-brand-800/70">{label}</p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
        <p className="mt-1 text-xs text-brand-800/60">{detail}</p>
      </div>
    </article>
  );
}

export default function PharmacistDashboard() {
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [lowStock, setLowStock] = useState(null);
  const [top, setTop] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      pharmacistApi.medicines(),
      pharmacistApi.lowStock(),
      pharmacistApi.topWeek(),
      pharmacistApi.dashboard(),
    ]).then(([meds, low, week, dash]) => {
      if (meds.status === "fulfilled") {
        setMedicines(toList(meds.value, "medicines"));
      } else {
        toast.error(meds.reason?.message || "Could not load medicines.");
      }

      if (low.status === "fulfilled") {
        setLowStock(toList(low.value, "medicines", "lowStock"));
      }

      const dashData = dash.status === "fulfilled" ? dash.value : null;
      if (week.status === "fulfilled") {
        setTop(toList(week.value, "topSelling", "medicines", "items"));
      } else if (dashData) {
        setTop(toList(dashData, "topSelling", "weeklyTopSelling", "topSellingMedicines"));
      }
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const out = medicines.filter((medicine) => num(medicine.stockQuantity) === 0).length;
    const low = medicines.filter(
      (medicine) =>
        num(medicine.stockQuantity) > 0 &&
        num(medicine.stockQuantity) <= num(medicine.lowStockThreshold)
    ).length;
    return { total: medicines.length, low, out };
  }, [medicines]);

  const lowList = useMemo(
    () =>
      [...(lowStock ?? medicines.filter((medicine) => num(medicine.stockQuantity) <= num(medicine.lowStockThreshold)))]
        .sort((a, b) => num(a.stockQuantity) - num(b.stockQuantity))
        .slice(0, 5),
    [lowStock, medicines]
  );
  const maxTop = Math.max(...top.map(topQty), 1);
  const attentionCount = stats.low + stats.out;

  if (loading) return <PageLoader label="Loading dashboard..." />;

  return (
    <>
      <PageHeader
        title="Pharmacy dashboard"
        subtitle="Your stock levels and medicine sales, all in one place."
      />

      <section className="relative mb-6 overflow-hidden rounded-2xl bg-brand-900 p-6 text-white shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[32px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-brand-700/40 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand-100">
              <FiActivity size={14} /> PHARMACY OPERATIONS
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
              {attentionCount > 0 ? "Keep your stock ready." : "Your pharmacy at a glance."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-100/80">
              {attentionCount > 0
                ? `${attentionCount} ${attentionCount === 1 ? "medicine needs" : "medicines need"} attention. Review restock priorities before your next dispense.`
                : "Review medicine availability, track weekly demand, and create patient bills."}
            </p>
          </div>
          <div className="relative flex shrink-0 flex-wrap gap-2">
            <Link href="/pharmacist/medicines" className="btn border border-white/25 bg-white/10 text-white hover:bg-white/20">
              <FiPackage /> Manage stock
            </Link>
            <Link href="/pharmacist/bills/new" className="btn bg-white text-brand-800 hover:bg-brand-50">
              <FiFileText /> Create bill
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Inventory summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={FiPackage} label="Total medicines" value={stats.total} detail="Products in your inventory" />
        <MetricCard
          icon={FiAlertTriangle}
          label="Low stock"
          value={stats.low}
          detail="At or below reorder level"
          tone="amber"
        />
        <MetricCard
          icon={FiXOctagon}
          label="Out of stock"
          value={stats.out}
          detail="Unavailable to dispense"
          tone="red"
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-ink">
                <FiTrendingUp className="text-brand-600" /> Weekly best sellers
              </h2>
              <p className="mt-1 text-xs text-brand-800/60">Units dispensed in the last 7 days</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {top.length} {top.length === 1 ? "medicine" : "medicines"}
            </span>
          </div>
          {top.length === 0 ? (
            <EmptyState
              icon={FiTrendingUp}
              title="No sales this week"
              hint="Create a patient bill to record medicine sales."
              action={
                <Link href="/pharmacist/bills/new" className="btn btn-primary btn-sm">
                  Create a bill <FiArrowRight />
                </Link>
              }
            />
          ) : (
            <ol className="space-y-4">
              {top.map((item, index) => {
                const quantity = topQty(item);
                return (
                  <li key={`${topName(item)}-${index}`} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-semibold text-ink">{topName(item)}</span>
                        <span className="shrink-0 font-semibold tabular-nums text-brand-700">
                          {quantity.toLocaleString()} sold
                        </span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-brand-100"
                        role="progressbar"
                        aria-label={`${topName(item)} sales`}
                        aria-valuemin={0}
                        aria-valuemax={maxTop}
                        aria-valuenow={quantity}
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                          style={{ width: `${Math.max(0, (quantity / maxTop) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="panel p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-ink">
                <FiAlertTriangle className="text-amber-600" /> Restock priorities
              </h2>
              <p className="mt-1 text-xs text-brand-800/60">Medicines with the least stock are shown first</p>
            </div>
            <Link
              href="/pharmacist/medicines"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900"
            >
              View inventory <FiArrowRight />
            </Link>
          </div>
          {lowList.length === 0 ? (
            <EmptyState icon={FiPackage} title="Everything is well stocked" hint="Low-stock medicines will appear here." />
          ) : (
            <ul className="divide-y divide-brand-100">
              {lowList.map((medicine) => {
                const quantity = num(medicine.stockQuantity);
                const threshold = num(medicine.lowStockThreshold);
                const isOut = quantity === 0;
                const progress = threshold > 0 ? Math.min((quantity / threshold) * 100, 100) : 0;
                return (
                  <li key={medicine._id} className="flex items-center gap-3 py-3.5">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        isOut ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isOut ? <FiXOctagon size={18} /> : <FiAlertTriangle size={18} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-ink">{medicine.name}</p>
                        <p className={`shrink-0 text-sm font-bold tabular-nums ${isOut ? "text-red-600" : "text-amber-700"}`}>
                          {quantity} <span className="font-medium">{medicine.unit || "units"}</span>
                        </p>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100">
                          <div
                            className={`h-full rounded-full ${isOut ? "bg-red-500" : "bg-amber-500"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[11px] text-brand-800/60">
                          Reorder at {threshold}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
