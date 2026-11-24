"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const KEY = "pooja-cart-v1";

// cart = { shopId, shopName, items: [{ id, name, price, unit, qty }] }
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
  function add(shop, product) {
    if (cart.shopId && cart.shopId !== shop.id && cart.items.length > 0) return false;
    setCart((c) => {
      const items = [...c.items];
      const i = items.findIndex((x) => x.id === product.id);
      if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + 1 };
      else
        items.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          unit: product.unit,
          qty: 1,
        });
      return { shopId: shop.id, shopName: shop.name, items };
    });
    return true;
  }

  function setQty(id, qty) {
    setCart((c) => {
      const items = c.items
        .map((x) => (x.id === id ? { ...x, qty } : x))
        .filter((x) => x.qty > 0);
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
