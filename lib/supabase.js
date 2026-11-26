import { createClient } from "@supabase/supabase-js";

let client = null;

// Created on first use (so the site can still build before keys are added).
export function getSupabase() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
    client = createClient(url, key);
  }
  return client;
}

export function isConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const FREE_DELIVERY_MIN = 500;

// Pooja Bazaar fee as a percentage of completed orders (shown to shopkeepers in Earnings).
// Keep 0 while there are "no fees to start". Change to e.g. 5 later.
export const COMMISSION_PCT = 0;

// Units. "Loose" units are sold by amount: the shopkeeper sets the price per unit and the smallest step.
export const COUNT_UNITS = ["piece", "pack", "set", "dozen", "bunch", "kit"];
export const LOOSE_UNITS = ["g", "kg", "ml", "l", "cm", "m"];
export const DEFAULT_STEP = { g: 100, kg: 0.25, ml: 100, l: 0.5, cm: 10, m: 0.5 };

export const CATEGORIES = [
  "Incense & Dhoop",
  "Flowers & Garlands",
  "Coconut & Fruits",
  "Oil, Ghee & Diyas",
  "Kumkum & Haldi",
  "Idols & Frames",
  "Puja Samagri Kits",
  "Other",
];

export const CATEGORY_ICONS = {
  "Incense & Dhoop": "🕉️",
  "Flowers & Garlands": "🌼",
  "Coconut & Fruits": "🥥",
  "Oil, Ghee & Diyas": "🪔",
  "Kumkum & Haldi": "🔴",
  "Idols & Frames": "🛕",
  "Puja Samagri Kits": "🧺",
  Other: "🙏",
};

export const STARTER_PRODUCTS = [
  { name: "Agarbatti (pack)", category: "Incense & Dhoop", price: 40, unit: "pack" },
  { name: "Dhoop sticks (pack)", category: "Incense & Dhoop", price: 50, unit: "pack" },
  { name: "Camphor (kapoor)", category: "Incense & Dhoop", price: 30, unit: "pack" },
  { name: "Fresh flower garland", category: "Flowers & Garlands", price: 60, unit: "piece" },
  { name: "Loose marigold flowers", category: "Flowers & Garlands", price: 40, unit: "250 g" },
  { name: "Coconut", category: "Coconut & Fruits", price: 35, unit: "piece" },
  { name: "Banana (puja)", category: "Coconut & Fruits", price: 40, unit: "dozen" },
  { name: "Cotton wicks (batti)", category: "Oil, Ghee & Diyas", price: 20, unit: "pack" },
  { name: "Clay diya", category: "Oil, Ghee & Diyas", price: 10, unit: "piece" },
  { name: "Pure ghee", category: "Oil, Ghee & Diyas", price: 150, unit: "200 ml" },
  { name: "Kumkum", category: "Kumkum & Haldi", price: 20, unit: "pack" },
  { name: "Haldi (turmeric)", category: "Kumkum & Haldi", price: 20, unit: "pack" },
  { name: "Complete puja samagri kit", category: "Puja Samagri Kits", price: 250, unit: "kit" },
];
