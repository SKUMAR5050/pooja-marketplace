"use client";
import { useEffect, useState } from "react";
import { getSupabase, CATEGORIES, STARTER_PRODUCTS, COUNT_UNITS, LOOSE_UNITS, DEFAULT_STEP } from "@/lib/supabase";
import { isLoose, r3, stepOf, fullName } from "@/lib/format";
import BarcodeScanner from "./BarcodeScanner";

const EMPTY = { name: "", brand: "", pack_size: "", barcode: "", category: CATEGORIES[0], price: "", unit: "piece", otherUnit: "", step: "1", stock: "" };

export default function VendorProducts({ shop }) {
  const [products, setProducts] = useState(null);
  const [f, setF] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanFor, setScanFor] = useState(null); // "form" | "find"
  const [find, setFind] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const unit = f.unit === "other" ? f.otherUnit.trim() || "piece" : f.unit;
  const loose = isLoose(unit);

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

  function pickUnit(e) {
    const u = e.target.value;
    setF({ ...f, unit: u, step: String(DEFAULT_STEP[u] || 1) });
  }

  // When a barcode is typed / scanned: warn if already in this shop, else copy details from another shop
  async function barcodeEntered(code) {
    const bc = String(code || "").trim();
    setInfo("");
    if (!bc) return;
    const mine = (products || []).find((p) => p.barcode === bc && p.id !== editId);
    if (mine) {
      setInfo(`You already have this item: ${fullName(mine)}.`);
      return;
    }
    if (editId) return;
    const { data } = await getSupabase()
      .from("products")
      .select("name,brand,pack_size,category,unit,step")
      .eq("barcode", bc)
      .limit(1);
    const hit = data && data[0];
    if (hit) {
      const known = hit.unit && (COUNT_UNITS.includes(hit.unit) || LOOSE_UNITS.includes(hit.unit));
      setF((cur) => ({
        ...cur,
        barcode: bc,
        name: cur.name || hit.name || "",
        brand: cur.brand || hit.brand || "",
        pack_size: cur.pack_size || hit.pack_size || "",
        category: CATEGORIES.includes(hit.category) ? hit.category : cur.category,
        unit: known ? hit.unit : cur.unit,
        step: known ? String(hit.step || 1) : cur.step,
      }));
      setInfo("Found this barcode in another shop. Name, brand and pack size are filled in: just set your price.");
    }
  }

  async function saveProduct(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const row = {
      name: f.name.trim(),
      brand: f.brand.trim() || null,
      pack_size: f.pack_size.trim() || null,
      barcode: f.barcode.trim() || null,
      category: f.category,
      price: Number(f.price),
      unit,
      step: loose ? Number(f.step) || DEFAULT_STEP[unit] || 1 : 1,
      stock_qty: f.stock === "" ? null : Number(f.stock),
    };
    if (row.stock_qty !== null) row.in_stock = row.stock_qty > 0;
    const q = getSupabase().from("products");
    const { error } = editId ? await q.update(row).eq("id", editId) : await q.insert({ ...row, shop_id: shop.id });
    setBusy(false);
    if (error) setErr(error.message);
    else {
      setF({ ...EMPTY, category: f.category });
      setEditId(null);
      setInfo("");
      load();
    }
  }

  function startEdit(p) {
    const known = COUNT_UNITS.includes(p.unit) || LOOSE_UNITS.includes(p.unit);
    setEditId(p.id);
    setInfo("");
    setF({
      name: p.name || "",
      brand: p.brand || "",
      pack_size: p.pack_size || "",
      barcode: p.barcode || "",
      category: p.category,
      price: String(Number(p.price)),
      unit: known ? p.unit : "other",
      otherUnit: known ? "" : p.unit,
      step: String(stepOf(p)),
      stock: p.stock_qty === null || p.stock_qty === undefined ? "" : String(Number(p.stock_qty)),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const v = window.prompt(`New price for ${p.name} (₹ per ${p.unit})`, p.price);
    if (v === null) return;
    const n = Number(v);
    if (Number.isNaN(n) || n < 0) return;
    await getSupabase().from("products").update({ price: n }).eq("id", p.id);
    load();
  }

  async function setStock(p, qty) {
    const n = Math.max(0, r3(qty));
    await getSupabase().from("products").update({ stock_qty: n, in_stock: n > 0 }).eq("id", p.id);
    load();
  }

  async function typeStock(p) {
    const v = window.prompt(`Stock of ${p.name} (${p.unit}). Leave empty to stop tracking.`, p.stock_qty ?? "");
    if (v === null) return;
    if (v.trim() === "") {
      await getSupabase().from("products").update({ stock_qty: null }).eq("id", p.id);
      load();
      return;
    }
    const n = Number(v);
    if (Number.isNaN(n) || n < 0) return;
    setStock(p, n);
  }

  async function toggleStock(p) {
    const tracked = p.stock_qty !== null && p.stock_qty !== undefined;
    if (!p.in_stock && tracked && Number(p.stock_qty) <= 0) {
      typeStock({ ...p, stock_qty: "" });
      return;
    }
    await getSupabase().from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    load();
  }

  async function remove(p) {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    await getSupabase().from("products").delete().eq("id", p.id);
    load();
  }

  const needle = find.trim().toLowerCase();
  const shown = (products || []).filter(
    (p) => !needle || [p.name, p.brand, p.barcode, p.category].join(" ").toLowerCase().includes(needle)
  );

  return (
    <div className="space-y-5">
      <form onSubmit={saveProduct} className="card space-y-3">
        <h2 className="font-semibold">{editId ? "Edit item" : "Add an item"}</h2>

        <div className="flex gap-2">
          <input className="input" placeholder="Barcode (optional): type, or use scanner" value={f.barcode} onChange={set("barcode")} onBlur={(e) => barcodeEntered(e.target.value)} />
          <button type="button" className="btn-outline whitespace-nowrap !px-3" onClick={() => setScanFor("form")}>📷 Scan</button>
        </div>
        {info && <p className="text-sm text-saffron-700">{info}</p>}

        <input className="input" required placeholder="Item name (e.g. Agarbatti)" value={f.name} onChange={set("name")} />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Brand (optional)" value={f.brand} onChange={set("brand")} />
          <input className="input" placeholder="Pack size (e.g. 100 sticks)" value={f.pack_size} onChange={set("pack_size")} />
        </div>
        <select className="input" value={f.category} onChange={set("category")}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={f.unit} onChange={pickUnit}>
            <optgroup label="Sold as">
              {COUNT_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </optgroup>
            <optgroup label="Sold by weight / length">
              <option value="g">gram (g)</option>
              <option value="kg">kilogram (kg)</option>
              <option value="ml">millilitre (ml)</option>
              <option value="l">litre (l)</option>
              <option value="cm">centimetre (cm)</option>
              <option value="m">metre (m)</option>
            </optgroup>
            <option value="other">Other…</option>
          </select>
          <input className="input" required type="number" min="0" step="0.01" placeholder={`Price ₹ per ${unit}`} value={f.price} onChange={set("price")} />
        </div>
        {f.unit === "other" && (
          <input className="input" required placeholder="Unit name (e.g. 250 g pouch)" value={f.otherUnit} onChange={set("otherUnit")} />
        )}
        {loose && (
          <label className="block text-sm text-gray-600">
            Customer can buy in steps of (in {unit})
            <input className="input mt-1" required type="number" min="0.001" step="any" value={f.step} onChange={set("step")} />
            <span className="text-xs text-gray-500">Price is per 1 {unit}. Example: ₹80 per kg with steps of 0.25 lets customers buy 250 g, 500 g…</span>
          </label>
        )}

        <label className="block text-sm text-gray-600">
          Stock available{loose ? ` (in ${unit})` : ""} (optional)
          <input className="input mt-1" type="number" min="0" step="any" placeholder="Leave empty if you don't want to track" value={f.stock} onChange={set("stock")} />
          <span className="text-xs text-gray-500">When customers order, stock reduces by itself. At 0 the item shows as out of stock.</span>
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-2">
          <button className="btn flex-1" disabled={busy}>{editId ? "Save changes" : "Add item"}</button>
          {editId && (
            <button type="button" className="btn-outline" onClick={() => { setEditId(null); setF(EMPTY); setInfo(""); }}>Cancel</button>
          )}
        </div>
      </form>

      {products && products.length === 0 && (
        <div className="card space-y-2 bg-saffron-50">
          <p className="text-sm">Starting fresh? Add 13 common pooja items in one tap, then change prices to match your shop.</p>
          <button className="btn" onClick={addStarter} disabled={busy}>Add starter items</button>
        </div>
      )}

      {products && products.length > 0 && (
        <div className="flex gap-2">
          <input className="input" placeholder="Find an item or scan its barcode" value={find} onChange={(e) => setFind(e.target.value)} />
          <button type="button" className="btn-outline whitespace-nowrap !px-3" onClick={() => setScanFor("find")}>📷</button>
        </div>
      )}

      <div className="space-y-2">
        {shown.map((p) => {
          const tracked = p.stock_qty !== null && p.stock_qty !== undefined;
          const low = tracked && Number(p.stock_qty) <= 5 * stepOf(p);
          return (
            <div key={p.id} className={`card space-y-2 ${p.in_stock ? "" : "opacity-60"}`}>
              <div>
                {p.brand && <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{p.brand}</div>}
                <div className="font-medium">{p.name}{p.pack_size ? ` (${p.pack_size})` : ""}</div>
                <div className="text-sm text-gray-500">
                  {p.category} · ₹{Number(p.price)} / {p.unit}
                  {isLoose(p.unit) && ` · steps of ${r3(stepOf(p))} ${p.unit}`}
                  {p.barcode && ` · 🏷 ${p.barcode}`}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {tracked ? (
                  <>
                    <button className="btn-outline !px-3 !py-1" onClick={() => setStock(p, Number(p.stock_qty) - stepOf(p))}>−</button>
                    <button className={`font-semibold underline ${low ? "text-red-600" : "text-maroon"}`} onClick={() => typeStock(p)}>
                      Stock: {r3(Number(p.stock_qty))}{isLoose(p.unit) ? ` ${p.unit}` : ""}
                    </button>
                    <button className="btn-outline !px-3 !py-1" onClick={() => setStock(p, Number(p.stock_qty) + stepOf(p))}>+</button>
                  </>
                ) : (
                  <button className="btn-outline !px-3 !py-1" onClick={() => typeStock({ ...p, stock_qty: "" })}>Track stock</button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <button className="btn-outline !px-3 !py-1" onClick={() => startEdit(p)}>Edit</button>
                <button className="btn-outline !px-3 !py-1" onClick={() => updatePrice(p)}>Price</button>
                <button className="btn-outline !px-3 !py-1" onClick={() => toggleStock(p)}>{p.in_stock ? "Mark out of stock" : "Back in stock"}</button>
                <button className="btn-outline !px-3 !py-1" onClick={() => remove(p)}>Delete</button>
              </div>
            </div>
          );
        })}
        {products && products.length > 0 && shown.length === 0 && <div className="card text-gray-600">No item matches.</div>}
      </div>

      {scanFor && (
        <BarcodeScanner
          onClose={() => setScanFor(null)}
          onDetect={(code) => {
            if (scanFor === "find") setFind(code);
            else {
              setF((cur) => ({ ...cur, barcode: code }));
              barcodeEntered(code);
            }
            setScanFor(null);
          }}
        />
      )}
    </div>
  );
}
