"use client";

import { toast } from "@/lib/toast";

function credentialId(email) {
  const hash = Array.from(email).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 999999, 7);
  const year = new Date().getFullYear();
  return `ARA-${year}-${String(hash).padStart(6, "0")}`;
}

export default function CertificateButton({ userEmail, score, total }) {
  async function handleDownload() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // background
    doc.setFillColor(5, 7, 10);
    doc.rect(0, 0, W, H, "F");

    // outer frame
    doc.setDrawColor(251, 191, 36);
    doc.setLineWidth(1.2);
    doc.rect(28, 28, W - 56, H - 56);

    // corner marks (badge aesthetic)
    const cs = 18;
    doc.setLineWidth(2);
    const corners = [
      [28, 28, 1, 1],
      [W - 28, 28, -1, 1],
      [28, H - 28, 1, -1],
      [W - 28, H - 28, -1, -1],
    ];
    corners.forEach(([x, y, dx, dy]) => {
      doc.line(x, y, x + cs * dx, y);
      doc.line(x, y, x, y + cs * dy);
    });

    // eyebrow
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(251, 191, 36);
    doc.text("AI RISK ACADEMY  //  CREDENCIAL DE CERTIFICAÇÃO", W / 2, 82, {
      align: "center",
    });

    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(125, 135, 152);
    doc.text(
      "INSTITUIÇÃO FINANCEIRA · TIME DE RISCOS · SEGURANÇA DE IA",
      W / 2,
      98,
      { align: "center" }
    );

    // hairline
    doc.setDrawColor(31, 41, 55);
    doc.setLineWidth(0.5);
    doc.line(W / 2 - 120, 116, W / 2 + 120, 116);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(182, 191, 204);
    doc.text("Certificamos que", W / 2, 155, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(230, 233, 239);
    doc.text(userEmail, W / 2, 190, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(182, 191, 204);
    doc.text(
      "concluiu a trilha completa da AI Risk Academy e foi aprovado(a)",
      W / 2,
      222,
      { align: "center" }
    );
    doc.text("na avaliação final de certificação", W / 2, 240, {
      align: "center",
    });

    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.setTextColor(251, 191, 36);
    doc.text(`${score} / ${total} — NÍVEL 05 CERTIFICADO`, W / 2, 268, {
      align: "center",
    });

    // footer strip: credential id + date
    const today = new Date().toLocaleDateString("pt-BR");
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(125, 135, 152);
    doc.text(`ID DA CREDENCIAL: ${credentialId(userEmail)}`, 60, H - 56);
    doc.text(`EMITIDO EM ${today}`, W - 60, H - 56, { align: "right" });

    doc.save("credencial-ai-risk-academy.pdf");
    toast("Credencial baixada em PDF", "success");
  }

  return (
    <button
      onClick={handleDownload}
      className="rounded border border-signal-400/50 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-signal-400 transition hover:bg-signal-400/10"
    >
      Baixar credencial (PDF)
    </button>
  );
}
