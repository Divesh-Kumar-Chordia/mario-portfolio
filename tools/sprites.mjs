// Pixel-art source of truth. Each sprite is a text map (one char = one pixel)
// compiled to a crisp SVG in assets/sprites/. Run: npm run sprites
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = new URL("../assets/sprites/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const PAL = {
  K: "#000000", W: "#ffffff",
  R: "#e52521", r: "#9c1a17",
  S: "#c98a5b", s: "#94572f", H: "#24140a",
  B: "#2038ec", b: "#14209c",
  Y: "#f8b800", y: "#fce4a0", o: "#b06a00",
  G: "#00b259", g: "#006a2e", l: "#8ee68e",
  N: "#b84418", p: "#f8a878", c: "#fce4b0",
  L: "#a8d8f8", U: "#3c64d8",
};

function svg(map, name) {
  const h = map.length, w = Math.max(...map.map((r) => r.length));
  let rects = "";
  map.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (!PAL[ch]) { x++; continue; }
      let run = 1;
      while (row[x + run] === ch) run++;
      rects += `<rect x="${x}" y="${y}" width="${run}" height="1" fill="${PAL[ch]}"/>`;
      x += run;
    }
  });
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges">${rects}</svg>\n`;
  writeFileSync(new URL(`${name}.svg`, OUT), out);
  return { name, w, h };
}

const grid = (w, h, fn) => Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fn(x, y) || ".").join(""));

/* ---------- hero: Divesh (original character, faces right) ---------- */
const HEAD = [
  ".....rRRRRR.....",
  "....rRRRRRRRRR..",
  "....HHHHSSKSS...",
  "...HHHHSSSKSSS..",
  "...HHHSSSSSSSS..",
  "....HHSSSSSss...",
  ".....SSSSSSS....",
];
const TORSO = [
  "....RRRRRRR.....",
  "...RRRRRRRRRR...",
  "..RRRRWRRRRSS...",
  "..RRRRWRRRRSS...",
  "..SSRRRRRRR.....",
  "...rRRRRRRr.....",
];
const TORSO_JUMP = [
  "....RRRRRRRSS...",
  "...RRRRRRRRSS...",
  "..RRRRWRRRR.....",
  "..RRRRWRRRR.....",
  ".SSRRRRRRR......",
  "...rRRRRRRr.....",
];
const hero = {
  "hero-idle": [...HEAD, ...TORSO, "...BBBBBBBB.....", "...BBB..BBB.....", "..KKKK..KKKK...."],
  "hero-walk1": [...HEAD, ...TORSO, "...BBBBBBBB.....", "..BBB....BBB....", ".KKKK....KKKK..."],
  "hero-walk2": [...HEAD, ...TORSO, "...BBBBBBBB.....", "....BBBBBB......", "....KKKKKK......"],
  "hero-jump": [...HEAD, ...TORSO_JUMP, "...BBBBBBBB.....", "..BBB...BBBB....", ".KKK.....KKKK..."],
};
Object.entries(hero).forEach(([n, m]) => svg(m, n));

/* ---------- ? block (glyph shadow is computed) ---------- */
const Q_GLYPH = { 3: [5, 6, 7, 8, 9], 4: [4, 5, 9, 10], 5: [4, 5, 9, 10], 6: [9, 10], 7: [8, 9], 8: [7, 8], 9: [7, 8], 11: [7, 8], 12: [7, 8] };
const isGlyph = (x, y) => (Q_GLYPH[y] || []).includes(x);
const blockFrame = (x, y, body, rivet) => {
  if (y === 15 || x === 15) return "K";
  if (y === 0 || x === 0) return "o";
  if ((x === 2 || x === 13) && (y === 2 || y === 13)) return rivet;
  return body;
};
svg(grid(16, 16, (x, y) => {
  const f = blockFrame(x, y, "Y", "K");
  if (f !== "Y") return f;
  if (isGlyph(x, y)) return "W";
  if (isGlyph(x - 1, y - 1)) return "o";
  return "Y";
}), "qblock");
svg(grid(16, 16, (x, y) => blockFrame(x, y, "N", "K")), "qblock-used");

/* ---------- brick & ground tiles ---------- */
svg(grid(16, 16, (x, y) => {
  if (y % 4 === 3) return "K";
  const band = Math.floor(y / 4) % 2;
  if ((band === 0 && x === 7) || (band === 1 && x === 15)) return "K";
  return y % 4 === 0 ? "p" : "N";
}), "brick");
svg(grid(16, 16, (x, y) => {
  if (x === 15 || y === 15) return "K";
  if (x === 0 || y === 0) return "p";
  if ((x === 10 && y < 9) || (y === 9 && x > 10) || (x === 5 && y > 9) || (y === 5 && x < 4)) return "K";
  if ((x === 11 && y < 9 && y > 0) || (y === 10 && x > 10 && x < 15) || (x === 6 && y > 10 && y < 15)) return "p";
  return "N";
}), "ground");

/* ---------- coin ---------- */
svg([
  "...YY...",
  ".YYYYYY.",
  ".YyYYoY.",
  "YYyYYoYY",
  "YYyYYoYY",
  "YYyYYoYY",
  "YYyYYoYY",
  "YYyYYoYY",
  "YYyYYoYY",
  "YYyYYoYY",
  "YYyYYoYY",
  ".YyYYoY.",
  ".YYYYYY.",
  "...YY...",
], "coin");

/* ---------- power-ups ---------- */
const MUSH = [
  ".....KKKKKK.....",
  "...KKRRWWRRKK...",
  "..KRRRWWWWRRRK..",
  ".KRRRRWWWWRRRRK.",
  ".KWWRRRWWRRRWWK.",
  "KWWWWRRRRRRWWWWK",
  "KWWWWRRRRRRWWWWK",
  "KWWWRRRRRRRRWWWK",
  "KRRRRRRRRRRRRRRK",
  "KRRKKKKKKKKKKRRK",
  ".KKccKccccKccKK.",
  "..KccKccccKccK..",
  "..KccKccccKccK..",
  "..KccccccccccK..",
  "...KccccccccK...",
  "....KKKKKKKK....",
];
svg(MUSH, "mushroom");
svg(MUSH.map((r) => r.replace(/R/g, "G")), "oneup");
svg([
  "....KKKKKKKK....",
  "..KKRRRRRRRRKK..",
  ".KRRYYYYYYYYRRK.",
  ".KRYYWWWWWWYYRK.",
  ".KRYYWWWWWWYYRK.",
  ".KRRYYYYYYYYRRK.",
  "..KKRRRRRRRRKK..",
  "....KKKKKKKK....",
  "......KGGK......",
  ".KKK..KGGK..KKK.",
  "KGGGK.KGGK.KGGGK",
  "KGlGGKKGGKKGGlGK",
  ".KGGGGKGGKGGGGK.",
  "..KGGGGGGGGGGK..",
  "...KKGGGGGGKK...",
  ".....KKKKKK.....",
], "fireflower");
svg([
  ".......KK.......",
  "......KYYK......",
  "......KYYK......",
  ".....KYYYYK.....",
  "KKKKKKYYYYKKKKKK",
  "KYYYYYYYYYYYYYYK",
  ".KYYYYYYYYYYYYK.",
  "..KYYYKYYKYYYK..",
  "...KYYKYYKYYK...",
  "...KYYYYYYYYK...",
  "..KYYYYYYYYYYK..",
  "..KYYYYKKYYYYK..",
  ".KYYYKK..KKYYYK.",
  ".KYYK......KYYK.",
  ".KKK........KKK.",
  "................",
], "star");

/* ---------- mushroom host (contact NPC) ---------- */
svg([
  ".....KKKKKK.....",
  "...KKWWRRWWKK...",
  "..KWWWRRRRWWWK..",
  ".KRRWWRRRRWWRRK.",
  ".KRRRWWWWWWRRRK.",
  "KWRRRWWWWWWRRRWK",
  "KWWRRWWWWWWRRWWK",
  "KWWWWWWWWWWWWWWK",
  ".KKKKKKKKKKKKKK.",
  "..KccKccccKccK..",
  "..KccKccccKccK..",
  "..KccccccccccK..",
  "...KcccKKcccK...",
  "..KBBKccccKBBK..",
  ".KccBBBBBBBBccK.",
  "..KKKK....KKKK..",
], "host");

/* ---------- scenery from shapes ---------- */
function blob(w, h, circles, fill, shade, outline) {
  const inside = (x, y) => circles.some(([cx, cy, r]) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r);
  return grid(w, h, (x, y) => {
    if (!inside(x, y)) return null;
    const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
    if (edge) return outline;
    if (shade && !inside(x, y + 3)) return shade;
    return fill;
  });
}
svg(blob(48, 24, [[12, 15, 8], [24, 11, 11], [36, 15, 8], [24, 17, 6], [16, 18, 4], [32, 18, 4]], "W", "L", "K"), "cloud");
svg(blob(48, 16, [[10, 16, 9], [24, 14, 12], [38, 16, 9]], "G", null, "K").map((r, y) => y === 15 ? r.replace(/K/g, "G") : r), "bush");

// stepped NES hill with a few dark spots
const HILL_W = 80, HILL_H = 38;
svg(grid(HILL_W, HILL_H, (x, y) => {
  const cx = HILL_W / 2, half = (y + 1) * (cx / HILL_H) * 1.15 + 6;
  const top = Math.abs(x + 0.5 - cx) <= half;
  if (!top) return null;
  const edgeHalf = y * (cx / HILL_H) * 1.15 + 6;
  if (y === 0 || Math.abs(x + 0.5 - cx) > edgeHalf) return "K";
  const spots = [[cx - 8, 14], [cx + 6, 20], [cx - 14, 26], [cx + 2, 30]];
  if (spots.some(([sx, sy]) => (x === Math.round(sx) || x === Math.round(sx) + 1) && (y >= sy && y <= sy + 3))) return "g";
  return "G";
}), "hill");

/* ---------- vine tile (repeats vertically) ---------- */
svg([
  ".......gG.......",
  ".......gG.......",
  "......gG........",
  "..GGG.gG........",
  ".GllGGgG........",
  ".GlGGgG.........",
  "..GG.gGG........",
  "......gG........",
  ".......gG.......",
  ".......gG.......",
  "........gG......",
  "........gG.GGG..",
  "........gGGGllG.",
  ".........gGGGlG.",
  "........gGG.GG..",
  ".......gG.......",
], "vine");

console.log("sprites written to assets/sprites/");
