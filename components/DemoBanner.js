"use client";
import { isConfigured } from "@/lib/supabase";

export default function DemoBanner() {
  if (isConfigured()) return null;
  return (
    <div className="bg-gold px-4 py-1.5 text-center text-xs font-medium text-maroon-dark">
      ✨ Demo mode: you are seeing sample shops, items and orders. Real data appears once the
      database is connected.
    </div>
  );
}
