"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getShop, listProducts } from "@/lib/data";
import { CATEGORY_ICONS } from "@/lib/supabase";
import { useCart } from "@/components/CartProvider";
import ItemArt from "@/components/ItemArt";
import KitSheet from "@/components/KitSheet";

export default function ShopPage() {
  const { id } = useParams();
  const { cart, add, setQty, clear, count } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [message, setMessage] = useState("");
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
  const qtyOf = (pid) => cart.items.find((x) => x.key === pid)?.qty || 0;

  function warnOtherShop() {
    setMessage(`Your cart has items from ${cart.shopName}. Start a new cart for ${shop.name}?`);
  }

  function handleAdd(p) {
    if (!add(shop, p)) warnOtherShop();
  }

  function handleAddKit(kit, chosen) {
    if (!add(shop, kit)) {
      setOpenKit(null);
      warnOtherShop();
      return;
    }
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

      {message && (
        <div className="card flex flex-wrap items-center gap-3 border-saffron-500 bg-saffron-50">
          <span className="text-sm">{message}</span>
          <button className="btn !py-1" onClick={() => { clear(); setMessage(""); }}>Start new cart</button>
          <button className="btn-outline !py-1" onClick={() => setMessage("")}>Cancel</button>
        </div>
      )}

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
                <div className="font-semibold leading-tight text-maroon">{p.name}</div>
                <div className="text-sm text-gray-500">
                  <span className="text-base font-bold text-saffron-700">₹{Number(p.price)}</span> / {p.unit}
                </div>
                <div className="mt-auto pt-2">
                  {p.is_kit ? (
                    <button className="btn w-full !py-1.5 text-sm" onClick={() => setOpenKit(p)}>
                      View kit &amp; add{q > 0 ? ` (in cart: ${q})` : ""}
                    </button>
                  ) : q === 0 ? (
                    <button className="btn w-full !py-1.5" onClick={() => handleAdd(p)}>Add</button>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button className="btn-outline !px-3 !py-1" onClick={() => setQty(p.id, q - 1)}>−</button>
                      <span className="font-bold">{q}</span>
                      <button className="btn-outline !px-3 !py-1" onClick={() => setQty(p.id, q + 1)}>+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 0 && cart.shopId === shop.id && (
        <div className="sticky bottom-4 flex justify-center">
          <Link href="/cart" className="btn !px-6 !py-3 shadow-xl">🛒 View cart ({count} items) →</Link>
        </div>
      )}

      {openKit && (
        <KitSheet kit={openKit} items={products} onClose={() => setOpenKit(null)} onAdd={handleAddKit} />
      )}
    </div>
  );
}
