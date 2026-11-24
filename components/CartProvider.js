"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { kitSummary } from "@/lib/demo";

const CartContext = createContext(null);
const KEY = "pooja-cart-v2";

// cart = { shopId, shopName, items: [{ key, id, name, price, unit, category, qty, extraFor, note }] }
// An "extra" line has extraFor = id of the kit it was added with.
const EMPTY = { shopId: null, shopName: "", items: [] };

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch (e) {}
  }, [cart, ready]);

  // Returns false if the cart belongs to another shop (caller should ask to clear)
  function add(shop, product, opts = {}) {
    const { qty = 1, extraFor = null } = opts;
    if (cart.shopId && cart.shopId !== shop.id && cart.items.length > 0) return false;
    setCart((c) => {
      const items = [...c.items];
      const key = extraFor ? `${product.id}@${extraFor}` : product.id;
      const i = items.findIndex((x) => x.key === key);
      if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + qty };
      else
        items.push({
          key,
          id: product.id,
          name: product.name,
          price: Number(product.price),
          unit: product.unit,
          category: product.category,
          is_kit: Boolean(product.is_kit),
          qty,
          extraFor,
          note: product.kit_contents ? kitSummary(product.kit_contents) : "",
        });
      return { shopId: shop.id, shopName: shop.name, items };
    });
    return true;
  }

  function setQty(key, qty) {
    setCart((c) => {
      let items = c.items.map((x) => (x.key === key ? { ...x, qty } : x)).filter((x) => x.qty > 0);
      // if a kit is removed, its extras go too
      items = items.filter((x) => !x.extraFor || items.some((k) => k.id === x.extraFor && !k.extraFor));
      return items.length ? { ...c, items } : EMPTY;
    });
  }

  function clear() {
    setCart(EMPTY);
  }

  const count = cart.items.reduce((n, x) => n + x.qty, 0);
  const subtotal = cart.items.reduce((n, x) => n + x.qty * x.price, 0);

  return (
    <CartContext.Provider value={{ cart, add, setQty, clear, count, subtotal, ready }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
