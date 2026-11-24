"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-10 border-b border-saffron-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-maroon">
          <span className="text-2xl">🪔</span> Pooja Bazaar
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/vendor" className="text-saffron-700 hover:underline">
            Sell with us
          </Link>
          <Link href="/cart" className="btn !px-3 !py-1.5">
            Cart{count > 0 ? ` (${count})` : ""}
          </Link>
        </nav>
      </div>
    </header>
  );
}
