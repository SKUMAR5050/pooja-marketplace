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
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!isConfigured()) {
      setSession(null);
      return;
    }
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((e, s) => {
      if (e === "PASSWORD_RECOVERY") setRecovering(true);
      setSession(s);
    });
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
  if (recovering && session) return <NewPassword onDone={() => setRecovering(false)} />;
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

function EyeIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M3 3l18 18" />}
    </svg>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        className="input !pr-12"
        type={show ? "text" : "password"}
        required
        minLength={6}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-saffron-700"
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
}

function AuthForm() {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setOk("");
    const sb = getSupabase();
    if (mode === "forgot") {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/vendor" });
      if (error) setMsg(error.message);
      else setOk("Reset link sent. Check your email (and Spam), then click the link to set a new password.");
    } else if (mode === "signup") {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else if (!data.session) setOk("Account created. Please check your email and click the confirmation link, then log in.");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
    }
    setBusy(false);
  }

  const tab = (m, label) => (
    <button type="button" onClick={() => { setMode(m); setMsg(""); setOk(""); }} className={`flex-1 rounded-lg py-1.5 text-sm font-medium ${mode === m ? "bg-saffron-600 text-white" : "bg-saffron-100 text-saffron-700"}`}>{label}</button>
  );

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-maroon">Sell on Pooja Bazaar</h1>
      <p className="text-gray-600">
        Own a pooja shop? List your items, get orders from customers nearby, and deliver or hand over
        with a pickup code.
      </p>
      <form onSubmit={submit} className="card space-y-3">
        {mode === "forgot" ? (
          <p className="text-sm text-gray-700">Enter your email. We will send you a link to set a new password.</p>
        ) : (
          <div className="flex gap-2">
            {tab("login", "Log in")}
            {tab("signup", "Create account")}
          </div>
        )}
        <input className="input" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {mode !== "forgot" && (
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 characters)" />
        )}
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        {ok && <p className="text-sm text-green-700">{ok}</p>}
        <button className="btn w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "forgot" ? "Send reset link" : mode === "login" ? "Log in" : "Create account"}
        </button>
        {mode === "login" && (
          <button type="button" className="block w-full text-center text-sm font-semibold text-saffron-700 hover:underline" onClick={() => { setMode("forgot"); setMsg(""); setOk(""); }}>
            Forgot password?
          </button>
        )}
        {mode === "forgot" && (
          <button type="button" className="block w-full text-center text-sm font-semibold text-saffron-700 hover:underline" onClick={() => { setMode("login"); setMsg(""); setOk(""); }}>
            ← Back to log in
          </button>
        )}
      </form>
    </div>
  );
}

function NewPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { error } = await getSupabase().auth.updateUser({ password });
    setBusy(false);
    if (error) setMsg(error.message);
    else onDone();
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-maroon">Set a new password</h1>
      <form onSubmit={submit} className="card space-y-3">
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (min 6 characters)" />
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Saving…" : "Save new password"}</button>
      </form>
    </div>
  );
}

function ShopSetup({ userId, onDone }) {
  const [f, setF] = useState({ name: "", area: "", pincode: "", phone: "", address: "" });
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
        <input className="input" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} title="6-digit pincode" placeholder="Pincode (6 digits, e.g. 400078)" value={f.pincode} onChange={set("pincode")} />
        <input className="input" required inputMode="tel" placeholder="Shop phone number" value={f.phone} onChange={set("phone")} />
        <textarea className="input" rows={2} required placeholder="Shop address" value={f.address} onChange={set("address")} />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Saving…" : "Create my shop"}</button>
      </form>
    </div>
  );
}
