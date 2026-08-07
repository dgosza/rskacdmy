// Converts a module's content_md into a flat list of typed blocks
// ({ type: "h3" | "h4" | "li" | "p" | "table", ... }) for plain-text PDF
// layout. jsPDF has no table primitive, so table blocks carry structured
// { header, rows } data that the caller draws manually.

function stripInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1");
}

function splitTableRow(line) {
  const cells = line.split("|").map((c) => c.trim());
  if (cells[0] === "") cells.shift();
  if (cells[cells.length - 1] === "") cells.pop();
  return cells.map(stripInlineMarkdown);
}

function isSeparatorRow(row) {
  return row.every((cell) => /^:?-{2,}:?$/.test(cell));
}

export function parseMarkdownForPdf(contentMd) {
  const lines = (contentMd || "").split("\n");
  const blocks = [];
  let buffer = [];
  let tableBuffer = [];

  function flushParagraph() {
    const text = buffer.join(" ").trim();
    if (text) blocks.push({ type: "p", text: stripInlineMarkdown(text) });
    buffer = [];
  }

  function flushTable() {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer.map(splitTableRow);
    const header = rows[0];
    const dataRows = rows.slice(1).filter((row) => !isSeparatorRow(row));
    blocks.push({ type: "table", header, rows: dataRows });
    tableBuffer = [];
  }

  for (const raw of lines) {
    const line = raw.trim();

    if (/^\|/.test(line)) {
      flushParagraph();
      tableBuffer.push(line);
      continue;
    }
    flushTable();

    if (line === "") {
      flushParagraph();
      continue;
    }
    if (/^#{4}\s+/.test(line)) {
      flushParagraph();
      blocks.push({ type: "h4", text: stripInlineMarkdown(line.replace(/^#{4}\s+/, "")) });
      continue;
    }
    if (/^#{2,3}\s+/.test(line)) {
      flushParagraph();
      blocks.push({ type: "h3", text: stripInlineMarkdown(line.replace(/^#{2,3}\s+/, "")) });
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      blocks.push({ type: "li", text: stripInlineMarkdown(line.replace(/^[-*]\s+/, "")) });
      continue;
    }
    buffer.push(line);
  }
  flushParagraph();
  flushTable();

  return blocks;
}
