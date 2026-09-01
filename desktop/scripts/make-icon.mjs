#!/usr/bin/env node
/**
 * Write ui/public/icon.png — a 256x256 app icon.
 *
 * Generated rather than committed as a binary blob, so it is reviewable: the
 * mark is a hallmark punch, a struck symbol on a flat ground, which is the
 * oldest version of the thing this project is about.
 *
 * There is no image library here, so this writes the PNG by hand: one IHDR,
 * one zlib-compressed IDAT of filtered scanlines, one IEND.
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SIZE = 256;
const BG = [12, 14, 17]; // --bg
const FG = [158, 207, 160]; // --primary

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Inside the struck mark: a ring with a chevron through it. */
function isMark(x, y) {
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.hypot(dx, dy);

  if (r > 96 && r < 108) return true; // outer ring

  // Chevron: two strokes meeting at the centre, pointing up.
  const inner = r < 78;
  const onStroke = Math.abs(Math.abs(dx) - (dy + 34)) < 13;
  if (inner && onStroke && dy > -46 && dy < 40) return true;

  return false;
}

const raw = Buffer.alloc((SIZE * 3 + 1) * SIZE);
let p = 0;
for (let y = 0; y < SIZE; y++) {
  raw[p++] = 0; // filter: none
  for (let x = 0; x < SIZE; x++) {
    const c = isMark(x, y) ? FG : BG;
    raw[p++] = c[0];
    raw[p++] = c[1];
    raw[p++] = c[2];
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // colour type: truecolour
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "ui", "public", "icon.png");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, png);
console.log(`Wrote ${out} (${png.length} bytes)`);
