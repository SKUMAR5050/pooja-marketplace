"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabase, isConfigured, CATEGORIES } from "@/lib/supabase";

export default function Home() {
  const [shops, setShops] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isConfigured()) {
      setShops([]);
      return;
    }
    getSupabase()
      .from("shops")
      .select("id,name,area,address")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setShops(data || []);
      });
  }, []);

  const filtered = (shops || []).filter((s) =>
    (s.name + " " + (s.area || "")).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-br from-saffron-500 to-maroon p-6 text-white sm:p-10">
        <h1 className="text-2xl font-bold sm:text-4xl">Pooja items from shops near you</h1>
        <p className="mt-2 max-w-xl text-saffron-100">
          Agarbatti, flowers, coconut, diyas and full puja kits. Pick up with your order code, or get
          free delivery on orders above ₹500.
        </p>
        <input
          className="mt-5 w-full max-w-md rounded-lg px-4 py-2 text-gray-900 outline-none"
          placeholder="Search shop or area (e.g. Thane)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">What you can order</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c !== "Other").map((c) => (
            <span key={c} className="rounded-full bg-saffron-100 px-3 py-1 text-sm text-saffron-700">
              {c}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Shops</h2>
        {shops === null && <p className="text-gray-500">Loading shops…</p>}
        {error && <p className="text-red-600">Could not load shops: {error}</p>}
        {shops && shops.length === 0 && !error && (
          <div className="card text-gray-600">
            {isConfigured()
              ? "No shops yet. Shopkeepers can join from “Sell with us” above."
              : "Almost ready: the database keys are not added yet."}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => (
            <Link key={s.id} href={`/shop/${s.id}`} className="card block hover:border-saffron-500">
              <div className="text-lg font-semibold text-maroon">{s.name}</div>
              {s.area && <div className="text-sm text-gray-600">📍 {s.area}</div>}
              {s.address && <div className="text-sm text-gray-500">{s.address}</div>}
              <div className="mt-2 text-sm font-medium text-saffron-700">View items →</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
