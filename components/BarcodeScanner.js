"use client";
import { useEffect, useRef, useState } from "react";

// Camera barcode scanner (works on Chrome for Android and recent desktop Chrome/Edge).
// A USB / Bluetooth barcode scanner also works without this: it just types into the barcode box.
export default function BarcodeScanner({ onDetect, onClose }) {
  const videoRef = useRef(null);
  const [msg, setMsg] = useState("Starting camera…");

  useEffect(() => {
    let stream;
    let stop = false;
    async function start() {
      if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
        setMsg("Camera scanning is not supported on this browser. Type the number, or use a barcode scanner.");
        return;
      }
      try {
        const detector = new window.BarcodeDetector();
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (stop) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setMsg("Point the camera at the barcode");
        const tick = async () => {
          if (stop) return;
          try {
            const found = await detector.detect(videoRef.current);
            if (found.length) {
              onDetect(found[0].rawValue);
              return;
            }
          } catch (e) {}
          setTimeout(tick, 300);
        };
        tick();
      } catch (e) {
        setMsg("Could not open the camera. Please allow camera access, or type the number.");
      }
    }
    start();
    return () => {
      stop = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <video ref={videoRef} className="aspect-square w-full rounded-xl bg-black object-cover" muted playsInline />
        <p className="text-center text-sm text-gray-700">{msg}</p>
        <button className="btn-outline w-full" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
