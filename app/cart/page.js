"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/lib/data";
import { FREE_DELIVERY_MIN } from "@/lib/supabase";
import { r2, r3, qtyLabel, isLoose, canAddMore } from "@/lib/format";
import { useCart } from "@/components/CartProvider";
import Diya from "@/components/Diya";
import ItemArt from "@/components/ItemArt";

export default function CartPage() {
  const router = useRouter();
  const { cart, groups, setQty, removeShop, clear, subtotal, ready } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addr, setAddr] = useState({ house: "", street: "", landmark: "", pin: "" });
  const setA = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });
  const [modes, setModes] = useState({}); // shopId -> "pickup" | "delivery"
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState([]); // codes already placed if a later shop failed

  if (!ready) return <p className="text-gray-500">Loading…</p>;

  if (cart.items.length === 0 && placed.length === 0) {
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

  const modeOf = (g) => (g.subtotal >= FREE_DELIVERY_MIN && modes[g.shopId] === "delivery" ? "delivery" : "pickup");
  const anyDelivery = groups.some((g) => modeOf(g) === "delivery");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!/^[0-9+\s-]{10,15}$/.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (anyDelivery) {
      if (!addr.house.trim() || !addr.street.trim() || !addr.landmark.trim()) {
        setError("Please fill house / flat, street / area and a landmark for delivery.");
        return;
      }
      if (!/^[0-9]{6}$/.test(addr.pin.trim())) {
        setError("Please enter a 6-digit pincode for delivery.");
        return;
      }
    }
    const address = anyDelivery
      ? `${addr.house.trim()}, ${addr.street.trim()}\nLandmark: ${addr.landmark.trim()}\nPincode: ${addr.pin.trim()}`
      : "";
    setBusy(true);
    const codes = [...placed];
    for (const g of groups) {
      try {
        const code = await placeOrder({
          shopId: g.shopId,
          name,
          phone,
          address,
          mode: modeOf(g),
          items: g.items.map((i) => ({ id: i.id, qty: i.qty, extra: Boolean(i.extraFor) })),
        });
        codes.push(code);
        removeShop(g.shopId);
      } catch (err) {
        setPlaced(codes);
        setError(`${g.shopName}: ${err.message}`);
        setBusy(false);
        return;
      }
    }
    clear();
    router.push(`/order/${codes.join(",")}`);
  }

  return (
    <div className="space-y-5">
      <h1 className="title text-2xl">🛒 Your pooja cart</h1>
      {groups.length > 1 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-gray-700">
          Your items are from <b>{groups.length} shops</b>. Each shop gets its own order, with its own order code
          and its own payment.
        </p>
      )}

      {placed.length > 0 && (
        <div className="card border-green-300 bg-green-50 text-sm">
          ✅ Already placed: {placed.map((c) => (
            <Link key={c} href={`/order/${c}`} className="mr-2 font-bold text-saffron-700 underline">{c}</Link>
          ))}
          <div className="mt-1 text-gray-600">Fix the problem below and press the button again for the rest.</div>
        </div>
      )}

      {groups.map((g) => {
        const deliveryOk = g.subtotal >= FREE_DELIVERY_MIN;
        const mode = modeOf(g);
        return (
          <div key={g.shopId} className="card divide-y divide-amber-100">
            <div className="flex items-center justify-between pb-2">
              <div className="font-serif text-lg font-bold text-maroon">🛕 {g.shopName}</div>
              <button className="text-xs text-red-600 underline" onClick={() => removeShop(g.shopId)}>Remove shop</button>
            </div>
            {g.items
              .filter((i) => !i.extraFor)
              .map((i) => (
                <div key={i.key}>
                  <CartLine line={i} setQty={setQty} />
                  {g.items
                    .filter((x) => x.extraFor === i.id)
                    .map((x) => (
                      <div key={x.key} className="ml-6 border-l-2 border-amber-200 pl-3">
                        <CartLine line={x} setQty={setQty} extra />
                      </div>
                    ))}
                </div>
              ))}
            <div className="flex justify-between pt-3 font-bold text-maroon">
              <span>{g.shopName} total</span>
              <span>₹{g.subtotal}</span>
            </div>
            <div className="grid gap-2 pt-3 sm:grid-cols-2">
              <label className={`cursor-pointer rounded-xl border-2 p-2.5 text-sm ${mode === "pickup" ? "border-saffron-600 bg-saffron-50" : "border-amber-200"}`}>
                <input type="radio" className="mr-2" checked={mode === "pickup"} onChange={() => setModes({ ...modes, [g.shopId]: "pickup" })} />
                <b>🛕 Pickup from shop</b>
                <div className="text-gray-600">Show your order code</div>
              </label>
              <label className={`rounded-xl border-2 p-2.5 text-sm ${deliveryOk ? "cursor-pointer" : "opacity-60"} ${mode === "delivery" ? "border-saffron-600 bg-saffron-50" : "border-amber-200"}`}>
                <input type="radio" className="mr-2" disabled={!deliveryOk} checked={mode === "delivery"} onChange={() => setModes({ ...modes, [g.shopId]: "delivery" })} />
                <b>🚚 Free home delivery</b>
                <div className="text-gray-600">
                  {deliveryOk ? "Delivered by the shop" : `Add ₹${r2(FREE_DELIVERY_MIN - g.subtotal)} more from this shop`}
                </div>
              </label>
            </div>
          </div>
        );
      })}

      <div className="flex justify-between px-1 text-lg font-bold text-maroon">
        <span>Grand total</span>
        <span>₹{subtotal}</span>
      </div>

      <form onSubmit={submit} className="card space-y-3">
        <h2 className="title text-lg">Your details</h2>
        <input className="input" required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" required inputMode="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {anyDelivery && (
          <div className="space-y-3 rounded-xl border-2 border-amber-200 p-3">
            <div className="text-sm font-semibold text-maroon">🚚 Delivery address</div>
            <input className="input" required placeholder="House / flat no. and building name" value={addr.house} onChange={setA("house")} />
            <input className="input" required placeholder="Street / area" value={addr.street} onChange={setA("street")} />
            <input className="input" required placeholder="Landmark (e.g. near Ganesh temple)" value={addr.landmark} onChange={setA("landmark")} />
            <input className="input" required inputMode="numeric" maxLength={6} placeholder="Pincode (6 digits)" value={addr.pin} onChange={(e) => setAddr({ ...addr, pin: e.target.value.replace(/\D/g, "") })} />
          </div>
        )}
        <p className="text-xs text-gray-500">
          You pay each shop directly: scan the shop’s UPI QR on the next page, or pay cash at pickup / on delivery.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn w-full !py-3 text-lg" disabled={busy}>
          {busy ? "Placing order…" : groups.length > 1 ? `🙏 Place ${groups.length} orders` : "🙏 Place order"}
        </button>
      </form>
    </div>
  );
}

function CartLine({ line, setQty, extra = false }) {
  const loose = isLoose(line.unit);
  const more = canAddMore(line, line.qty);
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
        <button className="btn-outline !px-3 !py-1" onClick={() => setQty(line.key, r3(line.qty - line.step))}>−</button>
        <span className={`${loose ? "min-w-[3.5rem]" : "w-5"} text-center font-bold`}>{qtyLabel(line.qty, line.unit)}</span>
        <button className="btn-outline !px-3 !py-1 disabled:opacity-40" disabled={!more} onClick={() => setQty(line.key, r3(line.qty + line.step))}>+</button>
        <span className="w-16 text-right font-bold text-saffron-700">₹{r2(line.qty * line.price)}</span>
      </div>
    </div>
  );
}
