"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { r2, qtyLabel, isLoose, mapsLink } from "@/lib/format";

const NEXT = {
  new: { to: "accepted", label: "Accept order" },
  accepted: { to: "ready", label: "Mark ready" },
  ready: { to: "completed", label: "Mark completed" },
};

const BADGE = {
  new: "bg-red-100 text-red-700",
  accepted: "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function VendorOrders({ shop }) {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("active");
  const [error, setError] = useState("");

  async function load() {
    const { data, error } = await getSupabase()
      .from("orders")
      .select("*, order_items(*)")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setError(error.message);
    else setOrders(data);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [shop.id]);

  async function setStatus(id, status) {
    await getSupabase().from("orders").update({ status }).eq("id", id);
    load();
  }

  async function setPaid(id, paid) {
    await getSupabase().from("orders").update({ paid }).eq("id", id);
    load();
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!orders) return <p className="text-gray-500">Loading orders…</p>;

  const shown = orders.filter((o) =>
    filter === "active" ? !["completed", "cancelled"].includes(o.status) : ["completed", "cancelled"].includes(o.status)
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-sm">
        <button onClick={() => setFilter("active")} className={filter === "active" ? "font-bold text-saffron-700" : "text-gray-500"}>Active</button>
        <span className="text-gray-300">|</span>
        <button onClick={() => setFilter("done")} className={filter === "done" ? "font-bold text-saffron-700" : "text-gray-500"}>Past</button>
        <span className="ml-auto text-xs text-gray-400">Refreshes automatically</span>
      </div>

      {shown.length === 0 && <div className="card text-gray-600">No orders here yet.</div>}

      {shown.map((o) => (
        <div key={o.id} className="card space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-lg font-bold tracking-wider text-saffron-700">{o.code}</div>
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
            ) : "🏪 Customer will pick up (check the code)"}
          </div>
          <ul className="text-sm">
            {o.order_items.map((i) => (
              <li key={i.id}>
                {i.product_name} {isLoose(i.unit) ? `— ${qtyLabel(i.qty, i.unit)}` : `× ${i.qty}`} — ₹{r2(i.qty * Number(i.price))}
                {i.note && <div className="text-xs text-gray-500">{i.note}</div>}
              </li>
            ))}
          </ul>
          <div className="font-semibold">Total: ₹{Number(o.subtotal)}</div>
          <div className="flex gap-2">
            {NEXT[o.status] && (
              <button className="btn !py-1.5" onClick={() => setStatus(o.id, NEXT[o.status].to)}>
                {NEXT[o.status].label}
              </button>
            )}
            {o.status !== "cancelled" && (
              <button className="btn-outline !py-1.5" onClick={() => setPaid(o.id, !o.paid)}>
                {o.paid ? "Mark unpaid" : "Mark paid"}
              </button>
            )}
            {["new", "accepted"].includes(o.status) && (
              <button className="btn-outline !py-1.5" onClick={() => setStatus(o.id, "cancelled")}>Cancel</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
