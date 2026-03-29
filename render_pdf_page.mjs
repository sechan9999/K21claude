/**
 * Renders a specific page from a PDF to PNG.
 * Usage: node render_pdf_page.mjs <pdf_path> <page_num> <out_png>
 */
import { getDocument, OPS } from './node_modules/pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import fs from 'fs';

const [,, pdfPath, pageNum, outPng] = process.argv;
if (!pdfPath || !pageNum || !outPng) {
  console.error('Usage: node render_pdf_page.mjs <pdf_path> <page_num> <out_png>');
  process.exit(1);
}

const data = new Uint8Array(fs.readFileSync(pdfPath));
const pdf = await getDocument({ data, verbosity: 0 }).promise;
const page = await pdf.getPage(parseInt(pageNum));
const vp = page.getViewport({ scale: 1 });

await page.getOperatorList();

// Wait for image objects to resolve
const waitForImg = (objs, key, maxWait=3000) => new Promise((res, rej) => {
  const start = Date.now();
  const check = () => {
    if (objs.has(key)) return res(objs.get(key));
    if (Date.now() - start > maxWait) return rej(new Error(`Timeout waiting for ${key}`));
    setTimeout(check, 50);
  };
  check();
});

// Find image keys
const ops = await page.getOperatorList();
const imgKeys = [];
for (let i = 0; i < ops.fnArray.length; i++) {
  if (ops.fnArray[i] === OPS.paintImageXObject || ops.fnArray[i] === OPS.paintImageXObjectRepeat) {
    imgKeys.push(ops.argsArray[i][0]);
  }
}

if (imgKeys.length === 0) {
  console.error('No images found on page');
  process.exit(1);
}

const imgKey = imgKeys[0];
const imgData = await waitForImg(page.objs, imgKey);

const { width, height, kind } = imgData;
console.log(`Page ${pageNum}: ${width}x${height} kind=${kind}`);

const isLandscape = width > height;
const outW = isLandscape ? height : width;
const outH = isLandscape ? width : height;

const canvas = createCanvas(outW, outH);
const ctx = canvas.getContext('2d');
const out = ctx.createImageData(outW, outH);

if (kind === 2) {
  // RGB 24bpp
  const pixels = imgData.data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 3;
      const r = pixels[src], g = pixels[src+1], b = pixels[src+2];
      let ox, oy;
      if (isLandscape) { ox = y; oy = width - 1 - x; }
      else { ox = x; oy = y; }
      const dst = (oy * outW + ox) * 4;
      out.data[dst] = r; out.data[dst+1] = g; out.data[dst+2] = b; out.data[dst+3] = 255;
    }
  }
} else if (kind === 1) {
  // 1-bit bilevel
  const pixels = imgData.data;
  const bpr = Math.ceil(width / 8);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const bit = (pixels[y * bpr + Math.floor(x/8)] >> (7 - x%8)) & 1;
      const gray = bit ? 0 : 255;
      let ox, oy;
      if (isLandscape) { ox = y; oy = width - 1 - x; }
      else { ox = x; oy = y; }
      const dst = (oy * outW + ox) * 4;
      out.data[dst] = gray; out.data[dst+1] = gray; out.data[dst+2] = gray; out.data[dst+3] = 255;
    }
  }
} else {
  console.error(`Unknown kind=${kind}`);
  process.exit(1);
}

ctx.putImageData(out, 0, 0);
const buf = canvas.toBuffer('image/png');
fs.writeFileSync(outPng, buf);
console.log(`Saved: ${outPng}`);
