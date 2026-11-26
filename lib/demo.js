// Sample data shown while the database is not connected (demo mode).
const ORDERS_KEY = "pooja-demo-orders-v1";
const STOCK_KEY = "pooja-demo-outofstock-v1";

export const DEMO_SHOPS = [
  { id: "demo-1", name: "Shree Ganesh Pooja Store", area: "Thane West", pincode: "400601", upi: "shreeganesh@upi", address: "Station Road, Thane West", phone: "9800000001", factor: 1 },
  { id: "demo-2", name: "Laxmi Pooja Bhandar", area: "Dombivli East", pincode: "421201", upi: "laxmibhandar@upi", address: "Near Ram Mandir, Dombivli East", phone: "9800000002", factor: 1.05 },
  { id: "demo-3", name: "Om Sai Flowers & Pooja Samagri", area: "Bhandup West", pincode: "400078", upi: "omsaiflowers@upi", address: "LBS Marg, Bhandup West", phone: "9800000003", factor: 0.95 },
];

const BASE = [
  ["Agarbatti (pack)", "Incense & Dhoop", 40, "pack"],
  ["Dhoop sticks (pack)", "Incense & Dhoop", 50, "pack"],
  ["Camphor (kapoor)", "Incense & Dhoop", 30, "pack"],
  ["Havan samagri", "Incense & Dhoop", 160, "kg", 0.25],
  ["Fresh flower garland", "Flowers & Garlands", 60, "piece"],
  ["Loose marigold flowers", "Flowers & Garlands", 40, "250 g"],
  ["Lotus flower", "Flowers & Garlands", 25, "piece"],
  ["Tulsi leaves bunch", "Flowers & Garlands", 15, "bunch"],
  ["Coconut", "Coconut & Fruits", 35, "piece"],
  ["Banana (puja)", "Coconut & Fruits", 40, "dozen"],
  ["Betel leaves & supari", "Coconut & Fruits", 30, "set"],
  ["Cotton wicks (batti)", "Oil, Ghee & Diyas", 20, "pack"],
  ["Clay diya", "Oil, Ghee & Diyas", 10, "piece"],
  ["Pure ghee", "Oil, Ghee & Diyas", 150, "200 ml"],
  ["Sesame oil (til tel)", "Oil, Ghee & Diyas", 90, "200 ml"],
  ["Kumkum", "Kumkum & Haldi", 20, "pack"],
  ["Haldi (turmeric)", "Kumkum & Haldi", 20, "pack"],
  ["Sindoor", "Kumkum & Haldi", 25, "pack"],
  ["Roli & chawal set", "Kumkum & Haldi", 30, "set"],
  ["Ganesh idol (small)", "Idols & Frames", 180, "piece"],
  ["Laxmi-Ganesh frame", "Idols & Frames", 220, "piece"],
  ["Rudraksha mala", "Idols & Frames", 120, "piece"],
  ["Gangajal", "Incense & Dhoop", 40, "100 ml"],
  ["Akshata rice", "Kumkum & Haldi", 90, "kg", 0.25],
  ["Red puja cloth", "Idols & Frames", 120, "m", 0.5],
  ["Mauli (red thread)", "Kumkum & Haldi", 15, "roll"],
  ["Janeu (sacred thread)", "Kumkum & Haldi", 20, "piece"],
  ["Durva grass bunch", "Flowers & Garlands", 15, "bunch"],
  ["Complete puja samagri kit", "Puja Samagri Kits", 250, "kit"],
  ["Satyanarayan puja kit", "Puja Samagri Kits", 450, "kit"],
  ["Ganesh puja kit", "Puja Samagri Kits", 320, "kit"],
];

// What is inside each kit (shown to the customer before buying)
export const KIT_CONTENTS = {
  "Complete puja samagri kit": [
    { name: "Agarbatti", qty: 1, unit: "pack" },
    { name: "Dhoop sticks", qty: 1, unit: "pack" },
    { name: "Camphor (kapoor)", qty: 1, unit: "pack" },
    { name: "Roli & chawal", qty: 1, unit: "set" },
    { name: "Kumkum", qty: 1, unit: "pack" },
    { name: "Haldi", qty: 1, unit: "pack" },
    { name: "Cotton wicks (batti)", qty: 1, unit: "pack" },
    { name: "Clay diya", qty: 5, unit: "pcs" },
    { name: "Betel leaves & supari", qty: 1, unit: "set" },
    { name: "Coconut", qty: 1, unit: "pc" },
    { name: "Mauli (red thread)", qty: 1, unit: "roll" },
    { name: "Matchbox", qty: 1, unit: "pc" },
  ],
  "Satyanarayan puja kit": [
    { name: "Roli & chawal", qty: 1, unit: "set" },
    { name: "Haldi", qty: 1, unit: "pack" },
    { name: "Kumkum", qty: 1, unit: "pack" },
    { name: "Mauli (red thread)", qty: 1, unit: "roll" },
    { name: "Janeu (sacred thread)", qty: 1, unit: "pc" },
    { name: "Betel leaves & supari", qty: 1, unit: "set" },
    { name: "Tulsi leaves bunch", qty: 1, unit: "bunch" },
    { name: "Banana (puja)", qty: 1, unit: "dozen" },
    { name: "Panchamrit set (milk, curd, honey, ghee, sugar)", qty: 1, unit: "set" },
    { name: "Yellow cloth", qty: 1, unit: "pc" },
    { name: "Havan samagri", qty: 250, unit: "g" },
    { name: "Agarbatti", qty: 1, unit: "pack" },
    { name: "Camphor (kapoor)", qty: 1, unit: "pack" },
    { name: "Coconut", qty: 2, unit: "pcs" },
    { name: "Cotton wicks (batti)", qty: 1, unit: "pack" },
    { name: "Clay diya", qty: 5, unit: "pcs" },
  ],
  "Ganesh puja kit": [
    { name: "Durva grass bunch", qty: 1, unit: "bunch" },
    { name: "Red hibiscus flowers", qty: 5, unit: "pcs" },
    { name: "Roli & chawal", qty: 1, unit: "set" },
    { name: "Sindoor", qty: 1, unit: "pack" },
    { name: "Agarbatti", qty: 1, unit: "pack" },
    { name: "Camphor (kapoor)", qty: 1, unit: "pack" },
    { name: "Clay diya", qty: 3, unit: "pcs" },
    { name: "Cotton wicks (batti)", qty: 1, unit: "pack" },
    { name: "Coconut", qty: 1, unit: "pc" },
    { name: "Betel leaves & supari", qty: 1, unit: "set" },
    { name: "Janeu (sacred thread)", qty: 1, unit: "pc" },
    { name: "Modak (sweet)", qty: 5, unit: "pcs" },
  ],
};

export function kitSummary(contents) {
  return (contents || []).map((k) => `${k.name} x${k.qty} ${k.unit}`).join(", ");
}

function readJson(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    if (s) return JSON.parse(s);
  } catch (e) {}
  return fallback;
}
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

export function getOutOfStock() {
  return readJson(STOCK_KEY, []);
}
export function setOutOfStock(ids) {
  writeJson(STOCK_KEY, ids);
}

export function demoProducts(shopId, { onlyInStock = false } = {}) {
  const shop = DEMO_SHOPS.find((s) => s.id === shopId);
  if (!shop) return [];
  const oos = getOutOfStock();
  const all = BASE.map(([name, category, price, unit, step], i) => {
    const id = `${shopId}-p${i}`;
    return {
      id,
      shop_id: shopId,
      name,
      category,
      price: Math.round(price * shop.factor),
      unit,
      step: step || 1,
      stock_qty: name === "Coconut" ? 4 : null,
      in_stock: !oos.includes(id),
      is_kit: Boolean(KIT_CONTENTS[name]),
      kit_contents: KIT_CONTENTS[name] || null,
    };
  });
  return onlyInStock ? all.filter((p) => p.in_stock) : all;
}

function seedOrders() {
  const now = Date.now();
  return [
    {
      code: "PJ7K2M9X",
      shop_id: "demo-1",
      customer_name: "Anita Sharma",
      customer_phone: "9890012345",
      address: null,
      fulfilment: "pickup",
      subtotal: 175,
      status: "new",
      created_at: new Date(now - 12 * 60000).toISOString(),
      items: [
        { name: "Agarbatti (pack)", price: 40, qty: 2 },
        { name: "Coconut", price: 35, qty: 1 },
        { name: "Fresh flower garland", price: 60, qty: 1 },
      ],
    },
    {
      code: "PJ4D8Q1B",
      shop_id: "demo-1",
      customer_name: "Rakesh Patil",
      customer_phone: "9822098220",
      address: "B-204, Shanti Heights, Thane West",
      fulfilment: "delivery",
      subtotal: 650,
      status: "accepted",
      created_at: new Date(now - 45 * 60000).toISOString(),
      items: [
        { name: "Complete puja samagri kit", price: 250, qty: 2 },
        { name: "Pure ghee", price: 150, qty: 1 },
      ],
    },
  ];
}

export function loadOrders() {
  const saved = readJson(ORDERS_KEY, null);
  if (saved) return saved;
  const seeded = seedOrders();
  writeJson(ORDERS_KEY, seeded);
  return seeded;
}
export function saveOrders(orders) {
  writeJson(ORDERS_KEY, orders);
}
