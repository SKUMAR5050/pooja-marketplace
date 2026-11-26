import { LOOSE_UNITS } from "./supabase";

export const r2 = (n) => Math.round(Number(n) * 100) / 100;
export const r3 = (n) => Math.round(Number(n) * 1000) / 1000;
export const isLoose = (unit) => LOOSE_UNITS.includes(String(unit || "").trim().toLowerCase());
export const stepOf = (p) => (Number(p && p.step) > 0 ? Number(p.step) : 1);

// "0.5 kg" for loose items, "2" for counted items
export function qtyLabel(qty, unit) {
  return isLoose(unit) ? `${r3(qty)} ${unit}` : `${r3(qty)}`;
}

// Name as shown to customers: Brand + name + pack size
export function fullName(p) {
  return [p.brand, p.name].filter(Boolean).join(" ") + (p.pack_size ? ` (${p.pack_size})` : "");
}

// Stock tag for customers, or "" when not low / not tracked
export function lowStockTag(p) {
  if (p.stock_qty === null || p.stock_qty === undefined) return "";
  const left = Number(p.stock_qty);
  if (left > 5 * stepOf(p)) return "";
  return `Only ${r3(left)}${isLoose(p.unit) ? " " + p.unit : ""} left`;
}

// Can one more step be added given what is already in the cart?
export function canAddMore(p, inCart) {
  if (p.stock_qty === null || p.stock_qty === undefined) return true;
  return r3(inCart + stepOf(p)) <= Number(p.stock_qty);
}

// UPI deep link / QR text
export function upiLink({ upi, name, amount, code }) {
  const q = new URLSearchParams({ pa: upi, pn: name || "Pooja shop", am: Number(amount).toFixed(2), cu: "INR", tn: code });
  return "upi://pay?" + q.toString().replace(/\+/g, "%20");
}
