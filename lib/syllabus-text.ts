import mammoth from "mammoth";
import pdf from "pdf-parse";

function isDocx(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  );
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function isPlainText(file: File): boolean {
  const name = file.name.toLowerCase();
  return file.type.startsWith("text/") || name.endsWith(".txt");
}

export async function extractSyllabusTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isPdf(file)) {
    const data = await pdf(buffer);
    return data.text.trim();
  }

  if (isDocx(file)) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (file.name.toLowerCase().endsWith(".doc")) {
    throw new Error("Legacy .doc files aren't supported. Save as .docx or paste the text.");
  }

  if (isPlainText(file)) {
    return buffer.toString("utf-8").trim();
  }

  throw new Error("Unsupported file type. Upload a PDF, DOCX, or TXT file.");
}
