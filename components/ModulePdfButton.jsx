"use client";

import { toast } from "@/lib/toast";
import { paintPdfBackground, renderModuleSection } from "@/lib/modulePdfLayout";

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ModulePdfButton({ moduleNumber, title, phaseLabel, contentMd }) {
  async function handleDownload() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const margin = 50;
    const contentWidth = W - margin * 2;

    paintPdfBackground(doc);
    renderModuleSection(doc, {
      margin,
      contentWidth,
      y: margin,
      moduleNumber,
      title,
      phaseLabel,
      contentMd,
    });

    doc.save(`modulo-${String(moduleNumber).padStart(2, "0")}-${slugify(title)}.pdf`);
    toast("Conteúdo do módulo baixado em PDF", "success");
  }

  return (
    <button
      onClick={handleDownload}
      className="rounded border border-signal-400/50 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-signal-400 transition hover:bg-signal-400/10"
    >
      Baixar dossiê (PDF)
    </button>
  );
}
