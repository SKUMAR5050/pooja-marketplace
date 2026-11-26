"use client";
import { useEffect, useState } from "react";
import OrdersBoard from "./OrdersBoard";
import { DEMO_SHOPS, demoProducts, loadOrders, saveOrders, getOutOfStock, setOutOfStock } from "@/lib/demo";

export default function DemoVendor() {
  const [shopId, setShopId] = useState(DEMO_SHOPS[0].id);
  const [tab, setTab] = useState("orders");
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
        <OrdersBoard
          orders={mine.map((o) => ({ ...o, key: o.code }))}
          onUpdate={(o, patch) => {
            const next = loadOrders().map((x) => (x.code === o.code ? { ...x, ...patch } : x));
            saveOrders(next);
            setOrders(next);
          }}
        />
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
