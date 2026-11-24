"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";
import DemoBanner from "./DemoBanner";
import Diya from "./Diya";

export default function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-20 shadow-lg">
      <DemoBanner />
      <div className="bg-maroon-dark py-1 text-center font-serif text-xs tracking-[0.25em] text-gold">
        ॥ ॐ श्री गणेशाय नमः ॥
      </div>
      <div className="bg-gradient-to-r from-saffron-600 via-saffron-500 to-saffron-600">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Diya className="h-10 w-10" />
            <span className="leading-tight">
              <span className="block font-serif text-xl font-bold">Pooja Bazaar</span>
              <span className="block font-serif text-xs text-amber-100">पूजा बाज़ार</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-semibold">
            <Link href="/vendor" className="text-white/95 hover:underline">
              Sell with us
            </Link>
            <Link
              href="/cart"
              className="rounded-full bg-white px-4 py-1.5 text-saffron-700 shadow hover:bg-amber-50"
            >
              🛒 Cart{count > 0 ? ` (${count})` : ""}
            </Link>
          </nav>
        </div>
      </div>
      <div className="garland" />
    </header>
  );
}
