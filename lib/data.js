// One place for all data access. Uses Supabase when keys exist, otherwise demo data.
import { getSupabase, isConfigured, FREE_DELIVERY_MIN } from "./supabase";
import { r2 } from "./format";
import { DEMO_SHOPS, demoProducts, loadOrders, saveOrders, kitSummary } from "./demo";

export function isDemo() {
  return !isConfigured();
}

export async function listShops() {
  if (isDemo()) return DEMO_SHOPS;
  const { data, error } = await getSupabase()
    .from("shops")
    .select("id,name,area,address,pincode")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getShop(id) {
  if (isDemo()) return DEMO_SHOPS.find((s) => s.id === id) || null;
  const { data } = await getSupabase().from("shops").select("*").eq("id", id).maybeSingle();
  return data;
}

export async function listProducts(shopId) {
  if (isDemo()) return demoProducts(shopId, { onlyInStock: true });
  const { data } = await getSupabase()
    .from("products")
    .select("*, kit_items(item_name,qty,unit)")
    .eq("shop_id", shopId)
    .eq("in_stock", true)
    .order("category")
    .order("name");
  return (data || []).map((p) => ({
    ...p,
    kit_contents: p.is_kit
      ? (p.kit_items || []).map((k) => ({ name: k.item_name, qty: k.qty, unit: k.unit }))
      : null,
  }));
}

// Search items across all shops. Returns [{ ...product, shop: {id,name,area,pincode} }] cheapest first.
export async function searchItems(query, pincode) {
  const q = String(query || "").trim().toLowerCase();
  const pin = String(pincode || "").trim();
  if (q.length < 2) return [];
  if (isDemo()) {
    const out = [];
    for (const shop of DEMO_SHOPS) {
      if (pin && !(shop.pincode || "").startsWith(pin)) continue;
      for (const p of demoProducts(shop.id, { onlyInStock: true })) {
        if ((p.name + " " + (p.brand || "")).toLowerCase().includes(q)) out.push({ ...p, shop });
      }
    }
    return out.sort((a, b) => a.price - b.price);
  }
  const clean = q.replace(/[%,()*\\]/g, "");
  if (clean.length < 2) return [];
  let req = getSupabase()
    .from("products")
    .select("id,name,brand,pack_size,barcode,price,unit,step,stock_qty,category,is_kit,shop_id,shops!inner(id,name,area,pincode,is_active)")
    .or(`name.ilike.%${clean}%,brand.ilike.%${clean}%,barcode.eq.${clean}`)
    .eq("in_stock", true)
    .eq("shops.is_active", true)
    .order("price")
    .limit(60);
  if (pin) req = req.like("shops.pincode", `${pin}%`);
  const { data, error } = await req;
  if (error) throw new Error(error.message);
  return (data || []).map((p) => ({ ...p, shop: p.shops }));
}

function makeCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "PJ" + s;
}

// items: [{ id, qty, extra }]  (extra = true when added as an extra with a kit)
export async function placeOrder({ shopId, name, phone, address, mode, items }) {
  if (isDemo()) {
    const products = demoProducts(shopId, { onlyInStock: true });
    let subtotal = 0;
    const lines = [];
    for (const it of items) {
      const p = products.find((x) => x.id === it.id);
      if (!p) throw new Error("An item is no longer available");
      subtotal = r2(subtotal + p.price * it.qty);
      const note = p.kit_contents
        ? "Includes: " + kitSummary(p.kit_contents)
        : it.extra
        ? "Extra with kit"
        : undefined;
      lines.push({ name: p.name, price: p.price, qty: it.qty, unit: p.unit, note });
      if (p.stock_qty !== null && p.stock_qty !== undefined && it.qty > p.stock_qty)
        throw new Error(`Only ${p.stock_qty} of ${p.name} left`);
    }
    if (mode === "delivery" && subtotal < FREE_DELIVERY_MIN)
      throw new Error("Free delivery is available on orders of 500 or more");
    const code = makeCode();
    const orders = loadOrders();
    orders.unshift({
      code,
      shop_id: shopId,
      customer_name: name,
      customer_phone: phone,
      address: mode === "delivery" ? address : null,
      fulfilment: mode,
      subtotal,
      paid: false,
      status: "new",
      created_at: new Date().toISOString(),
      items: lines,
    });
    saveOrders(orders);
    return code;
  }
  const { data, error } = await getSupabase().rpc("place_order", {
    p_shop_id: shopId,
    p_name: name,
    p_phone: phone,
    p_address: address,
    p_fulfilment: mode,
    p_items: items.map((i) => ({ product_id: i.id, qty: i.qty, extra: Boolean(i.extra) })),
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function getOrderByCode(code) {
  if (isDemo()) {
    const o = loadOrders().find((x) => x.code === String(code).toUpperCase());
    if (!o) return null;
    const shop = DEMO_SHOPS.find((s) => s.id === o.shop_id) || {};
    return {
      code: o.code,
      status: o.status,
      fulfilment: o.fulfilment,
      subtotal: o.subtotal,
      paid: Boolean(o.paid),
      shop_upi: shop.upi,
      created_at: o.created_at,
      shop_name: shop.name,
      shop_address: shop.address,
      shop_phone: shop.phone,
      items: o.items,
    };
  }
  const { data } = await getSupabase().rpc("get_order", { p_code: code });
  return data || null;
}
