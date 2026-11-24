"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listShops } from "@/lib/data";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/supabase";
import Mandala from "@/components/Mandala";
import Diya from "@/components/Diya";
import Toran from "@/components/Toran";

const STEPS = [
  { icon: "🛕", title: "Choose your shop", text: "Pick a trusted pooja shop in your area." },
  { icon: "🪔", title: "Add pooja items", text: "Flowers, diyas, coconut, kits and more." },
  { icon: "🚚", title: "Pick up or delivery", text: "Show your order code, or get free delivery above ₹500." },
];

export default function Home() {
  const [shops, setShops] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    listShops()
      .then(setShops)
      .catch((e) => {
        setError(e.message);
        setShops([]);
      });
  }, []);

  const filtered = (shops || []).filter((s) =>
    (s.name + " " + (s.area || "")).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon-dark via-[#9a2a0a] to-saffron-600 p-6 pb-28 pt-32 text-white shadow-xl sm:p-12 sm:pb-12 sm:pt-32">
        <Toran />
        <Mandala className="absolute -right-20 -top-20 h-72 w-72 animate-spin-slow text-gold/30 sm:h-[26rem] sm:w-[26rem]" />
        <Mandala className="absolute -bottom-24 -left-24 h-60 w-60 animate-spin-slow text-gold/15" />
        <div className="relative max-w-xl">
          <p className="font-serif text-lg text-gold">॥ शुभ पूजा • शुभ आरंभ ॥</p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-5xl">
            Everything for your pooja, <span className="gold-text animate-shimmer">from shops near you</span>
          </h1>
          <p className="mt-3 text-amber-100">
            Agarbatti, fresh flowers, coconut, diyas and complete puja kits. Pick up with your order
            code, or get <b>free delivery above ₹500</b>.
          </p>
          <input
            className="mt-5 w-full max-w-md rounded-xl border-2 border-gold/60 px-4 py-2.5 text-gray-900 shadow-inner outline-none focus:border-gold"
            placeholder="🔍  Search shop or area (e.g. Thane)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-amber-100">
            <span className="rounded-full bg-white/10 px-3 py-1">🛕 Trusted local shops</span>
            <span className="rounded-full bg-white/10 px-3 py-1">🌼 Fresh flowers</span>
            <span className="rounded-full bg-white/10 px-3 py-1">🙏 Festival ready</span>
          </div>
        </div>
        <div className="absolute bottom-4 right-5 sm:bottom-6 sm:right-10">
          <Diya className="h-24 w-24 sm:h-36 sm:w-36" />
        </div>
      </section>

      {/* SHOPS */}
      <section>
        <div className="divider-om mb-4">
          <h2 className="title text-xl">🛕 Pooja shops near you</h2>
        </div>
        {shops === null && <p className="text-gray-500">Loading shops…</p>}
        {error && <p className="text-red-600">Could not load shops: {error}</p>}
        {shops && filtered.length === 0 && !error && (
          <div className="card text-gray-600">
            No shops found. Shopkeepers can join from “Sell with us” above.
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/shop/${s.id}`}
              className="card group relative block overflow-hidden border-t-4 border-t-saffron-500 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-saffron-200 text-3xl">
                  🛕
                </div>
                <div>
                  <div className="font-serif text-lg font-bold text-maroon">{s.name}</div>
                  {s.area && <div className="text-sm text-gray-600">📍 {s.area}</div>}
                  {s.address && <div className="text-xs text-gray-500">{s.address}</div>}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">Pickup available</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-saffron-700">Free delivery ₹500+</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-right text-sm font-semibold text-saffron-700 group-hover:underline">
                View pooja items →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section>
        <div className="divider-om mb-4">
          <h2 className="title text-xl">🌼 What you can order</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.filter((c) => c !== "Other").map((c) => (
            <div key={c} className="card flex flex-col items-center gap-1 py-5 text-center">
              <span className="text-4xl">{CATEGORY_ICONS[c]}</span>
              <span className="font-serif text-sm font-bold text-maroon">{c}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="divider-om mb-4">
          <h2 className="title text-xl">🙏 How it works</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="card text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-saffron-100 text-2xl">
                {s.icon}
              </div>
              <div className="font-serif font-bold text-maroon">
                {i + 1}. {s.title}
              </div>
              <p className="mt-1 text-sm text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SELL WITH US */}
      <section className="rounded-3xl border-2 border-gold bg-gradient-to-r from-amber-50 to-saffron-100 p-6 text-center">
        <div className="font-serif text-xl font-bold text-maroon">Own a pooja shop? 🪔</div>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-700">
          List your items, receive orders from nearby devotees and grow your business. No fees to start.
        </p>
        <Link href="/vendor" className="btn mt-3">Open my shop</Link>
      </section>
    </div>
  );
}
