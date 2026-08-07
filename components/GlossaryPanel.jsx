"use client";

import { useState } from "react";
import { GLOSSARY } from "@/lib/glossary";

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export default function GlossaryPanel() {
  const [query, setQuery] = useState("");

  const q = normalize(query.trim());
  const filtered = GLOSSARY.filter((item) => {
    if (!q) return true;
    return (
      normalize(item.term).includes(q) ||
      normalize(item.expansion).includes(q) ||
      normalize(item.definition).includes(q)
    );
  }).sort((a, b) => a.term.localeCompare(b.term, "pt-BR"));

  const grouped = [];
  let lastLetter = "";
  for (const item of filtered) {
    const letter = normalize(item.term)[0]?.toUpperCase() ?? "#";
    if (letter !== lastLetter) {
      grouped.push({ letter, items: [] });
      lastLetter = letter;
    }
    grouped[grouped.length - 1].items.push(item);
  }

  return (
    <div>
      <div className="mb-6 rounded border border-signal-400/30 bg-signal-400/5 px-4 py-3 text-xs leading-relaxed text-muted">
        Referência rápida de siglas e conceitos usados ao longo dos 9
        dossiês — para consultar sem precisar reabrir cada módulo.
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar sigla ou termo (ex.: RIPD, SoA, ASI01)..."
        className="mb-5 w-full rounded border border-line bg-void px-3 py-2 text-sm text-ink outline-none focus:border-signal-400/60 focus:ring-1 focus:ring-signal-400/40"
      />

      <p className="mb-4 font-mono text-xs text-muted">
        {filtered.length} de {GLOSSARY.length} termos
      </p>

      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.letter}>
            <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest text-signal-400">
              {group.letter}
            </p>
            <div className="space-y-2">
              {group.items.map((item) => (
                <div
                  key={item.term}
                  className="rounded-lg border border-line bg-panel p-4"
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-display text-sm font-semibold text-ink">
                      {item.term}
                    </span>
                    {item.expansion && (
                      <span className="text-xs text-muted">({item.expansion})</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {item.definition}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-signal-400/80">
                    {item.modules.length > 1 ? "Dossiês" : "Dossiê"}{" "}
                    {item.modules.map((n) => String(n).padStart(2, "0")).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded border border-line bg-panel p-4 text-center font-mono text-xs text-muted">
          Nenhum termo encontrado para essa busca.
        </p>
      )}
    </div>
  );
}
