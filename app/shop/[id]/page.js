"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { useCart } from "@/components/CartProvider";

export default function ShopPage() {
  const { id } = useParams();
  const { cart, add, setQty, clear, count } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sb = getSupabase();
    Promise.all([
      sb.from("shops").select("*").eq("id", id).maybeSingle(),
      sb.from("products").select("*").eq("shop_id", id).eq("in_stock", true).order("category").order("name"),
    ]).then(([s, p]) => {
      setShop(s.data);
      setProducts(p.data || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (!shop) return <p>Shop not found. <Link href="/" className="text-saffron-700 underline">Back to shops</Link></p>;

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const shown = category === "All" ? products : products.filter((p) => p.category === category);

  function qtyOf(pid) {
    return cart.items.find((x) => x.id === pid)?.qty || 0;
  }

  function handleAdd(p) {
    const ok = add(shop, p);
    if (!ok) {
      setMessage(`Your cart has items from ${cart.shopName}. Start a new cart for ${shop.name}?`);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/" className="text-sm text-saffron-700 hover:underline">← All shops</Link>
        <h1 className="mt-1 text-2xl font-bold text-maroon">{shop.name}</h1>
        <p className="text-sm text-gray-600">
          {shop.area && <>📍 {shop.area} · </>}
          {shop.address}
        </p>
        <p className="mt-1 text-sm text-saffron-700">Pickup with order code · Free delivery above ₹500</p>
      </div>

      {message && (
        <div className="card flex flex-wrap items-center gap-3 border-saffron-500 bg-saffron-50">
          <span className="text-sm">{message}</span>
          <button className="btn !py-1" onClick={() => { clear(); setMessage(""); }}>Start new cart</button>
          <button className="btn-outline !py-1" onClick={() => setMessage("")}>Cancel</button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-sm ${
              category === c ? "bg-saffron-600 text-white" : "bg-saffron-100 text-saffron-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {products.length === 0 && <div className="card text-gray-600">This shop has not added items yet.</div>}

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((p) => {
          const q = qtyOf(p.id);
          return (
            <div key={p.id} className="card flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">
                  ₹{Number(p.price)} / {p.unit}
                </div>
              </div>
              {q === 0 ? (
                <button className="btn !py-1.5" onClick={() => handleAdd(p)}>Add</button>
              ) : (
                <div className="flex items-center gap-2">
                  <button className="btn-outline !px-3 !py-1" onClick={() => setQty(p.id, q - 1)}>−</button>
                  <span className="w-5 text-center font-semibold">{q}</span>
                  <button className="btn-outline !px-3 !py-1" onClick={() => setQty(p.id, q + 1)}>+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {count > 0 && cart.shopId === shop.id && (
        <div className="sticky bottom-4 flex justify-center">
          <Link href="/cart" className="btn shadow-lg">View cart ({count} items) →</Link>
        </div>
      )}
    </div>
  );
}
