"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderByCode } from "@/lib/data";
import Diya from "@/components/Diya";
import UpiQr from "@/components/UpiQr";
import { r2, qtyLabel, isLoose } from "@/lib/format";

const STEPS = ["new", "accepted", "ready", "completed"];
const LABEL = {
  new: "Order sent",
  accepted: "Accepted",
  ready: "Ready",
  completed: "Completed",
};

export default function OrderPage() {
  const params = useParams();
  const codes = decodeURIComponent(params.code).split(",").map((c) => c.trim()).filter(Boolean);
  const [orders, setOrders] = useState(undefined);
  const key = codes.join(",");

  useEffect(() => {
    let stop = false;
    async function load() {
      const all = await Promise.all(codes.map((c) => getOrderByCode(c)));
      if (!stop) setOrders(all);
    }
    load();
    const t = setInterval(load, 10000);
    return () => {
      stop = true;
      clearInterval(t);
    };
    // eslint-disable-next-line
  }, [key]);

  if (orders === undefined) return <p className="text-gray-500">Loading…</p>;
  if (orders.every((o) => !o))
    return (
      <div className="card">
        <p>We could not find this order code.</p>
        <Link href="/" className="btn mt-3">Go home</Link>
      </div>
    );

  const found = orders.filter(Boolean);
  const many = found.length > 1;

  return (
    <div className="space-y-6">
      <div className="card relative overflow-hidden border-2 border-gold text-center">
        <div className="font-serif text-sm tracking-widest text-gold-dark">॥ धन्यवाद ॥</div>
        <div className="flex justify-center">
          <Diya className="h-20 w-20" />
        </div>
        <h1 className="title mt-1 text-xl">
          {many ? `Thank you! ${found.length} orders placed 🙏` : "Thank you! Your order is placed 🙏"}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {many
            ? "Each shop has its own order code and its own payment. Save this page: you can open it again any time."
            : "Save your order code. You can open this page again any time."}
        </p>
      </div>
      {found.map((o) => (
        <OrderCard key={o.code} order={o} />
      ))}
    </div>
  );
}

function OrderCard({ order }) {
  const cancelled = order.status === "cancelled";
  const stepIndex = STEPS.indexOf(order.status);
  const total = r2(Number(order.subtotal));

  return (
    <div className="space-y-3">
      <div className="card border-t-4 border-t-saffron-500 text-center">
        <div className="font-serif text-lg font-bold text-maroon">🛕 {order.shop_name}</div>
        <p className="mt-2 text-sm text-gray-600">Order code</p>
        <div className="mx-auto mt-1 inline-block rounded-xl border-2 border-dashed border-gold bg-amber-50 px-6 py-2 font-serif text-3xl font-bold tracking-widest text-saffron-700">
          {order.code}
        </div>
      </div>

      <div className="card space-y-3">
        {cancelled ? (
          <div className="font-semibold text-red-600">This order was cancelled.</div>
        ) : (
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center text-center text-xs">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                    i <= stepIndex ? "bg-saffron-600 text-white" : "bg-amber-100 text-gray-400"
                  }`}
                >
                  {i <= stepIndex ? "✓" : i + 1}
                </div>
                <div className={`mt-1 ${i <= stepIndex ? "font-semibold text-maroon" : "text-gray-400"}`}>
                  {s === "ready" ? (order.fulfilment === "pickup" ? "Ready for pickup" : "Out for delivery") : LABEL[s]}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="border-t border-amber-100 pt-3 text-sm text-gray-600">
          {order.fulfilment === "pickup" ? (
            <>🛕 Pickup from <b>{order.shop_name}</b>{order.shop_address ? `, ${order.shop_address}` : ""}. Show your code at the shop.</>
          ) : (
            <>🚚 Free home delivery by <b>{order.shop_name}</b>.</>
          )}
        </div>
        {order.shop_phone && (
          <a href={`tel:${order.shop_phone}`} className="inline-block text-sm font-semibold text-saffron-700 underline">
            📞 Call shop: {order.shop_phone}
          </a>
        )}
      </div>

      <div className="card divide-y divide-amber-100">
        {order.items.map((i, idx) => (
          <div key={idx} className="py-2 text-sm">
            <div className="flex justify-between">
              <span>{i.name} {isLoose(i.unit) ? `— ${qtyLabel(i.qty, i.unit)}` : `× ${i.qty}`}</span>
              <span>₹{r2(i.qty * Number(i.price))}</span>
            </div>
            {i.note && <div className="mt-0.5 text-xs text-gray-500">{i.note}</div>}
          </div>
        ))}
        <div className="flex justify-between pt-2 font-bold text-maroon">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {!cancelled && (
        order.paid ? (
          <div className="card border-green-300 bg-green-50 text-center font-semibold text-green-700">✅ Paid. Thank you!</div>
        ) : order.shop_upi ? (
          <UpiQr upi={order.shop_upi} shopName={order.shop_name} amount={total} code={order.code} />
        ) : (
          <div className="card text-center text-sm text-gray-600">💵 Pay ₹{total} at the shop / on delivery.</div>
        )
      )}
    </div>
  );
}
