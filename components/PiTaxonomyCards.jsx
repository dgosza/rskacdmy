"use client";

import { useEffect, useRef, useState } from "react";
import { PI_CATEGORIES, PI_TAXONOMY } from "@/lib/piTaxonomy";

const DELIVERY_LABELS = { direta: "Direta", indireta: "Indireta", ambas: "Ambas" };

function TaxonomyModal({ item, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    }
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const categoryLabel = PI_CATEGORIES.find((c) => c.key === item.category)?.label;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 p-4 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-line bg-panel shadow-2xl shadow-black/50"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-panel-2 px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-signal-400">
              {item.code} · {categoryLabel}
            </p>
            <h3 className="mt-1 font-display text-base font-bold text-ink">{item.name}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 rounded p-1 text-muted transition hover:bg-void hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          <p className="text-sm leading-relaxed text-muted">{item.description}</p>

          <div className="flex flex-wrap gap-2">
            <span className="rounded border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
              Entrega: {DELIVERY_LABELS[item.delivery] || "—"}
            </span>
            {item.requiresLocalAccess && (
              <span className="rounded border border-signal-400/40 bg-signal-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-signal-400">
                Requer acesso local
              </span>
            )}
          </div>

          {item.aka.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Também conhecido como
              </p>
              <ul className="mt-1 space-y-0.5 text-xs leading-relaxed text-muted">
                {item.aka.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {item.generalIdeas.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Ideias gerais
              </p>
              <ul className="mt-1 space-y-1 text-xs leading-relaxed text-muted">
                {item.generalIdeas.map((g, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-signal-400">▸</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.promptExamples.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                Exemplos de prompt
              </p>
              <ul className="mt-1 space-y-1.5">
                {item.promptExamples.map((p, i) => (
                  <li
                    key={i}
                    className="rounded border border-line/60 bg-void/40 px-2.5 py-1.5 font-mono text-[11px] leading-relaxed text-muted"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PiTaxonomyCards() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [activeItem, setActiveItem] = useState(null);

  const q = query.trim().toLowerCase();
  const filtered = PI_TAXONOMY.filter((item) => {
    if (activeCategory !== "all" && item.category !== activeCategory) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 rounded border border-signal-400/30 bg-signal-400/5 px-4 py-3 text-xs leading-relaxed text-muted">
        Catálogo somente para referência e consulta — 172 vulnerabilidades e
        técnicas documentadas a título de exemplo, para fins educativos. Os
        exemplos de prompt não devem ser usados contra sistemas de produção
        sem autorização.
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition ${
            activeCategory === "all"
              ? "border-signal-400/60 bg-signal-400/10 text-signal-400"
              : "border-line text-muted hover:border-line/80"
          }`}
        >
          Todas ({PI_TAXONOMY.length})
        </button>
        {PI_CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={`rounded border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition ${
              activeCategory === c.key
                ? "border-signal-400/60 bg-signal-400/10 text-signal-400"
                : "border-line text-muted hover:border-line/80"
            }`}
          >
            {c.label} ({c.count})
          </button>
        ))}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nome, código ou descrição..."
        className="mb-5 w-full rounded border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-signal-400/60 focus:ring-1 focus:ring-signal-400/40"
      />

      <p className="mb-3 font-mono text-xs text-muted">
        {filtered.length} de {PI_TAXONOMY.length} entradas
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((item) => (
          <button
            key={item.code}
            onClick={() => setActiveItem(item)}
            className="rounded-lg border border-line bg-panel p-4 text-left transition hover:border-signal-400/50 hover:bg-panel-2"
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-signal-400">
              {item.code} · {PI_CATEGORIES.find((c) => c.key === item.category)?.label}
            </p>
            <p className="mt-1 font-display text-sm font-semibold text-ink">{item.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{item.description}</p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded border border-line bg-panel p-4 text-center font-mono text-xs text-muted">
          Nenhuma entrada encontrada para essa busca.
        </p>
      )}

      {activeItem && <TaxonomyModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}
