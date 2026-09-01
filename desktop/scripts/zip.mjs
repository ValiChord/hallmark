/**
 * A minimal ZIP writer.
 *
 * The webhapp's UI is a zip with `index.html` at its root. Shelling out to
 * PowerShell or `zip` makes the build depend on which machine it runs on, and
 * nests paths differently on each — so this writes the archive directly.
 *
 * Deflate for anything that benefits, stored otherwise. No zip64: a UI bundle
 * that exceeds 4 GB has other problems.
 */
import { deflateRawSync } from "node:zlib";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

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

function walk(dir, base = dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, base, out);
    // Zip entry names always use forward slashes, whatever the host separator.
    else out.push({ full, name: relative(base, full).split(sep).join("/") });
  }
  return out;
}

/** Zip the CONTENTS of `dir` (not `dir` itself) into `outFile`. */
export function zipDirectory(dir, outFile) {
  const files = walk(dir);
  const locals = [];
  const central = [];
  let offset = 0;

  for (const file of files) {
    const raw = readFileSync(file.full);
    const deflated = deflateRawSync(raw, { level: 9 });
    const useDeflate = deflated.length < raw.length;
    const data = useDeflate ? deflated : raw;
    const method = useDeflate ? 8 : 0;
    const nameBuf = Buffer.from(file.name, "utf8");
    const crc = crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10); // time
    local.writeUInt16LE(0x21, 12); // date: 1996-01-01, fixed for reproducible output
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28); // extra length
    locals.push(local, nameBuf, data);

    const dirEntry = Buffer.alloc(46);
    dirEntry.writeUInt32LE(0x02014b50, 0);
    dirEntry.writeUInt16LE(20, 4); // version made by
    dirEntry.writeUInt16LE(20, 6); // version needed
    dirEntry.writeUInt16LE(0, 8);
    dirEntry.writeUInt16LE(method, 10);
    dirEntry.writeUInt16LE(0, 12);
    dirEntry.writeUInt16LE(0x21, 14);
    dirEntry.writeUInt32LE(crc, 16);
    dirEntry.writeUInt32LE(data.length, 20);
    dirEntry.writeUInt32LE(raw.length, 24);
    dirEntry.writeUInt16LE(nameBuf.length, 28);
    dirEntry.writeUInt16LE(0, 30);
    dirEntry.writeUInt16LE(0, 32);
    dirEntry.writeUInt16LE(0, 34);
    dirEntry.writeUInt16LE(0, 36);
    dirEntry.writeUInt32LE(0, 38); // external attrs
    dirEntry.writeUInt32LE(offset, 42);
    central.push(dirEntry, nameBuf);

    offset += local.length + nameBuf.length + data.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  writeFileSync(outFile, Buffer.concat([...locals, centralBuf, end]));
  return files.length;
}
