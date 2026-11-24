"use client";
import { useEffect, useState } from "react";
import ItemArt from "./ItemArt";

// Pop-up that shows what is inside a kit and lets the customer add extra items.
export default function KitSheet({ kit, items, onClose, onAdd }) {
  const [extras, setExtras] = useState({}); // { productId: qty }

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const extraList = items.filter((p) => !p.is_kit && p.id !== kit.id);
  const extrasTotal = extraList.reduce((n, p) => n + (extras[p.id] || 0) * Number(p.price), 0);
  const total = Number(kit.price) + extrasTotal;
  const extraCount = Object.values(extras).reduce((n, q) => n + q, 0);

  function change(id, d) {
    setExtras((e) => {
      const q = Math.max(0, (e[id] || 0) + d);
      const next = { ...e, [id]: q };
      if (q === 0) delete next[id];
      return next;
    });
  }

  function submit() {
    const chosen = extraList.filter((p) => extras[p.id]).map((p) => ({ product: p, qty: extras[p.id] }));
    onAdd(kit, chosen);
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 sm:items-center" onClick={onClose}>
      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-maroon shadow"
        >
          ×
        </button>

        <div className="overflow-y-auto">
          <ItemArt product={kit} className="h-48 w-full" />
          <div className="space-y-5 p-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-saffron-700">🧺 Pooja kit</div>
              <h2 className="title text-2xl">{kit.name}</h2>
              <div className="text-lg font-bold text-saffron-700">₹{Number(kit.price)}</div>
            </div>

            <section>
              <div className="divider-om mb-2 text-sm font-bold">What's inside</div>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {(kit.kit_contents || []).map((k, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg bg-white px-3 py-1.5 text-sm shadow-sm">
                    <span className="text-green-600">✓</span>
                    <span className="flex-1">{k.name}</span>
                    <span className="whitespace-nowrap text-gray-500">{k.qty} {k.unit}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="divider-om mb-1 text-sm font-bold">Add extra items (optional)</div>
              <p className="mb-2 text-xs text-gray-600">Forgot something? Add it here and it will be packed with your kit.</p>
              <div className="space-y-2">
                {extraList.map((p) => {
                  const q = extras[p.id] || 0;
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white p-2 shadow-sm">
                      <ItemArt product={p} className="h-12 w-12 shrink-0 overflow-hidden rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-maroon">{p.name}</div>
                        <div className="text-xs text-gray-500">₹{Number(p.price)} / {p.unit}</div>
                      </div>
                      {q === 0 ? (
                        <button className="btn-outline !px-3 !py-1 text-sm" onClick={() => change(p.id, 1)}>Add</button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button className="btn-outline !px-2.5 !py-0.5" onClick={() => change(p.id, -1)}>−</button>
                          <span className="w-4 text-center font-bold">{q}</span>
                          <button className="btn-outline !px-2.5 !py-0.5" onClick={() => change(p.id, 1)}>+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="border-t border-amber-200 bg-white p-4">
          {extraCount > 0 && (
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>Kit ₹{Number(kit.price)} + {extraCount} extra item{extraCount > 1 ? "s" : ""}</span>
              <span>+ ₹{extrasTotal}</span>
            </div>
          )}
          <button className="btn w-full !py-3 text-lg" onClick={submit}>
            🛒 Add to cart · ₹{total}
          </button>
        </div>
      </div>
    </div>
  );
}
