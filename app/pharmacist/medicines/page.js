"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiEdit2, FiFileText, FiPackage, FiPlus, FiSearch } from "react-icons/fi";
import { EmptyState, Field, Modal, PageHeader, PageLoader, Spinner, StatusBadge } from "@/components/ui";
import { pharmacistApi, toList } from "@/lib/api";
import { num } from "@/lib/utils";

const EMPTY = { name: "", category: "", unit: "tablets", description: "", price: "", stockQuantity: 0, lowStockThreshold: 10 };

const stockStatus = (m) =>
  num(m.stockQuantity) === 0 ? "out of stock" : num(m.stockQuantity) <= num(m.lowStockThreshold) ? "low" : "in stock";

const isWhole = (v, min) => /^\d+$/.test(String(v)) && Number(v) >= min;
const isPrice = (v) => /^\d+(?:\.\d{1,2})?$/.test(String(v));

export default function MedicinesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(toList(await pharmacistApi.medicines(), "medicines"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((m) => !q || `${m.name} ${m.category || ""}`.toLowerCase().includes(q))
      .filter((m) => status === "all" || stockStatus(m) === status)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, query, status]);

  const run = async (fn, successMsg, after) => {
    setBusy(true);
    try {
      await fn();
      toast.success(successMsg);
      after?.();
      await load();
    } catch (e) {
      toast.error(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const saveMedicine = () => {
    if (form.name.trim().length < 2) return toast.error("Enter the medicine name.");
    if (!isWhole(form.stockQuantity, 0)) return toast.error("Stock must be a whole number (0 or more).");
    if (!isPrice(form.price)) return toast.error("Enter a price with no more than two decimal places.");
    if (!isWhole(form.lowStockThreshold, 0)) return toast.error("Low-stock level must be a whole number (0 or more).");
    if (!form.unit.trim()) return toast.error("Enter the medicine unit.");
    const body = {
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      lowStockThreshold: Number(form.lowStockThreshold),
    };
    const wasEditing = Boolean(editingMedicine);
    run(
      () => wasEditing
        ? pharmacistApi.updateMedicine(editingMedicine._id, body)
        : pharmacistApi.createMedicine(body),
      wasEditing ? `${body.name} updated.` : `${body.name} added to stock.`,
      () => {
        setAddOpen(false);
        setEditingMedicine(null);
        setForm(EMPTY);
      }
    );
  };

  const setF = (k) => (e) => setForm((current) => ({ ...current, [k]: e.target.value }));
  const openAddMedicine = () => {
    setForm(EMPTY);
    setEditingMedicine(null);
    setAddOpen(true);
  };
  const openEditMedicine = (medicine) => {
    setForm({
      name: medicine.name || "",
      category: medicine.category || "",
      unit: medicine.unit || "units",
      description: medicine.description || "",
      price: Number.isFinite(medicine.price) ? String(medicine.price) : "",
      stockQuantity: String(num(medicine.stockQuantity)),
      lowStockThreshold: String(num(medicine.lowStockThreshold)),
    });
    setEditingMedicine(medicine);
  };

  return (
    <>
      <PageHeader
        title="Medicine stock"
        subtitle="View current medicine quantities. Create patient bills to dispense medicines and update stock."
        action={<div className="flex flex-wrap gap-2"><Link className="btn btn-outline" href="/pharmacist/bills/new"><FiFileText /> Create bill</Link><button className="btn btn-primary" onClick={openAddMedicine}><FiPlus /> Add medicine</button></div>}
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-2">
          <FiSearch className="absolute left-3.5 top-3.5 text-brand-400" />
          <input className="input pl-10" placeholder="Search by name or category" value={query}
            onChange={(e) => setQuery(e.target.value)} aria-label="Search medicines" />
        </div>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by stock level">
          <option value="all">All stock levels</option>
          <option value="in stock">In stock</option>
          <option value="low">Low stock</option>
          <option value="out of stock">Out of stock</option>
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : visible.length === 0 ? (
        <EmptyState icon={FiPackage} title={items.length ? "No medicines match" : "No medicines yet"}
          hint={items.length ? "Clear the search or filter." : "Add your first medicine to start tracking stock."}
          action={!items.length && <button className="btn btn-primary" onClick={openAddMedicine}>Add medicine</button>} />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-brand-100 bg-brand-50">
              <tr>
                <th className="th">Medicine</th>
                <th className="th">Category</th>
                <th className="th">In stock</th>
                <th className="th">Price per unit</th>
                <th className="th">Status</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {visible.map((m) => (
                <tr key={m._id}>
                  <td className="td">
                    <p className="font-semibold text-ink">{m.name}</p>
                    {m.description && <p className="max-w-xs truncate text-xs text-brand-800/60">{m.description}</p>}
                  </td>
                  <td className="td">{m.category || "-"}</td>
                  <td className="td font-semibold">
                    {num(m.stockQuantity)} <span className="font-normal text-brand-800/60">{m.unit}</span>
                    <p className="text-xs font-normal text-brand-800/60">Alert at {num(m.lowStockThreshold)}</p>
                  </td>
                  <td className="td">{Number.isFinite(m.price) ? m.price.toFixed(2) : "Not set"}</td>
                  <td className="td"><StatusBadge status={stockStatus(m)} /></td>
                  <td className="td">
                    <button type="button" className="btn btn-outline" onClick={() => openEditMedicine(m)}>
                      <FiEdit2 /> Edit medicine
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add or edit medicine */}
      <Modal
        open={addOpen || Boolean(editingMedicine)}
        onClose={() => {
          setAddOpen(false);
          setEditingMedicine(null);
        }}
        title={editingMedicine ? `Edit ${editingMedicine.name}` : "Add medicine"}
        footer={<>
          <button className="btn btn-outline" onClick={() => { setAddOpen(false); setEditingMedicine(null); }} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" onClick={saveMedicine} disabled={busy}>{busy && <Spinner size="sm" />} {editingMedicine ? "Save changes" : "Add medicine"}</button>
        </>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Name"><input className="input" value={form.name} onChange={setF("name")} placeholder="Paracetamol 500mg" /></Field></div>
          <Field label="Category"><input className="input" value={form.category} onChange={setF("category")} placeholder="Pain relief" /></Field>
          <Field label="Unit"><input className="input" value={form.unit} onChange={setF("unit")} placeholder="tablets" /></Field>
          <Field label={editingMedicine ? "Current stock" : "Opening stock"}><input type="number" min={0} className="input" value={form.stockQuantity} onChange={setF("stockQuantity")} /></Field>
          <Field label="Low-stock alert level"><input type="number" min={0} className="input" value={form.lowStockThreshold} onChange={setF("lowStockThreshold")} /></Field>
          <Field label="Price per unit"><input type="number" min={0} step="0.01" className="input" value={form.price} onChange={setF("price")} placeholder="0.00" /></Field>
          <div className="sm:col-span-2"><Field label="Description (optional)"><textarea rows={2} className="input" value={form.description} onChange={setF("description")} /></Field></div>
        </div>
      </Modal>

    </>
  );
}
