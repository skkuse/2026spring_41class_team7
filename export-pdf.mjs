import puppeteer from 'puppeteer-core';
import { resolve } from 'path';

const HTML = '/home/hskan/hskang9/2026spring_41class_team7/DESIGN_SPEC.html';
const OUT  = '/home/hskan/hskang9/2026spring_41class_team7/DESIGN_SPEC.pdf';
const CHROME = '/home/hskan/.cache/puppeteer/chrome/linux-149.0.7827.22/chrome-linux64/chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
});

const page = await browser.newPage();
await page.goto(`file://${HTML}`, { waitUntil: 'networkidle0' });

await page.addStyleTag({ content: `
  svg { max-width: 100% !important; height: auto !important; }
  .mermaid { overflow: hidden; page-break-inside: avoid; }
  pre, table { page-break-inside: avoid; }
` });

// Wait for mermaid diagrams to finish rendering
await page.waitForFunction(() => {
  const svgs = document.querySelectorAll('.mermaid svg');
  return svgs.length > 0 || document.readyState === 'complete';
}, { timeout: 15000 }).catch(() => {});

await new Promise(r => setTimeout(r, 2000));

await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
});

await browser.close();
console.log(`PDF saved → ${OUT}`);
