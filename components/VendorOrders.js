"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import OrdersBoard from "./OrdersBoard";

export default function VendorOrders({ shop }) {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const { data, error } = await getSupabase()
      .from("orders")
      .select("*, order_items(*)")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setError(error.message);
    else
      setOrders(
        data.map((o) => ({
          ...o,
          key: o.id,
          items: (o.order_items || []).map((i) => ({ name: i.product_name, qty: i.qty, unit: i.unit, price: i.price, note: i.note })),
        }))
      );
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [shop.id]);

  async function update(order, patch) {
    await getSupabase().from("orders").update(patch).eq("id", order.id);
    load();
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!orders) return <p className="text-gray-500">Loading orders…</p>;
  return <OrdersBoard orders={orders} onUpdate={update} />;
}
