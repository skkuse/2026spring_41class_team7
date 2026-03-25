import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

const MAX_BYTES = 6 * 1024 * 1024;

export class DocumentExtractError extends Error {
  constructor(
    message: string,
    public readonly status: 413 | 415 | 422,
  ) {
    super(message);
    this.name = 'DocumentExtractError';
  }
}

function extFromName(fileName: string): string {
  const i = fileName.lastIndexOf('.');
  return i >= 0 ? fileName.slice(i + 1).toLowerCase() : '';
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text?.trim() ?? '';
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ buffer });
  return value?.trim() ?? '';
}

export async function extractTextFromResumeBuffer(
  buffer: Buffer,
  fileName: string,
): Promise<{ text: string; detectedKind: 'pdf' | 'docx' }> {
  if (buffer.length > MAX_BYTES) {
    throw new DocumentExtractError(`File too large (max ${MAX_BYTES} bytes).`, 413);
  }

  const ext = extFromName(fileName);

  if (ext === 'doc') {
    throw new DocumentExtractError(
      'Legacy .doc is not supported. Please upload .docx or .pdf.',
      415,
    );
  }

  if (ext === 'docx') {
    const text = await extractDocx(buffer);
    if (!text) throw new DocumentExtractError('No text extracted from DOCX.', 422);
    return { text, detectedKind: 'docx' };
  }

  if (ext === 'pdf') {
    try {
      const text = await extractPdf(buffer);
      if (!text) throw new DocumentExtractError('No text extracted from PDF.', 422);
      return { text, detectedKind: 'pdf' };
    } catch (err) {
      if (err instanceof DocumentExtractError) throw err;
      throw new DocumentExtractError('Could not parse PDF.', 422);
    }
  }

  try {
    const pdfText = await extractPdf(buffer);
    if (pdfText.length > 0) return { text: pdfText, detectedKind: 'pdf' };
  } catch {
    /* try docx */
  }

  try {
    const docxText = await extractDocx(buffer);
    if (docxText.length > 0) return { text: docxText, detectedKind: 'docx' };
  } catch {
    /* fall through */
  }

  throw new DocumentExtractError(
    'Could not extract text. Upload a .pdf or .docx and set fileName with the correct extension.',
    415,
  );
}

export function truncateForModel(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) return { text, truncated: false };
  const half = Math.floor((maxChars - 80) / 2);
  return {
    text: `${text.slice(0, half)}\n\n[... truncated ${text.length - maxChars + 80} characters ...]\n\n${text.slice(-half)}`,
    truncated: true,
  };
}
