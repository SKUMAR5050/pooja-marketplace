"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/lib/data";
import { FREE_DELIVERY_MIN } from "@/lib/supabase";
import { useCart } from "@/components/CartProvider";
import Diya from "@/components/Diya";
import ItemArt from "@/components/ItemArt";

export default function CartPage() {
  const router = useRouter();
  const { cart, setQty, clear, subtotal, ready } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mode, setMode] = useState("pickup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return <p className="text-gray-500">Loading…</p>;

  if (cart.items.length === 0) {
    return (
      <div className="card py-10 text-center">
        <div className="flex justify-center">
          <Diya className="h-20 w-20" />
        </div>
        <p className="mb-3 mt-2 font-serif text-lg text-maroon">Your cart is empty</p>
        <Link href="/" className="btn">Browse pooja shops</Link>
      </div>
    );
  }

  const deliveryOk = subtotal >= FREE_DELIVERY_MIN;
  const effectiveMode = deliveryOk ? mode : "pickup";

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!/^[0-9+\s-]{10,15}$/.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (effectiveMode === "delivery" && !address.trim()) {
      setError("Please enter your delivery address.");
      return;
    }
    setBusy(true);
    try {
      const code = await placeOrder({
        shopId: cart.shopId,
        name,
        phone,
        address,
        mode: effectiveMode,
        items: cart.items.map((i) => ({ id: i.id, qty: i.qty, extra: Boolean(i.extraFor) })),
      });
      clear();
      router.push(`/order/${code}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="title text-2xl">🛒 Your pooja cart</h1>
      <p className="text-sm text-gray-600">From <b>{cart.shopName}</b></p>

      <div className="card divide-y divide-amber-100">
        {cart.items
          .filter((i) => !i.extraFor)
          .map((i) => (
            <div key={i.key}>
              <CartLine line={i} setQty={setQty} />
              {cart.items
                .filter((x) => x.extraFor === i.id)
                .map((x) => (
                  <div key={x.key} className="ml-6 border-l-2 border-amber-200 pl-3">
                    <CartLine line={x} setQty={setQty} extra />
                  </div>
                ))}
            </div>
          ))}
        <div className="flex justify-between pt-3 text-lg font-bold text-maroon">
          <span>Total</span>
          <span>₹{subtotal}</span>
        </div>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        <h2 className="title text-lg">How would you like to get it?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`cursor-pointer rounded-xl border-2 p-3 ${effectiveMode === "pickup" ? "border-saffron-600 bg-saffron-50" : "border-amber-200"}`}>
            <input type="radio" className="mr-2" checked={effectiveMode === "pickup"} onChange={() => setMode("pickup")} />
            <b>🛕 Pickup from shop</b>
            <div className="text-sm text-gray-600">Show your order code at the shop</div>
          </label>
          <label className={`rounded-xl border-2 p-3 ${deliveryOk ? "cursor-pointer" : "opacity-60"} ${effectiveMode === "delivery" ? "border-saffron-600 bg-saffron-50" : "border-amber-200"}`}>
            <input type="radio" className="mr-2" disabled={!deliveryOk} checked={effectiveMode === "delivery"} onChange={() => setMode("delivery")} />
            <b>🚚 Free home delivery</b>
            <div className="text-sm text-gray-600">
              {deliveryOk ? "Delivered by the shop" : `Add ₹${FREE_DELIVERY_MIN - subtotal} more to unlock`}
            </div>
          </label>
        </div>

        <input className="input" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" required inputMode="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {effectiveMode === "delivery" && (
          <textarea className="input" rows={3} placeholder="Full delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn w-full !py-3 text-lg" disabled={busy}>
          {busy ? "Placing order…" : "🙏 Place order (pay at shop / on delivery)"}
        </button>
      </form>
    </div>
  );
}

function CartLine({ line, setQty, extra = false }) {
  return (
    <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ItemArt product={line} className={`shrink-0 overflow-hidden rounded-lg ${extra ? "h-10 w-10" : "h-14 w-14"}`} />
        <div className="min-w-0">
          {extra && <div className="text-[11px] font-bold uppercase tracking-wide text-saffron-700">Extra with kit</div>}
          <div className="font-semibold text-maroon">{line.name}</div>
          <div className="text-sm text-gray-500">₹{line.price} / {line.unit}</div>
          {line.note && <div className="line-clamp-2 text-xs text-gray-500">Includes: {line.note}</div>}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <button className="btn-outline !px-3 !py-1" onClick={() => setQty(line.key, line.qty - 1)}>−</button>
        <span className="w-5 text-center font-bold">{line.qty}</span>
        <button className="btn-outline !px-3 !py-1" onClick={() => setQty(line.key, line.qty + 1)}>+</button>
        <span className="w-16 text-right font-bold text-saffron-700">₹{line.qty * line.price}</span>
      </div>
    </div>
  );
}
