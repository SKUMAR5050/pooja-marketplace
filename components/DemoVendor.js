"use client";
import { useEffect, useState } from "react";
import { DEMO_SHOPS, demoProducts, loadOrders, saveOrders, getOutOfStock, setOutOfStock } from "@/lib/demo";

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

export default function DemoVendor() {
  const [shopId, setShopId] = useState(DEMO_SHOPS[0].id);
  const [tab, setTab] = useState("orders");
  const [filter, setFilter] = useState("active");
  const [orders, setOrders] = useState([]);
  const [oos, setOos] = useState([]);

  function refresh() {
    setOrders(loadOrders());
    setOos(getOutOfStock());
  }
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  const shop = DEMO_SHOPS.find((s) => s.id === shopId);
  const mine = orders.filter((o) => o.shop_id === shopId);
  const shown = mine.filter((o) =>
    filter === "active" ? !["completed", "cancelled"].includes(o.status) : ["completed", "cancelled"].includes(o.status)
  );

  function setStatus(code, status) {
    const next = loadOrders().map((o) => (o.code === code ? { ...o, status } : o));
    saveOrders(next);
    setOrders(next);
  }

  function toggleStock(id) {
    const cur = getOutOfStock();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    setOutOfStock(next);
    setOos(next);
  }

  const products = demoProducts(shopId);

  return (
    <div className="space-y-5">
      <div className="card border-2 border-gold bg-amber-50">
        <div className="font-serif font-bold text-maroon">🪔 Shopkeeper dashboard (demo)</div>
        <p className="mt-1 text-sm text-gray-700">
          This is how a shopkeeper will see orders. Place an order as a customer, then come back here
          to accept it. In the real version, shopkeepers sign in with their own account.
        </p>
        <select className="input mt-3 max-w-sm" value={shopId} onChange={(e) => setShopId(e.target.value)}>
          {DEMO_SHOPS.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <h1 className="title text-2xl">{shop.name}</h1>
        <p className="text-sm text-gray-600">📍 {shop.area}</p>
      </div>

      <div className="flex gap-2">
        {[["orders", "📜 Orders"], ["products", "🪔 My items"]].map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)} className={`chip ${tab === k ? "chip-active" : ""}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "orders" ? (
        <div className="space-y-3">
          <div className="flex gap-2 text-sm">
            <button onClick={() => setFilter("active")} className={filter === "active" ? "font-bold text-saffron-700" : "text-gray-500"}>Active</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => setFilter("done")} className={filter === "done" ? "font-bold text-saffron-700" : "text-gray-500"}>Past</button>
          </div>
          {shown.length === 0 && <div className="card text-gray-600">No orders here yet.</div>}
          {shown.map((o) => (
            <div key={o.code} className="card space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-serif text-lg font-bold tracking-wider text-saffron-700">{o.code}</div>
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${BADGE[o.status]}`}>{o.status}</span>
              </div>
              <div className="text-sm"><b>{o.customer_name}</b> · {o.customer_phone}</div>
              <div className="text-sm text-gray-600">
                {o.fulfilment === "delivery" ? `🚚 Deliver to: ${o.address}` : "🛕 Customer will pick up (check the code)"}
              </div>
              <ul className="text-sm">
                {o.items.map((i, idx) => (
                  <li key={idx}>
                    {i.name} × {i.qty} — ₹{i.qty * Number(i.price)}
                    {i.note && <div className="text-xs text-gray-500">{i.note}</div>}
                  </li>
                ))}
              </ul>
              <div className="font-semibold">Total: ₹{Number(o.subtotal)}</div>
              <div className="flex gap-2">
                {NEXT[o.status] && (
                  <button className="btn !py-1.5" onClick={() => setStatus(o.code, NEXT[o.status].to)}>{NEXT[o.status].label}</button>
                )}
                {["new", "accepted"].includes(o.status) && (
                  <button className="btn-outline !py-1.5" onClick={() => setStatus(o.code, "cancelled")}>Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className={`card flex flex-wrap items-center justify-between gap-2 ${oos.includes(p.id) ? "opacity-60" : ""}`}>
              <div>
                <div className="font-medium text-maroon">{p.name}</div>
                <div className="text-sm text-gray-500">{p.category} · ₹{p.price} / {p.unit}</div>
              </div>
              <button className="btn-outline !px-3 !py-1 text-sm" onClick={() => toggleStock(p.id)}>
                {oos.includes(p.id) ? "Back in stock" : "Mark out of stock"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
