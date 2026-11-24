"use client";
import { useEffect, useState } from "react";
import { getSupabase, CATEGORIES, STARTER_PRODUCTS } from "@/lib/supabase";

export default function VendorProducts({ shop }) {
  const [products, setProducts] = useState(null);
  const [f, setF] = useState({ name: "", category: CATEGORIES[0], price: "", unit: "piece" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function load() {
    const { data, error } = await getSupabase()
      .from("products")
      .select("*")
      .eq("shop_id", shop.id)
      .order("category")
      .order("name");
    if (error) setErr(error.message);
    else setProducts(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [shop.id]);

  async function addProduct(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { error } = await getSupabase()
      .from("products")
      .insert({ ...f, price: Number(f.price), shop_id: shop.id });
    setBusy(false);
    if (error) setErr(error.message);
    else {
      setF({ ...f, name: "", price: "" });
      load();
    }
  }

  async function addStarter() {
    setBusy(true);
    const { error } = await getSupabase()
      .from("products")
      .insert(STARTER_PRODUCTS.map((p) => ({ ...p, shop_id: shop.id })));
    setBusy(false);
    if (error) setErr(error.message);
    else load();
  }

  async function updatePrice(p) {
    const v = window.prompt(`New price for ${p.name} (₹)`, p.price);
    if (v === null) return;
    const n = Number(v);
    if (Number.isNaN(n) || n < 0) return;
    await getSupabase().from("products").update({ price: n }).eq("id", p.id);
    load();
  }

  async function toggleStock(p) {
    await getSupabase().from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    load();
  }

  async function remove(p) {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    await getSupabase().from("products").delete().eq("id", p.id);
    load();
  }

  return (
    <div className="space-y-5">
      <form onSubmit={addProduct} className="card space-y-3">
        <h2 className="font-semibold">Add an item</h2>
        <input className="input" required placeholder="Item name (e.g. Agarbatti)" value={f.name} onChange={set("name")} />
        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={f.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input className="input" required type="number" min="0" step="0.5" placeholder="Price ₹" value={f.price} onChange={set("price")} />
        </div>
        <input className="input" placeholder="Unit (piece, pack, dozen, 250 g)" value={f.unit} onChange={set("unit")} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn w-full" disabled={busy}>Add item</button>
      </form>

      {products && products.length === 0 && (
        <div className="card space-y-2 bg-saffron-50">
          <p className="text-sm">Starting fresh? Add 13 common pooja items in one tap, then change prices to match your shop.</p>
          <button className="btn" onClick={addStarter} disabled={busy}>Add starter items</button>
        </div>
      )}

      <div className="space-y-2">
        {(products || []).map((p) => (
          <div key={p.id} className={`card flex flex-wrap items-center justify-between gap-2 ${p.in_stock ? "" : "opacity-60"}`}>
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-500">{p.category} · ₹{Number(p.price)} / {p.unit}</div>
            </div>
            <div className="flex gap-2 text-sm">
              <button className="btn-outline !px-3 !py-1" onClick={() => updatePrice(p)}>Price</button>
              <button className="btn-outline !px-3 !py-1" onClick={() => toggleStock(p)}>{p.in_stock ? "Mark out of stock" : "Back in stock"}</button>
              <button className="btn-outline !px-3 !py-1" onClick={() => remove(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
