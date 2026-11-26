"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { upiLink } from "@/lib/format";

// Pay QR for one shop order: exact amount + order code are filled in the customer's UPI app.
export default function UpiQr({ upi, shopName, amount, code }) {
  const [img, setImg] = useState("");
  const link = upiLink({ upi, name: shopName, amount, code });

  useEffect(() => {
    let stop = false;
    QRCode.toDataURL(link, { width: 240, margin: 1, color: { dark: "#5b1a0a", light: "#ffffff" } })
      .then((u) => !stop && setImg(u))
      .catch(() => {});
    return () => {
      stop = true;
    };
  }, [link]);

  return (
    <div className="rounded-xl border-2 border-dashed border-gold bg-amber-50 p-4 text-center">
      <div className="font-serif font-bold text-maroon">Pay ₹{amount} to {shopName}</div>
      {img ? (
        <img src={img} alt={`UPI QR to pay ${shopName}`} className="mx-auto mt-2 h-48 w-48 rounded-lg bg-white p-1" />
      ) : (
        <div className="mx-auto mt-2 flex h-48 w-48 items-center justify-center text-gray-400">Loading QR…</div>
      )}
      <div className="mt-1 text-xs text-gray-600">UPI ID: <b>{upi}</b></div>
      <a href={link} className="btn mt-2 inline-block !py-1.5 text-sm sm:hidden">Open UPI app to pay</a>
      <p className="mt-2 text-xs text-gray-500">Scan with any UPI app. Or pay cash at pickup / on delivery.</p>
    </div>
  );
}
