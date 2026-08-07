"use client";

import { useEffect, useState } from "react";
import { subscribeToast } from "@/lib/toast";

const STYLES = {
  info: "border-line text-ink",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  warn: "border-orange-500/40 bg-orange-500/10 text-orange-300",
};

export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return subscribeToast((toastItem) => {
      setItems((prev) => [...prev, toastItem]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== toastItem.id));
      }, 3200);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed right-5 top-5 z-[60] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`animate-toast-in rounded border bg-panel px-4 py-3 font-mono text-xs shadow-lg shadow-black/40 ${
            STYLES[t.type] || STYLES.info
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
