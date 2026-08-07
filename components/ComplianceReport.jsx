"use client";

import { toast } from "@/lib/toast";

function certStatus(row) {
  if (!row.cert_date) return { label: "Sem tentativa", style: "text-muted" };
  if (!row.cert_passed) return { label: "Não aprovado", style: "text-muted" };
  const validUntil = row.cert_valid_until ? new Date(row.cert_valid_until) : null;
  if (validUntil && validUntil.getTime() < Date.now()) {
    return { label: "Expirado — recertificar", style: "text-orange-400 font-bold" };
  }
  return { label: "Certificado", style: "text-emerald-400 font-bold" };
}

function toCsv(rows) {
  const header = [
    "E-mail",
    "Nome",
    "Módulos concluídos",
    "Total de módulos",
    "Nota da prova",
    "Aprovado",
    "Data da certificação",
    "Válido até",
  ];
  const lines = rows.map((r) => [
    r.email,
    r.full_name ?? "",
    r.modules_completed,
    r.modules_total,
    r.cert_score != null ? `${r.cert_score}/${r.cert_total}` : "",
    r.cert_passed ? "Sim" : "Não",
    r.cert_date ? new Date(r.cert_date).toLocaleDateString("pt-BR") : "",
    r.cert_valid_until ? new Date(r.cert_valid_until).toLocaleDateString("pt-BR") : "",
  ]);
  return [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export default function ComplianceReport({ rows }) {
  function downloadCsv() {
    const csv = toCsv(rows);
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-conformidade-ai-risk-academy-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Relatório exportado em CSV", "success");
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();

    doc.setFillColor(5, 7, 10);
    doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");

    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.setTextColor(251, 191, 36);
    doc.text("AI RISK ACADEMY // RELATÓRIO DE CONFORMIDADE DO TIME", 40, 40);

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(125, 135, 152);
    doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 40, 55);

    let y = 85;
    const cols = [
      { label: "E-MAIL", x: 40, w: 150 },
      { label: "MÓDULOS", x: 195, w: 60 },
      { label: "PROVA", x: 260, w: 55 },
      { label: "STATUS", x: 320, w: 100 },
      { label: "VÁLIDO ATÉ", x: 425, w: 80 },
    ];

    doc.setFont("courier", "bold");
    doc.setFontSize(8);
    doc.setTextColor(251, 191, 36);
    cols.forEach((c) => doc.text(c.label, c.x, y));
    y += 6;
    doc.setDrawColor(31, 41, 55);
    doc.line(40, y, 580, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    rows.forEach((r) => {
      if (y > 560) {
        doc.addPage();
        doc.setFillColor(5, 7, 10);
        doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");
        y = 50;
      }
      const status = certStatus(r);
      doc.setTextColor(230, 233, 239);
      doc.text(r.email, cols[0].x, y, { maxWidth: cols[0].w });
      doc.text(`${r.modules_completed}/${r.modules_total}`, cols[1].x, y);
      doc.text(r.cert_score != null ? `${r.cert_score}/${r.cert_total}` : "—", cols[2].x, y);
      doc.text(status.label, cols[3].x, y);
      doc.text(
        r.cert_valid_until ? new Date(r.cert_valid_until).toLocaleDateString("pt-BR") : "—",
        cols[4].x,
        y
      );
      y += 18;
    });

    doc.save(`relatorio-conformidade-ai-risk-academy-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast("Relatório exportado em PDF", "success");
  }

  const certifiedCount = rows.filter((r) => {
    const s = certStatus(r);
    return s.label === "Certificado";
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted">
          {rows.length} colaboradores · {certifiedCount} certificados e válidos
        </p>
        <div className="flex gap-2">
          <button
            onClick={downloadCsv}
            className="rounded border border-line px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition hover:border-signal-400/50"
          >
            Exportar CSV
          </button>
          <button
            onClick={downloadPdf}
            className="rounded border border-signal-400/50 px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-signal-400 transition hover:bg-signal-400/10"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-panel-2">
            <tr>
              {["Colaborador", "Progresso", "Prova", "Status", "Válido até"].map(
                (h) => (
                  <th
                    key={h}
                    className="border-b border-line px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-wide text-signal-400"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const status = certStatus(r);
              return (
                <tr key={r.user_id} className="border-b border-line/60 bg-panel">
                  <td className="px-4 py-3 text-ink">{r.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {r.modules_completed}/{r.modules_total}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {r.cert_score != null ? `${r.cert_score}/${r.cert_total}` : "—"}
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs ${status.style}`}>{status.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {r.cert_valid_until ? new Date(r.cert_valid_until).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
