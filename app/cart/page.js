"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, FREE_DELIVERY_MIN } from "@/lib/supabase";
import { useCart } from "@/components/CartProvider";

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
      <div className="card text-center">
        <p className="mb-3">Your cart is empty.</p>
        <Link href="/" className="btn">Browse shops</Link>
      </div>
    );
  }

  const deliveryOk = subtotal >= FREE_DELIVERY_MIN;
  const effectiveMode = deliveryOk ? mode : "pickup";

  async function placeOrder(e) {
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
    const { data, error } = await getSupabase().rpc("place_order", {
      p_shop_id: cart.shopId,
      p_name: name,
      p_phone: phone,
      p_address: address,
      p_fulfilment: effectiveMode,
      p_items: cart.items.map((i) => ({ product_id: i.id, qty: i.qty })),
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    clear();
    router.push(`/order/${data}`);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-maroon">Your cart</h1>
      <p className="text-sm text-gray-600">From <b>{cart.shopName}</b></p>

      <div className="card divide-y divide-saffron-100">
        {cart.items.map((i) => (
          <div key={i.id} className="flex items-center justify-between gap-3 py-2">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-sm text-gray-500">₹{i.price} / {i.unit}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-outline !px-3 !py-1" onClick={() => setQty(i.id, i.qty - 1)}>−</button>
              <span className="w-5 text-center font-semibold">{i.qty}</span>
              <button className="btn-outline !px-3 !py-1" onClick={() => setQty(i.id, i.qty + 1)}>+</button>
              <span className="w-16 text-right font-semibold">₹{i.qty * i.price}</span>
            </div>
          </div>
        ))}
        <div className="flex justify-between pt-3 text-lg font-bold">
          <span>Total</span>
          <span>₹{subtotal}</span>
        </div>
      </div>

      <form onSubmit={placeOrder} className="card space-y-4">
        <h2 className="text-lg font-semibold">How would you like to get it?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`cursor-pointer rounded-lg border p-3 ${effectiveMode === "pickup" ? "border-saffron-600 bg-saffron-50" : "border-saffron-200"}`}>
            <input type="radio" className="mr-2" checked={effectiveMode === "pickup"} onChange={() => setMode("pickup")} />
            <b>Pickup from shop</b>
            <div className="text-sm text-gray-600">Show your order code at the shop</div>
          </label>
          <label className={`rounded-lg border p-3 ${deliveryOk ? "cursor-pointer" : "opacity-60"} ${effectiveMode === "delivery" ? "border-saffron-600 bg-saffron-50" : "border-saffron-200"}`}>
            <input type="radio" className="mr-2" disabled={!deliveryOk} checked={effectiveMode === "delivery"} onChange={() => setMode("delivery")} />
            <b>Free home delivery</b>
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
        <button className="btn w-full" disabled={busy}>{busy ? "Placing order…" : "Place order (pay at shop / on delivery)"}</button>
      </form>
    </div>
  );
}
