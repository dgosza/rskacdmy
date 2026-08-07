"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";
import { paintPdfBackground, renderModuleSection } from "@/lib/modulePdfLayout";

export default function DownloadAllModulesButton() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    const supabase = createClient();
    const { data: modules, error } = await supabase
      .from("modules")
      .select("number, title, phase_label, content_md")
      .eq("is_exam", false)
      .order("number");

    if (error || !modules?.length) {
      toast("Não foi possível carregar o conteúdo dos dossiês", "warn");
      setLoading(false);
      return;
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const margin = 50;
    const contentWidth = W - margin * 2;

    paintPdfBackground(doc);
    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.setTextColor(251, 191, 36);
    doc.text("AI RISK ACADEMY", margin, margin);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(230, 233, 239);
    doc.text("Trilha completa", margin, H / 2 - 20);

    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(125, 135, 152);
    doc.text(`${modules.length} DOSSIÊS · ${new Date().toLocaleDateString("pt-BR")}`, margin, H / 2 + 8);

    modules.forEach((mod) => {
      doc.addPage();
      paintPdfBackground(doc);
      renderModuleSection(doc, {
        margin,
        contentWidth,
        y: margin,
        moduleNumber: mod.number,
        title: mod.title,
        phaseLabel: mod.phase_label,
        contentMd: mod.content_md,
      });
    });

    doc.save(`ai-risk-academy-trilha-completa-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast("Trilha completa baixada em PDF", "success");
    setLoading(false);
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="rounded border border-signal-400/50 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-signal-400 transition hover:bg-signal-400/10 disabled:opacity-50"
    >
      {loading ? "Gerando PDF..." : "Baixar trilha completa (PDF)"}
    </button>
  );
}
