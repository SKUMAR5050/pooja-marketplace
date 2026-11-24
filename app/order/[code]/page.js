"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const STATUS = {
  new: "Order sent to the shop",
  accepted: "Shop accepted your order",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function OrderPage() {
  const { code } = useParams();
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    let stop = false;
    async function load() {
      const { data } = await getSupabase().rpc("get_order", { p_code: code });
      if (!stop) setOrder(data || null);
    }
    load();
    const t = setInterval(load, 15000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [code]);

  if (order === undefined) return <p className="text-gray-500">Loading…</p>;
  if (order === null)
    return (
      <div className="card">
        <p>We could not find this order code.</p>
        <Link href="/" className="btn mt-3">Go home</Link>
      </div>
    );

  const readyText =
    order.status === "ready"
      ? order.fulfilment === "pickup"
        ? "Ready for pickup"
        : "Out for delivery"
      : STATUS[order.status];

  return (
    <div className="space-y-5">
      <div className="card text-center">
        <div className="text-4xl">🙏</div>
        <h1 className="mt-1 text-xl font-bold text-maroon">Thank you! Your order is placed</h1>
        <p className="mt-3 text-sm text-gray-600">Your order code</p>
        <div className="mx-auto mt-1 inline-block rounded-lg bg-saffron-100 px-6 py-2 text-3xl font-bold tracking-widest text-saffron-700">
          {order.code}
        </div>
        <p className="mt-3 text-sm text-gray-600">Save this code. You can open this page again any time.</p>
      </div>

      <div className="card space-y-1">
        <div className="text-lg font-semibold">{readyText}</div>
        <div className="text-sm text-gray-600">
          {order.fulfilment === "pickup" ? (
            <>Pickup from <b>{order.shop_name}</b>{order.shop_address ? `, ${order.shop_address}` : ""}. Show your code at the shop.</>
          ) : (
            <>Free home delivery by <b>{order.shop_name}</b>.</>
          )}
        </div>
        {order.shop_phone && (
          <a href={`tel:${order.shop_phone}`} className="inline-block text-sm text-saffron-700 underline">
            Call shop: {order.shop_phone}
          </a>
        )}
      </div>

      <div className="card divide-y divide-saffron-100">
        {order.items.map((i, idx) => (
          <div key={idx} className="flex justify-between py-2 text-sm">
            <span>{i.name} × {i.qty}</span>
            <span>₹{i.qty * Number(i.price)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-2 font-bold">
          <span>Total (pay at shop / on delivery)</span>
          <span>₹{Number(order.subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
