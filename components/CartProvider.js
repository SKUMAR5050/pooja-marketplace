"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { kitSummary } from "@/lib/demo";
import { r2, r3, stepOf, fullName } from "@/lib/format";

const CartContext = createContext(null);
const KEY = "pooja-cart-v3";
const OLD_KEY = "pooja-cart-v2";

// cart = { items: [{ key, shopId, shopName, id, name, price, unit, step, stock_qty, category, qty, extraFor, note }] }
// Items from many shops can sit in one cart. At checkout they split into one order per shop.
// An "extra" line has extraFor = id of the kit (same shop) it was added with.
const EMPTY = { items: [] };

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setCart(JSON.parse(saved));
      else {
        // bring over an older single-shop cart
        const old = JSON.parse(localStorage.getItem(OLD_KEY) || "null");
        if (old && old.items && old.items.length)
          setCart({
            items: old.items.map((x) => ({
              ...x,
              key: `${old.shopId}:${x.key}`,
              shopId: old.shopId,
              shopName: old.shopName,
              step: x.step || 1,
            })),
          });
      }
    } catch (e) {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch (e) {}
  }, [cart, ready]);

  function add(shop, product, opts = {}) {
    const { qty = stepOf(product), extraFor = null } = opts;
    setCart((c) => {
      const items = [...c.items];
      const key = `${shop.id}:${product.id}${extraFor ? "@" + extraFor : ""}`;
      const i = items.findIndex((x) => x.key === key);
      if (i >= 0) items[i] = { ...items[i], qty: r3(items[i].qty + qty) };
      else
        items.push({
          key,
          shopId: shop.id,
          shopName: shop.name,
          id: product.id,
          name: fullName(product),
          price: Number(product.price),
          unit: product.unit,
          step: stepOf(product),
          stock_qty: product.stock_qty ?? null,
          category: product.category,
          is_kit: Boolean(product.is_kit),
          qty: r3(qty),
          extraFor,
          note: product.kit_contents ? kitSummary(product.kit_contents) : "",
        });
      return { items };
    });
    return true;
  }

  function setQty(key, qty) {
    setCart((c) => {
      let items = c.items.map((x) => (x.key === key ? { ...x, qty: r3(qty) } : x)).filter((x) => x.qty > 0);
      // if a kit is removed, its extras go too
      items = items.filter(
        (x) => !x.extraFor || items.some((k) => k.shopId === x.shopId && k.id === x.extraFor && !k.extraFor)
      );
      return { items };
    });
  }

  function removeShop(shopId) {
    setCart((c) => ({ items: c.items.filter((x) => x.shopId !== shopId) }));
  }

  function clear() {
    setCart(EMPTY);
  }

  const count = cart.items.filter((x) => !x.extraFor).length;
  const subtotal = r2(cart.items.reduce((n, x) => n + x.qty * x.price, 0));

  // [{ shopId, shopName, items, subtotal }]
  const groups = [];
  cart.items.forEach((x) => {
    let g = groups.find((y) => y.shopId === x.shopId);
    if (!g) groups.push((g = { shopId: x.shopId, shopName: x.shopName, items: [], subtotal: 0 }));
    g.items.push(x);
    g.subtotal = r2(g.subtotal + x.qty * x.price);
  });

  return (
    <CartContext.Provider value={{ cart, groups, add, setQty, removeShop, clear, count, subtotal, ready }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
