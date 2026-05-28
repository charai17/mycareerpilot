import { NextResponse } from "next/server";

type PdfCv = {
  title?: string;
  recommendedStyle?: string;
  summary?: string;
  experience?: string;
  skills?: string;
  education?: string;
};

const pageWidth = 595;
const pageHeight = 842;
const margin = 54;
const lineHeight = 15;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { cv?: PdfCv };
    const cv = body.cv;

    if (!cv) {
      return NextResponse.json({ error: "CV content is required." }, { status: 400 });
    }

    const pdf = createPdf(cv);
    const fileName = `${safeFileName(cv.title || "careerpilot-cv")}.pdf`;

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF could not be generated.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function createPdf(cv: PdfCv) {
  const pages = buildPages(cv);
  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`
  ];

  pages.forEach((content, index) => {
    const pageObjectNumber = 3 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${byteLength(content)} >>\nstream\n${content}\nendstream`);
  });

  let output = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(byteLength(output));
    output += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = byteLength(output);
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  output += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Uint8Array(Buffer.from(output, "binary"));
}

function buildPages(cv: PdfCv) {
  const lines = [
    { text: cleanText(cv.title || "CareerPilot CV"), size: 22, bold: true, gap: 8 },
    { text: cleanText(cv.recommendedStyle || "ATS-friendly CV"), size: 10, bold: false, gap: 18 },
    { text: "Summary", size: 13, bold: true, gap: 6 },
    ...paragraphLines(cv.summary),
    { text: "Experience", size: 13, bold: true, gap: 6 },
    ...paragraphLines(cv.experience),
    { text: "Skills", size: 13, bold: true, gap: 6 },
    ...paragraphLines(cv.skills),
    { text: "Education", size: 13, bold: true, gap: 6 },
    ...paragraphLines(cv.education)
  ];

  const pages: string[] = [];
  let y = pageHeight - margin;
  let content = "BT\n";

  lines.forEach((line) => {
    if (y < margin + 40) {
      content += "ET";
      pages.push(content);
      content = "BT\n";
      y = pageHeight - margin;
    }

    content += `/${line.bold ? "F2" : "F1"} ${line.size} Tf\n`;
    content += `${margin} ${y} Td (${escapePdf(line.text)}) Tj\n`;
    content += `${-margin} 0 Td\n`;
    y -= lineHeight + line.gap;
  });

  content += "ET";
  pages.push(content);
  return pages;
}

function paragraphLines(value?: string) {
  const paragraphs = cleanText(value || "Not provided.")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return paragraphs.flatMap((paragraph) =>
    wrapText(paragraph, 84).map((text, index, list) => ({
      text,
      size: 10,
      bold: false,
      gap: index === list.length - 1 ? 7 : 0
    }))
  );
}

function wrapText(value: string, maxLength: number) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function cleanText(value: string) {
  return value
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\r\n/g, "\n")
    .trim();
}

function escapePdf(value: string) {
  return cleanText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function safeFileName(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "careerpilot-cv";
}

function byteLength(value: string) {
  return Buffer.byteLength(value, "binary");
}
