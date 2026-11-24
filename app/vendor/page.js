"use client";
import { useEffect, useState } from "react";
import { getSupabase, isConfigured } from "@/lib/supabase";
import VendorOrders from "@/components/VendorOrders";
import VendorProducts from "@/components/VendorProducts";
import DemoVendor from "@/components/DemoVendor";

export default function VendorPage() {
  const [session, setSession] = useState(undefined);
  const [shop, setShop] = useState(undefined);
  const [tab, setTab] = useState("orders");

  useEffect(() => {
    if (!isConfigured()) {
      setSession(null);
      return;
    }
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setShop(undefined);
      return;
    }
    getSupabase()
      .from("shops")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setShop(data));
  }, [session]);

  if (!isConfigured()) return <DemoVendor />;
  if (session === undefined) return <p className="text-gray-500">Loading…</p>;
  if (!session) return <AuthForm />;
  if (shop === undefined) return <p className="text-gray-500">Loading your shop…</p>;
  if (shop === null) return <ShopSetup userId={session.user.id} onDone={setShop} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-maroon">{shop.name}</h1>
          <p className="text-sm text-gray-600">Shopkeeper dashboard</p>
        </div>
        <button className="btn-outline !py-1" onClick={() => getSupabase().auth.signOut()}>
          Log out
        </button>
      </div>

      <div className="flex gap-2">
        {[
          ["orders", "Orders"],
          ["products", "My items"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === k ? "bg-saffron-600 text-white" : "bg-saffron-100 text-saffron-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "orders" ? <VendorOrders shop={shop} /> : <VendorProducts shop={shop} />}
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const sb = getSupabase();
    if (mode === "signup") {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Account created. Please check your email and click the confirmation link, then log in.");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-maroon">Sell on Pooja Bazaar</h1>
      <p className="text-gray-600">
        Own a pooja shop? List your items, get orders from customers nearby, and deliver or hand over
        with a pickup code.
      </p>
      <form onSubmit={submit} className="card space-y-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${mode === "login" ? "bg-saffron-600 text-white" : "bg-saffron-100 text-saffron-700"}`}>Log in</button>
          <button type="button" onClick={() => setMode("signup")} className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${mode === "signup" ? "bg-saffron-600 text-white" : "bg-saffron-100 text-saffron-700"}`}>Create account</button>
        </div>
        <input className="input" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" required minLength={6} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
      </form>
    </div>
  );
}

function ShopSetup({ userId, onDone }) {
  const [f, setF] = useState({ name: "", area: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const { data, error } = await getSupabase()
      .from("shops")
      .insert({ ...f, owner_id: userId })
      .select()
      .single();
    setBusy(false);
    if (error) setErr(error.message);
    else onDone(data);
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-maroon">Set up your shop</h1>
      <form onSubmit={submit} className="card space-y-3">
        <input className="input" required placeholder="Shop name" value={f.name} onChange={set("name")} />
        <input className="input" required placeholder="Area (e.g. Thane West)" value={f.area} onChange={set("area")} />
        <input className="input" required inputMode="tel" placeholder="Shop phone number" value={f.phone} onChange={set("phone")} />
        <textarea className="input" rows={2} required placeholder="Shop address" value={f.address} onChange={set("address")} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Saving…" : "Create my shop"}</button>
      </form>
    </div>
  );
}
