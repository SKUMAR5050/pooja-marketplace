"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getShop, listProducts } from "@/lib/data";
import { CATEGORY_ICONS } from "@/lib/supabase";
import { useCart } from "@/components/CartProvider";
import ItemArt from "@/components/ItemArt";
import { r3, stepOf, qtyLabel, isLoose, lowStockTag, canAddMore, perHint } from "@/lib/format";
import KitSheet from "@/components/KitSheet";

export default function ShopPage() {
  const { id } = useParams();
  const { cart, add, setQty, count } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [openKit, setOpenKit] = useState(null);

  useEffect(() => {
    Promise.all([getShop(id), listProducts(id)]).then(([s, p]) => {
      setShop(s);
      setProducts(p);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (!shop)
    return (
      <p>
        Shop not found. <Link href="/" className="text-saffron-700 underline">Back to shops</Link>
      </p>
    );

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const shown = category === "All" ? products : products.filter((p) => p.category === category);
  const lineOf = (pid) => cart.items.find((x) => x.shopId === shop.id && x.id === pid && !x.extraFor);
  const qtyOf = (pid) => lineOf(pid)?.qty || 0;

  function handleAdd(p) {
    add(shop, p);
  }

  function handleAddKit(kit, chosen) {
    add(shop, kit);
    chosen.forEach(({ product, qty }) => add(shop, product, { qty, extraFor: kit.id }));
    setOpenKit(null);
  }

  return (
    <div className="space-y-5">
      <div className="card border-t-4 border-t-saffron-500">
        <Link href="/" className="text-sm text-saffron-700 hover:underline">← All shops</Link>
        <div className="mt-2 flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-saffron-200 text-3xl">🛕</div>
          <div>
            <h1 className="title text-2xl">{shop.name}</h1>
            <p className="text-sm text-gray-600">
              {shop.area && <>📍 {shop.area} · </>}
              {shop.address}
            </p>
            <p className="mt-1 text-sm font-medium text-saffron-700">
              🛕 Pickup with order code · 🚚 Free delivery above ₹500
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`chip whitespace-nowrap ${category === c ? "chip-active" : ""}`}>
            {c !== "All" && <span className="mr-1">{CATEGORY_ICONS[c] || "🙏"}</span>}
            {c}
          </button>
        ))}
      </div>

      {products.length === 0 && <div className="card text-gray-600">This shop has not added items yet.</div>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((p) => {
          const q = qtyOf(p.id);
          return (
            <div key={p.id} className="card flex flex-col overflow-hidden !p-0 transition hover:shadow-md">
              <button
                className="relative block text-left"
                onClick={() => (p.is_kit ? setOpenKit(p) : null)}
                aria-label={p.is_kit ? `View ${p.name}` : p.name}
              >
                <ItemArt product={p} className="aspect-square w-full" />
                {p.is_kit && (
                  <span className="absolute left-2 top-2 rounded-full bg-maroon px-2 py-0.5 text-[11px] font-bold text-gold shadow">
                    🧺 KIT · {(p.kit_contents || []).length} items
                  </span>
                )}
              </button>
              <div className="flex flex-1 flex-col gap-1 p-3">
                {p.brand && <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{p.brand}</div>}
                <div className="font-semibold leading-tight text-maroon">{p.name}</div>
                {p.pack_size && <div className="text-xs text-gray-500">{p.pack_size}</div>}
                <div className="text-sm text-gray-500">
                  <span className="text-base font-bold text-saffron-700">₹{Number(p.price)}</span> / {p.unit}
                </div>
                {perHint(p) && <div className="text-xs text-gray-500">{perHint(p)}</div>}
                {lowStockTag(p) && <div className="text-xs font-semibold text-red-600">{lowStockTag(p)}</div>}
                <div className="mt-auto pt-2">
                  {p.is_kit ? (
                    <button className="btn w-full !py-1.5 text-sm" onClick={() => setOpenKit(p)}>
                      View kit &amp; add{q > 0 ? ` (in cart: ${q})` : ""}
                    </button>
                  ) : q === 0 ? (
                    <button className="btn w-full !py-1.5" onClick={() => handleAdd(p)}>Add{isLoose(p.unit) ? ` ${qtyLabel(stepOf(p), p.unit)}` : ""}</button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button className="btn-outline !px-3 !py-1" onClick={() => setQty(lineOf(p.id).key, r3(q - stepOf(p)))}>−</button>
                      <span className="text-sm font-bold">{qtyLabel(q, p.unit)}</span>
                      <button className="btn-outline !px-3 !py-1 disabled:opacity-40" disabled={!canAddMore(p, q)} onClick={() => setQty(lineOf(p.id).key, r3(q + stepOf(p)))}>+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 0 && (
        <div className="sticky bottom-4 flex justify-center">
          <Link href="/cart" className="btn !px-6 !py-3 shadow-xl">🛒 View cart ({count} item{count > 1 ? "s" : ""}) →</Link>
        </div>
      )}

      {openKit && (
        <KitSheet kit={openKit} items={products} onClose={() => setOpenKit(null)} onAdd={handleAddKit} />
      )}
    </div>
  );
}
