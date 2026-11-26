"use client";
import { useEffect, useState } from "react";
import { getSupabase, COMMISSION_PCT } from "@/lib/supabase";
import { r2 } from "@/lib/format";
import UpiQr from "./UpiQr";

export default function VendorEarnings({ shop, onShopChange }) {
  const [orders, setOrders] = useState(null);
  const [upi, setUpi] = useState(shop.upi_id || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
    getSupabase()
      .from("orders")
      .select("id,code,subtotal,status,paid,created_at")
      .eq("shop_id", shop.id)
      .gte("created_at", since)
      .then(({ data, error }) => (error ? setErr(error.message) : setOrders(data)));
  }, [shop.id]);

  async function saveUpi(e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    const v = upi.trim();
    if (v && !/^[\w.\-]{2,}@[\w.\-]{2,}$/.test(v)) {
      setErr("That does not look like a UPI ID. It should look like name@bank.");
      return;
    }
    const { data, error } = await getSupabase()
      .from("shops")
      .update({ upi_id: v || null })
      .eq("id", shop.id)
      .select()
      .single();
    if (error) setErr(error.message);
    else {
      onShopChange(data);
      setMsg(v ? "Saved. Customers will now see your pay QR." : "UPI ID removed.");
    }
  }

  const live = (orders || []).filter((o) => o.status !== "cancelled");
  const done = live.filter((o) => o.status === "completed");
  const sum = (list) => r2(list.reduce((n, o) => n + Number(o.subtotal), 0));
  const today = new Date().toDateString();
  const todayDone = done.filter((o) => new Date(o.created_at).toDateString() === today);
  const weekDone = sum(done);
  const fee = r2((weekDone * COMMISSION_PCT) / 100);

  return (
    <div className="space-y-5">
      <form onSubmit={saveUpi} className="card space-y-3">
        <h2 className="font-semibold">Get paid by UPI</h2>
        <p className="text-sm text-gray-600">
          Add your shop’s UPI ID. Customers will see a pay QR with the exact amount for every order, and the money goes straight to you.
        </p>
        <input className="input" placeholder="e.g. gangashop@okhdfcbank" value={upi} onChange={(e) => setUpi(e.target.value)} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-green-700">{msg}</p>}
        <button className="btn w-full">Save UPI ID</button>
      </form>

      {shop.upi_id && (
        <div>
          <p className="mb-2 text-sm text-gray-600">This is how the QR looks to your customer (sample ₹1):</p>
          <UpiQr upi={shop.upi_id} shopName={shop.name} amount={1} code="SAMPLE" />
        </div>
      )}

      <div className="card space-y-2">
        <h2 className="font-semibold">Last 7 days</h2>
        {!orders && !err && <p className="text-gray-500">Loading…</p>}
        {orders && (
          <>
            <Row label="Completed orders" value={`${done.length}`} />
            <Row label="Completed sales" value={`₹${weekDone}`} strong />
            <Row label="Today (completed)" value={`₹${sum(todayDone)}`} />
            <Row label="Waiting to be completed" value={`${live.length - done.length} orders · ₹${sum(live) - weekDone > 0 ? r2(sum(live) - weekDone) : 0}`} />
            <Row label="Payment pending" value={`₹${sum(live.filter((o) => !o.paid))}`} />
            {COMMISSION_PCT > 0 && <Row label={`Pooja Bazaar fee (${COMMISSION_PCT}%)`} value={`₹${fee}`} />}
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={strong ? "text-lg font-bold text-maroon" : "font-semibold"}>{value}</span>
    </div>
  );
}
