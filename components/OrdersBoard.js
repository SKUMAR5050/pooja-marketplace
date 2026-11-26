"use client";
import { useState } from "react";
import { r2, qtyLabel, isLoose, mapsLink } from "@/lib/format";

// Shared order screen for shopkeepers (real and demo).
// orders: [{ key, code, status, paid, customer_name, customer_phone, fulfilment, address, subtotal, created_at, items:[{name,qty,unit,price,note}] }]
// onUpdate(order, { status?, paid? })

const TABS = [
  ["active", "All active"],
  ["new", "New"],
  ["accepted", "Accepted"],
  ["ready", "Ready"],
  ["unpaid", "Payment pending"],
  ["past", "Past"],
];

const BORDER = {
  new: "border-l-red-500",
  accepted: "border-l-blue-500",
  ready: "border-l-green-500",
  completed: "border-l-gray-300",
  cancelled: "border-l-gray-300",
};
const BADGE = {
  new: "bg-red-100 text-red-700",
  accepted: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-gray-100 text-gray-500",
};

const isOpen = (o) => !["completed", "cancelled"].includes(o.status);

function inTab(o, tab) {
  if (tab === "active") return isOpen(o);
  if (tab === "past") return !isOpen(o);
  if (tab === "unpaid") return !o.paid && o.status !== "cancelled";
  return o.status === tab;
}

// The one big button on each order
function nextAction(o) {
  if (o.status === "new") return { label: "Accept order", patch: { status: "accepted" } };
  if (o.status === "accepted")
    return { label: o.fulfilment === "delivery" ? "Out for delivery" : "Ready for pickup", patch: { status: "ready" } };
  if (o.status === "ready")
    return o.paid
      ? { label: "Complete order", patch: { status: "completed" } }
      : { label: "Mark paid & complete", patch: { status: "completed", paid: true } };
  return null;
}

export default function OrdersBoard({ orders, onUpdate }) {
  const [tab, setTab] = useState("active");
  const [q, setQ] = useState("");

  const needle = q.trim().toLowerCase();
  const matchesSearch = (o) =>
    !needle ||
    o.code.toLowerCase().includes(needle) ||
    String(o.customer_phone || "").replace(/\D/g, "").includes(needle.replace(/\D/g, "") || "no-match") ||
    String(o.customer_name || "").toLowerCase().includes(needle);

  const searching = needle.length > 0;
  const shown = orders.filter((o) => matchesSearch(o) && (searching ? true : inTab(o, tab)));
  const count = (t) => orders.filter((o) => inTab(o, t)).length;

  return (
    <div className="space-y-3">
      <input
        className="input"
        placeholder="🔍 Find by order code, phone or name"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(([k, label]) => {
          const n = count(k);
          const hot = (k === "new" || k === "unpaid") && n > 0;
          return (
            <button
              key={k}
              onClick={() => { setTab(k); setQ(""); }}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                tab === k && !searching ? "bg-saffron-600 text-white" : "bg-saffron-100 text-saffron-700"
              }`}
            >
              {label}
              {k !== "past" && (
                <span className={`ml-1.5 rounded-full px-1.5 text-xs font-bold ${hot && tab !== k ? "bg-red-600 text-white" : "bg-white/70 text-maroon"}`}>{n}</span>
              )}
            </button>
          );
        })}
      </div>

      {searching && <p className="text-xs text-gray-500">Showing matches from all orders.</p>}
      {shown.length === 0 && <div className="card text-gray-600">No orders here.</div>}

      {shown.map((o) => {
        const next = nextAction(o);
        return (
          <div key={o.key} className={`card space-y-2 border-l-4 ${BORDER[o.status] || ""}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-serif text-lg font-bold tracking-wider text-saffron-700">{o.code}</div>
              <div className="flex items-center gap-2">
                {o.status !== "cancelled" && (
                  <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${o.paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>
                    {o.paid ? "Paid" : "Payment pending"}
                  </span>
                )}
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${BADGE[o.status]}`}>{o.status}</span>
              </div>
            </div>
            <div className="text-sm">
              <b>{o.customer_name}</b> ·{" "}
              <a className="text-saffron-700 underline" href={`tel:${o.customer_phone}`}>{o.customer_phone}</a>
            </div>
            <div className="text-sm text-gray-600">
              {o.fulfilment === "delivery" ? (
                <>
                  <div className="whitespace-pre-line">🚚 Deliver to: {o.address}</div>
                  <a className="font-semibold text-saffron-700 underline" href={mapsLink(o.address)} target="_blank" rel="noreferrer">📍 Open in Google Maps</a>
                </>
              ) : (
                "🛕 Customer will pick up (check the code)"
              )}
            </div>
            <ul className="text-sm">
              {o.items.map((i, idx) => (
                <li key={idx}>
                  {i.name} {isLoose(i.unit) ? `— ${qtyLabel(i.qty, i.unit)}` : `× ${i.qty}`} — ₹{r2(i.qty * Number(i.price))}
                  {i.note && <div className="text-xs text-gray-500">{i.note}</div>}
                </li>
              ))}
            </ul>
            <div className="font-semibold">Total: ₹{Number(o.subtotal)}</div>

            <div className="flex flex-wrap items-center gap-2">
              {next && (
                <button className="btn !py-2" onClick={() => onUpdate(o, next.patch)}>{next.label}</button>
              )}
              {o.status !== "cancelled" && (
                <button className="btn-outline !px-3 !py-1 text-sm" onClick={() => onUpdate(o, { paid: !o.paid })}>
                  {o.paid ? "Mark unpaid" : "Mark paid"}
                </button>
              )}
              {["new", "accepted"].includes(o.status) && (
                <button className="px-2 text-sm text-red-600 underline" onClick={() => window.confirm(`Cancel order ${o.code}?`) && onUpdate(o, { status: "cancelled" })}>
                  Cancel order
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
