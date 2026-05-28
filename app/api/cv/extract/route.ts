import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let parser: PDFParse | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload a PDF CV first." }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files can be uploaded here." }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF CVs must be smaller than 8MB." }, { status: 400 });
    }

    const data = new Uint8Array(await file.arrayBuffer());
    parser = new PDFParse({ data });
    const result = await parser.getText();
    const text = normalizeText(result.text);

    if (!text) {
      return NextResponse.json({ error: "No readable text was found in this PDF. Try a text-based CV or paste the CV manually." }, { status: 422 });
    }

    return NextResponse.json({
      fileName: file.name,
      text
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The PDF could not be read.";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await parser?.destroy();
  }
}

function normalizeText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
