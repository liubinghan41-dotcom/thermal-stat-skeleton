// Dependency-free PWA icon generator.
// Renders the 热统骨架 brand mark (2x2 colored grid on a dark panel)
// into PNG icons used by the web manifest and the iOS home-screen.
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "..", "public");
mkdirSync(publicDir, { recursive: true });

const BG = [0x17, 0x21, 0x1f]; // var(--text)
const TILES = [
  [0x0b, 0x7d, 0x72], // thermodynamics
  [0xd9, 0x47, 0x3f], // statistical mechanics
  [0xb4, 0x77, 0x16], // bridge
  [0x50, 0x6b, 0x8f], // mathematical tool
];

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function roundedTile(rgba, size, x0, y0, tile, color, radius) {
  for (let y = 0; y < tile; y += 1) {
    for (let x = 0; x < tile; x += 1) {
      // round corners
      const dx = x < radius ? radius - x : x >= tile - radius ? x - (tile - radius - 1) : 0;
      const dy = y < radius ? radius - y : y >= tile - radius ? y - (tile - radius - 1) : 0;
      if (dx > 0 && dy > 0 && dx * dx + dy * dy > radius * radius) continue;
      const px = ((y0 + y) * size + (x0 + x)) * 4;
      rgba[px] = color[0];
      rgba[px + 1] = color[1];
      rgba[px + 2] = color[2];
      rgba[px + 3] = 255;
    }
  }
}

function drawIcon(size, { padScale = 0.2 } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    rgba[i * 4] = BG[0];
    rgba[i * 4 + 1] = BG[1];
    rgba[i * 4 + 2] = BG[2];
    rgba[i * 4 + 3] = 255;
  }
  const pad = Math.round(size * padScale);
  const inner = size - pad * 2;
  const gap = Math.round(inner * 0.08);
  const tile = Math.floor((inner - gap) / 2);
  const radius = Math.max(2, Math.round(tile * 0.16));
  const positions = [
    [pad, pad],
    [pad + tile + gap, pad],
    [pad, pad + tile + gap],
    [pad + tile + gap, pad + tile + gap],
  ];
  positions.forEach((pos, index) => {
    roundedTile(rgba, size, pos[0], pos[1], tile, TILES[index], radius);
  });
  return encodePng(size, size, rgba);
}

const outputs = [
  ["icon-192.png", drawIcon(192)],
  ["icon-512.png", drawIcon(512)],
  // maskable: extra padding so the mark stays inside the safe zone
  ["icon-maskable-512.png", drawIcon(512, { padScale: 0.28 })],
  // iOS home-screen icon is rendered on an opaque background
  ["apple-touch-icon.png", drawIcon(180, { padScale: 0.16 })],
];

for (const [name, buf] of outputs) {
  writeFileSync(resolve(publicDir, name), buf);
  console.log(`icon: ${name} (${buf.length} bytes)`);
}
