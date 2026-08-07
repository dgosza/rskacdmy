import { parseMarkdownForPdf } from "@/lib/mdToText";

// Shared jsPDF layout for a single module's content, used both by the
// per-module download button and the "download all modules" button so the
// two stay visually identical.

export function paintPdfBackground(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFillColor(5, 7, 10);
  doc.rect(0, 0, W, H, "F");
}

export function renderModuleSection(doc, { margin, contentWidth, y, moduleNumber, title, phaseLabel, contentMd }) {
  const H = doc.internal.pageSize.getHeight();

  function ensureSpace(lineHeight) {
    if (y + lineHeight > H - margin) {
      doc.addPage();
      paintPdfBackground(doc);
      y = margin;
    }
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36);
  doc.text("AI RISK ACADEMY", margin, y);
  doc.text(`DOSSIÊ ${String(moduleNumber).padStart(2, "0")}`, margin + contentWidth, y, { align: "right" });
  y += 14;

  doc.setDrawColor(31, 41, 55);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(230, 233, 239);
  const titleLines = doc.splitTextToSize(title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 20 + 6;

  if (phaseLabel) {
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(125, 135, 152);
    doc.text(phaseLabel.toUpperCase(), margin, y);
    y += 24;
  }

  const blocks = parseMarkdownForPdf(contentMd);

  blocks.forEach((block) => {
    if (block.type === "h3") {
      y += 10;
      doc.setFont("courier", "bold");
      doc.setFontSize(11);
      doc.setTextColor(251, 191, 36);
      doc.splitTextToSize(block.text, contentWidth).forEach((line) => {
        ensureSpace(16);
        doc.text(line, margin, y);
        y += 16;
      });
      y += 4;
      return;
    }

    if (block.type === "h4") {
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(182, 191, 204);
      doc.splitTextToSize(block.text, contentWidth).forEach((line) => {
        ensureSpace(15);
        doc.text(line, margin, y);
        y += 15;
      });
      y += 4;
      return;
    }

    if (block.type === "li") {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(182, 191, 204);
      doc.splitTextToSize(`•  ${block.text}`, contentWidth - 12).forEach((line) => {
        ensureSpace(14);
        doc.text(line, margin + 12, y);
        y += 14;
      });
      y += 2;
      return;
    }

    if (block.type === "table") {
      const colCount = block.header.length;
      const gap = 8;
      const colWidth = (contentWidth - gap * (colCount - 1)) / colCount;
      const colX = block.header.map((_, i) => margin + i * (colWidth + gap));

      y += 8;
      doc.setFont("courier", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(251, 191, 36);
      const headerCellLines = block.header.map((cell) => doc.splitTextToSize(cell, colWidth));
      const headerHeight = Math.max(...headerCellLines.map((l) => l.length)) * 10;
      ensureSpace(headerHeight + 10);
      headerCellLines.forEach((cellLines, i) => {
        cellLines.forEach((line, li) => doc.text(line, colX[i], y + li * 10));
      });
      y += headerHeight + 6;

      doc.setDrawColor(31, 41, 55);
      doc.setLineWidth(0.5);
      doc.line(margin, y, margin + contentWidth, y);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(182, 191, 204);
      block.rows.forEach((row) => {
        const cellLines = row.map((cell) => doc.splitTextToSize(cell, colWidth));
        const rowHeight = Math.max(...cellLines.map((l) => l.length)) * 10;
        ensureSpace(rowHeight + 8);
        cellLines.forEach((lines, i) => {
          lines.forEach((line, li) => doc.text(line, colX[i], y + li * 10));
        });
        y += rowHeight + 8;
      });

      y += 6;
      return;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(182, 191, 204);
    doc.splitTextToSize(block.text, contentWidth).forEach((line) => {
      ensureSpace(14);
      doc.text(line, margin, y);
      y += 14;
    });
    y += 8;
  });

  return y;
}
