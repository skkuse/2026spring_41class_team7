import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, '../test/fixtures');

await fs.promises.mkdir(fixturesDir, { recursive: true });

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([480, 200]);
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
page.drawText('Jane Developer — Skills: TypeScript, React, PostgreSQL, AWS', {
  x: 36,
  y: 150,
  size: 11,
  font,
});
const pdfBytes = await pdfDoc.save();
await fs.promises.writeFile(path.join(fixturesDir, 'sample.pdf'), pdfBytes);
console.log('wrote sample.pdf', pdfBytes.length, 'bytes');

const zip = new JSZip();
zip.file(
  '[Content_Types].xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
);
zip.folder('_rels').file(
  '.rels',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
);
zip.folder('word').file(
  'document.xml',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
<w:p><w:r><w:t>John Engineer — Python, Django, Redis, Docker</w:t></w:r></w:p>
</w:body>
</w:document>`,
);
zip.folder('word').folder('_rels').file(
  'document.xml.rels',
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
);

const docxBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
const outDocx = path.join(fixturesDir, 'sample.docx');
await fs.promises.writeFile(outDocx, docxBuf);
console.log('wrote sample.docx', docxBuf.length, 'bytes');
