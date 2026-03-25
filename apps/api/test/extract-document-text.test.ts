import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { DocumentExtractError, extractTextFromResumeBuffer } from '../src/lib/extract-document-text.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures');

describe('extractTextFromResumeBuffer', () => {
  it('extracts readable text from sample.pdf', async () => {
    const buffer = await readFile(path.join(fixturesDir, 'sample.pdf'));
    const { text, detectedKind } = await extractTextFromResumeBuffer(buffer, 'resume.pdf');
    expect(detectedKind).toBe('pdf');
    expect(text).toMatch(/TypeScript/i);
    expect(text).toMatch(/PostgreSQL/i);
  });

  it('extracts readable text from sample.docx', async () => {
    const buffer = await readFile(path.join(fixturesDir, 'sample.docx'));
    const { text, detectedKind } = await extractTextFromResumeBuffer(buffer, 'resume.docx');
    expect(detectedKind).toBe('docx');
    expect(text).toMatch(/Python/i);
    expect(text).toMatch(/Docker/i);
  });

  it('rejects legacy .doc extension', async () => {
    const buffer = await readFile(path.join(fixturesDir, 'sample.docx'));
    await expect(extractTextFromResumeBuffer(buffer, 'old.doc')).rejects.toMatchObject({
      name: 'DocumentExtractError',
      status: 415,
    });
    await expect(extractTextFromResumeBuffer(buffer, 'old.doc')).rejects.toBeInstanceOf(DocumentExtractError);
  });
});
