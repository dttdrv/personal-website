// Epigenesis as a bench machine: a punched DNA tape is read by four feeler
// pins under an interpretation card, the result is pressed into a sealed
// module, and a second station replays it. The numbers are the repository's
// minimal example: the FASTA record ACGTRYSWKMBDHVN, 15 bases, sealed as the
// Development Module 0d835308…, which the separate validator reports valid.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../.claude/skills/anatomy/kit/lathe.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const SEQUENCE = "ACGTRYSWKMBDHVN";
const MODULE = "0d835308";
// IUPAC: each symbol is the set of bases it allows, so an ambiguous symbol punches several holes
const IUPAC = { A: "A", C: "C", G: "G", T: "T", R: "AG", Y: "CT", S: "CG", W: "AT", K: "GT", M: "AC", B: "CGT", D: "AGT", H: "ACT", V: "ACG", N: "ACGT" };
const TRACKS = { A: -4.5, C: -0.5, G: 5.5, T: 9.5 };
const FEED = 2.5;

const WIDTH = 760;
const HEIGHT = 400;

const PLATE = { x: -200, y: -44, w: 396, d: 86, r: 8 };
const PLATE_H = 12;
const FOOT_H = 5;

// the tape: one column every PITCH units, read where it passes under the pins
const PITCH = 8;
const TAPE = { y: -8, d: 21 };
const TAPE_Z = 8;
const TAPE_TOP = TAPE_Z + 0.5;
const BED = { x: -128, y: -12, w: 163, d: 29, r: 2 };
const RAILS = [{ x: BED.x, y: -12, w: BED.w, d: 3, r: 0.8 }, { x: BED.x, y: 14, w: BED.w, d: 3, r: 0.8 }];
const RAIL_TOP = TAPE_Z + 2.5;

const REEL_X = -158;
const COIL_R = 21;
const REEL_Z = TAPE_TOP + COIL_R;
const FLANGE_R = 27;
const REEL_AXIS = G.frameOf([REEL_X, 0, REEL_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);

const PIN_X = -60;
const BLOCK = { x: -70, y: -22, w: 20, d: 47, r: 2 };
const BLOCK_Z = [22, 32];
const PIN_R = 1.2;
const DROP = 2.2;

const COUNTER = [-28, -32];
const COUNTER_R = 11;
const COUNTER_Z = 20;
const COUNTER_TOP = COUNTER_Z + 6;

const PRESS_X = 70;
const VALID_X = 150;
const TRAVEL = VALID_X - PRESS_X;
const SLED_RAILS = [{ x: 46, y: -14, w: 136, d: 4, r: 1 }, { x: 46, y: 10, w: 136, d: 4, r: 1 }];
const MODULE_PLAN = { x: -10, y: -10, w: 20, d: 20, r: 2.4 };
const MODULE_Z = [6, 16];
const STAMP_R = 7;
const STAMP_Z = 22;
const STAMP_FALL = STAMP_Z - MODULE_Z[1];
const ARM = { x: PRESS_X - 7, y: -36, w: 14, d: 42, r: 2.5 };
const ARM_Z = [50, 58];
const COLUMN = [PRESS_X, -30];

const GANTRY = { x: VALID_X - 11, y: -26, w: 22, d: 52, r: 2 };
const GANTRY_Z = [26, 34];
const VALID_R = 9;
const LAMP = [VALID_X + 5, -18];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [REEL_X, 14, REEL_Z + FLANGE_R], [COLUMN[0], COLUMN[1], ARM_Z[1] + 8], [BLOCK.x, 20, 54]],
  WIDTH,
  HEIGHT,
  { pad: 28, azimuth: 56 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = ([x, y, z]) => k.depthOf([x, y, z], P);
const byDepth = (points) => [...points].sort((a, b) => depth([a[0], a[1], 0]) - depth([b[0], b[1], 0]));
const slab = (plan, z, h, tone = "mid", steps = 3, bevel = 0.4, extra = {}) => S(k.slabOf(plan, z, h, P, steps, bevel), { tone, ...extra });
const screws = (points, z) => L(points.map(([x, y]) => k.ring(x, y, 1.6, z, P, 14)).join(""), { tone: "lo" }) + D(points.map(([x, y]) => at([x, y, z])), { size: 0.45 });

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  out.push(screws(k.corners(PLATE, 10), 0));
  // a ruler along the front edge, one tick per tape column
  const strip = { x: -118, y: PLATE.y + PLATE.d - 14, w: 216, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, PITCH / 2, 2, strip.y + 0.8, 0.6, [2, 3.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // a label plate with three rule lines for its printing
  const label = { x: 110, y: 28, w: 38, d: 11, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "lo" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P), { tone: "faint" }));
  out.push(L([0, 1, 2].map((row) => k.lineOnTop([label.x + 4, label.y + 3.6 + row * 3], [label.x + label.w - 6 - row * 7, label.y + 3.6 + row * 3], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 3, label.y + 3, 0.8]), at([label.x + label.w - 3, label.y + label.d - 3, 0.8])], { size: 0.45 }));
  return out.join("");
}

// the supply reel stands on two uprights with an axle along y
const reelDisc = (y0, y1, r, style) => S(G.disc(y0, y1, r, REEL_AXIS, P), style);
function upright(y) {
  const plan = { x: REEL_X - 6, y, w: 12, d: 4, r: 1.2 };
  return slab({ x: plan.x - 4, y: y - 2, w: 20, d: 8, r: 1.5 }, 0, 3, "mid", 3, 0.4) + slab(plan, 3, REEL_Z + 4 - 3, "mid", 3, 0.4) + screws([[plan.x - 1.5, y + 2], [plan.x + plan.w + 1.5, y + 2]], 3);
}
function reelBack() {
  return upright(-23) + reelDisc(-23, -9.6, 2.4, { tone: "mid", crease: "none" }) + reelDisc(-10.8, -9.6, FLANGE_R, { tone: "mid" });
}
function coil() {
  return reelDisc(-8.4, 13.4, COIL_R, { tone: "hi", crease: "lo" });
}
function reelFront() {
  const out = [reelDisc(13.4, 14.6, FLANGE_R, { tone: "mid" })];
  out.push(L(G.circleOf(REEL_AXIS, 14.6, FLANGE_R - 3, P), { tone: "faint" }));
  out.push(L(G.circleOf(REEL_AXIS, 14.6, 8, P), { tone: "lo" }));
  out.push(D(G.dotsOf(REEL_AXIS, 14.6, 5.4, 6, P, { all: true }), { size: 0.45 }));
  out.push(reelDisc(14.6, 23, 2.4, { tone: "mid", crease: "none" }));
  out.push(upright(23));
  out.push(reelDisc(27, 29, 5, { tone: "mid" }));
  out.push(L(G.ribsOf(REEL_AXIS, 27, 29, 5, 24, P, { seams: true }), { tone: "lo" }));
  return out.join("");
}

function tapeSlab(x0, x1) {
  return S(k.slabOf({ x: x0, y: TAPE.y, w: x1 - x0, d: TAPE.d, r: 0 }, TAPE_Z, 0.5, P, 1), { tone: "hi", crease: "none" });
}

// every column of the tape, drawn once at rest and slid along x as the tape runs
function holes() {
  const out = [];
  for (let i = -16; i <= 30; i++) {
    const x = PIN_X - i * PITCH;
    out.push(`<path class="ep-hole" data-feed d="${k.ring(x, FEED, 0.8, TAPE_TOP, P, 12)}"/>`);
    const symbol = SEQUENCE[i];
    if (!symbol) continue;
    for (const base of IUPAC[symbol]) out.push(`<path class="ep-hole" d="${k.ring(x, TRACKS[base], 1.5, TAPE_TOP, P, 16)}"/>`);
  }
  return out.join("");
}

function bed() {
  const out = [slab(BED, 0, TAPE_Z, "mid", 3, 0.6)];
  out.push(L(k.lineOnTop([PIN_X, BED.y], [PIN_X, BED.y + BED.d], TAPE_Z, P), { tone: "faint" }));
  return out.join("");
}
const rail = (plan) => slab(plan, TAPE_Z, RAIL_TOP - TAPE_Z, "mid", 2, 0.3) + D([plan.x + 5, plan.x + plan.w - 5].map((x) => at([x, plan.y + plan.d / 2, RAIL_TOP])), { size: 0.4 });

// the reader: a bridge on two posts, four sprung pins and the interpretation card
const PINS = Object.entries(TRACKS).sort((a, b) => a[1] - b[1]);
function readerBack() {
  const out = [];
  for (const y of [BLOCK.y, BLOCK.y + BLOCK.d - 6]) out.push(slab({ x: BLOCK.x + 3, y, w: 14, d: 6, r: 1.2 }, 0, BLOCK_Z[0], "mid", 3, 0.4));
  return out.join("");
}
const pinLow = (y) => S(k.cylinder(PIN_X, y, PIN_R, TAPE_TOP, BLOCK_Z[0] - TAPE_TOP, P, 16), { tone: "hi", crease: "none" });
const pinHigh = (y) => S(k.cylinder(PIN_X, y, PIN_R, BLOCK_Z[1], 4, P, 16), { tone: "hi", crease: "none" }) + S(k.cylinder(PIN_X, y, 2.1, BLOCK_Z[1] + 4, 1.6, P, 20), { tone: "hi", crease: "lo" });
function block() {
  const out = [slab(BLOCK, BLOCK_Z[0], BLOCK_Z[1] - BLOCK_Z[0], "mid", 4, 0.6)];
  out.push(L(k.sideSeam(BLOCK, BLOCK_Z[0] + 3, P, 4), { tone: "faint" }));
  for (const [, y] of PINS) out.push(L(k.ring(PIN_X, y, 1.9, BLOCK_Z[1], P, 16), { tone: "lo" }));
  out.push(screws([[BLOCK.x + 16, BLOCK.y + 3], [BLOCK.x + 16, BLOCK.y + BLOCK.d - 3]], BLOCK_Z[1]));
  // the card holder and the interpretation card standing in it
  const holder = { x: BLOCK.x + 1, y: BLOCK.y + 4, w: 5, d: BLOCK.d - 8, r: 1 };
  out.push(slab(holder, BLOCK_Z[1], 3, "mid", 2, 0.3));
  const card = { x: holder.x + 1.6, y: holder.y + 1.5, w: 1.4, d: holder.d - 3, r: 0.4 };
  out.push(slab(card, BLOCK_Z[1] + 3, 19, "hi", 1, 0));
  const face = card.x + card.w;
  const rows = [[0, 1, 0, 1, 1, 0, 1, 0], [1, 0, 1, 1, 0, 0, 1, 1], [0, 1, 1, 0, 1, 0, 0, 1], [1, 1, 0, 0, 1, 1, 0, 1]];
  const punched = [];
  rows.forEach((row, r) => row.forEach((on, c) => { if (on) punched.push(k.sideRing([face, card.y + 4 + c * 4.2, BLOCK_Z[1] + 18 - r * 3.6], 0.9, "x", P, 12)); }));
  out.push(`<path class="ep-hole" d="${punched.join("")}"/>`);
  return out.join("");
}

function counter() {
  const [x, y] = COUNTER;
  const out = [S(k.cylinder(x, y, 5, 0, 3, P, 28), { tone: "mid" })];
  out.push(S(k.cylinder(x, y, 2.6, 3, COUNTER_Z - 3, P, 20), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(x, y, COUNTER_R, COUNTER_Z, COUNTER_TOP - COUNTER_Z, P, 56, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(x, y, COUNTER_R, COUNTER_TOP - 2.6, COUNTER_TOP, 64, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(x, y, COUNTER_R - 1.8, COUNTER_TOP, P, 56), { tone: "lo" }));
  const ticks = k.radialTicks(x, y, COUNTER_R - 2.4, 16, 4, COUNTER_TOP, [1.1, 2.3], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(x, y, 1.3, COUNTER_TOP, P, 14), { tone: "mid" }));
  return out.join("");
}
const needle = (cx, cy, r, z, share) => {
  const angle = share * Math.PI * 2;
  return k.lineOnTop([cx - Math.sin(angle) * 2.4, cy + Math.cos(angle) * 2.4], [cx + Math.sin(angle) * (r - 3), cy - Math.cos(angle) * (r - 3)], z + 0.2, P);
};

function sled() {
  return SLED_RAILS.map((plan) => slab(plan, 0, 3, "mid", 2, 0.3) + D([plan.x + 4, plan.x + plan.w - 4].map((x) => at([x, plan.y + 2, 3])), { size: 0.4 })).join("")
    + slab({ x: SLED_RAILS[0].x + SLED_RAILS[0].w, y: -16, w: 4, d: 32, r: 1 }, 0, 7, "mid", 2, 0.4);
}

function pressBack() {
  const [x, y] = COLUMN;
  const out = [slab({ x: x - 11, y: y - 12, w: 22, d: 20, r: 2 }, 0, 6, "mid", 4, 0.6)];
  out.push(screws([[x - 7, y - 8], [x + 7, y - 8], [x + 7, y + 4]], 6));
  out.push(S(k.cylinder(x, y, 5.6, 6, 4, P, 28), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 3.6, 10, ARM_Z[0] - 10, P, 24), { tone: "mid", crease: "none" }));
  out.push(L([24, 38].map((z) => k.sideArc(x, y, 3.6, z, P, 16)).join(""), { tone: "faint" }));
  return out.join("");
}

// the module on its sled; the seal appears on its top once the press has come down
function module() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(MODULE_PLAN, -4), 3, 0.1, P)}" style="filter:blur(4px)"/>`];
  const base = { x: -15, y: -16, w: 30, d: 32, r: 2 };
  out.push(slab(base, 3, 3, "mid", 3, 0.5));
  for (const [x, y] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) out.push(S(k.cylinder(x, y, 2, 6, 1.2, P, 16), { tone: "mid" }));
  out.push(`<g data-part="body">${S(k.slabOf(MODULE_PLAN, MODULE_Z[0], MODULE_Z[1] - MODULE_Z[0], P, 4, 0.8), { tone: "hi", crease: "lo" })}</g>`);
  out.push(L(k.sideSeam(MODULE_PLAN, MODULE_Z[0] + 2.5, P, 4), { tone: "faint" }));
  const seal = [L(k.ring(0, 0, 6.2, MODULE_Z[1], P, 40), { tone: "mid" }), L(k.ring(0, 0, 4.8, MODULE_Z[1], P, 40), { tone: "lo" })];
  seal.push(k.faceTextSvg(k.topMatrix([0, 1], MODULE_Z[1], P, "x"), MODULE, { size: 1.9, tone: "hi", anchor: "middle" }));
  out.push(`<g data-part="seal" opacity="0">${seal.join("")}</g>`);
  return out.join("");
}

function stamp() {
  const x = PRESS_X;
  return S(k.cylinder(x, 0, 1.8, STAMP_Z + 4, ARM_Z[0] + 4 - STAMP_Z - 4, P, 16), { tone: "mid", crease: "none" })
    + S(k.cylinder(x, 0, STAMP_R, STAMP_Z, 4, P, 40, 0.5), { tone: "hi", crease: "lo" })
    + L(k.sideArc(x, 0, STAMP_R, STAMP_Z + 1.4, P, 32), { tone: "faint" });
}

function arm() {
  const out = [slab(ARM, ARM_Z[0], ARM_Z[1] - ARM_Z[0], "mid", 4, 0.6)];
  out.push(L(k.sideSeam(ARM, ARM_Z[0] + 2.5, P, 4), { tone: "faint" }));
  out.push(S(k.cylinder(PRESS_X, 0, 4.2, ARM_Z[1], 6, P, 28), { tone: "mid" }));
  out.push(L(k.knurl(PRESS_X, 0, 4.2, ARM_Z[1] + 2.5, ARM_Z[1] + 6, 32, P), { tone: "lo" }));
  out.push(screws([[COLUMN[0] - 4, COLUMN[1] - 3], [COLUMN[0] + 4, COLUMN[1] - 3]], ARM_Z[1]));
  return out.join("");
}

function gantryBack() {
  return slab({ x: GANTRY.x + 4, y: GANTRY.y, w: 14, d: 6, r: 1.2 }, 0, GANTRY_Z[0], "mid", 3, 0.4);
}
function gantry() {
  const out = [];
  // the replay probe that rests on the module's seal
  out.push(S(k.cylinder(VALID_X, 0, 1.2, MODULE_Z[1] + 1, GANTRY_Z[0] - MODULE_Z[1] - 1, P, 14), { tone: "mid", crease: "none" }));
  out.push(slab({ x: GANTRY.x + 4, y: GANTRY.y + GANTRY.d - 6, w: 14, d: 6, r: 1.2 }, 0, GANTRY_Z[0], "mid", 3, 0.4));
  out.push(slab(GANTRY, GANTRY_Z[0], GANTRY_Z[1] - GANTRY_Z[0], "mid", 4, 0.6));
  out.push(L(k.sideSeam(GANTRY, GANTRY_Z[0] + 3, P, 4), { tone: "faint" }));
  out.push(screws([[GANTRY.x + 4, GANTRY.y + 3], [GANTRY.x + 4, GANTRY.y + GANTRY.d - 3]], GANTRY_Z[1]));
  const top = GANTRY_Z[1];
  out.push(S(k.cylinder(VALID_X, 6, VALID_R, top, 5, P, 56, 0.8), { tone: "hi", crease: "lo" }));
  out.push(L(k.knurl(VALID_X, 6, VALID_R, top + 2.6, top + 5, 56, P, 0.3), { tone: "lo" }));
  out.push(L(k.ring(VALID_X, 6, VALID_R - 1.8, top + 5, P, 56), { tone: "lo" }));
  const ticks = k.radialTicks(VALID_X, 6, VALID_R - 2.3, 16, 4, top + 5, [1, 2.1], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(L(k.ring(VALID_X, 6, 1.2, top + 5, P, 14), { tone: "mid" }));
  out.push(S(k.cylinder(LAMP[0], LAMP[1], 3.4, top, 1.6, P, 24), { tone: "mid" }));
  out.push(`<g data-part="lamp">${S(k.cylinder(LAMP[0], LAMP[1], 2.4, top + 1.6, 3, P, 24, 0.4), { tone: "hi", crease: "lo" })}</g>`);
  return out.join("");
}

// the tape is cut in two where the reel's front flange passes in front of it
const tapeLeft = { x0: REEL_X, x1: REEL_X + FLANGE_R };
const tapeRight = { x0: tapeLeft.x1, x1: BED.x + BED.w };
const clipOf = ({ x0, x1 }) => k.pathOf([[x0, TAPE.y - 0.1, TAPE_TOP], [x1, TAPE.y - 0.1, TAPE_TOP], [x1, TAPE.y + TAPE.d + 0.1, TAPE_TOP], [x0, TAPE.y + TAPE.d + 0.1, TAPE_TOP]].map(at), true);

const pinsLow = PINS.map(([base, y]) => `<g data-pin="${base}" data-part="low">${pinLow(y)}</g>`).join("");
const pinsHigh = PINS.map(([base, y]) => `<g data-pin="${base}" data-part="high">${pinHigh(y)}</g>`).join("");

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: `A bench machine for Epigenesis. A paper tape punched with the DNA record ${SEQUENCE} runs off a reel under four feeler pins, one for each base; an ambiguous symbol such as R is punched in two tracks. An interpretation card stands on the reader. After the fifteenth base a press seals a module stamped ${MODULE}, and the module slides to a second station that replays it and lights a lamp when the replay agrees.`,
  body: [
    `<defs><clipPath id="ep-left"><path d="${clipOf(tapeLeft)}"/></clipPath><clipPath id="ep-right"><path d="${clipOf(tapeRight)}"/></clipPath></defs>`,
    plate(),
    // the reader's signal cable runs along the bench to the press
    k.wireSvg(at([BLOCK.x + 17, BLOCK.y + 3, 6]), at([COLUMN[0] - 8, COLUMN[1] - 8, 6]), { via: [[BLOCK.x + 22, BLOCK.y + 3, 0.6], [BLOCK.x + 22, -40, 0.6], [COLUMN[0] - 13, -40, 0.6], [COLUMN[0] - 11, -38, 6]].map(at), tone: "mid" }),
    reelBack(),
    tapeSlab(tapeLeft.x0, tapeLeft.x1),
    `<g clip-path="url(#ep-left)"><g data-part="tape">${holes()}</g></g>`,
    coil(),
    reelFront(),
    bed(),
    rail(RAILS[0]),
    tapeSlab(tapeRight.x0, tapeRight.x1),
    `<g clip-path="url(#ep-right)"><g data-part="tape">${holes()}</g></g>`,
    rail(RAILS[1]),
    readerBack(),
    pinsLow,
    block(),
    pinsHigh,
    counter(),
    `<path data-part="count" class="iso-line" data-tone="lit" data-free="start" d="${needle(...COUNTER, COUNTER_R, COUNTER_TOP, 0)}" style="stroke-width:1.1"/>`,
    sled(),
    pressBack(),
    gantryBack(),
    `<g transform="${k.translateAlong(P, [PRESS_X, 0, 0])}"><g data-part="module">${module()}</g></g>`,
    `<g data-part="stamp">${stamp()}</g>`,
    arm(),
    gantry(),
    `<path data-part="replay" class="iso-line" data-tone="lit" data-free="start" d="${needle(VALID_X, 6, VALID_R, GANTRY_Z[1] + 5, 0)}" style="stroke-width:1.1"/>`,
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const SEQUENCE = ${JSON.stringify(SEQUENCE)}, IUPAC = ${JSON.stringify(IUPAC)}, MODULE = ${JSON.stringify(MODULE)};
const PITCH = ${PITCH}, DROP = ${DROP}, TRAVEL = ${TRAVEL}, STAMP_FALL = ${STAMP_FALL};
const COUNTER = ${JSON.stringify(COUNTER)}, COUNTER_R = ${COUNTER_R}, COUNTER_TOP = ${COUNTER_TOP};
const VALID = [${VALID_X}, 6], VALID_R = ${VALID_R}, VALID_TOP = ${GANTRY_Z[1] + 5};
const svg = stage.querySelector("svg");
const part = (name) => [...svg.querySelectorAll('[data-part="' + name + '"]')];
const tapes = part("tape"), [count] = part("count"), [replay] = part("replay"), [mod] = part("module"), [seal] = part("seal"), [stampEl] = part("stamp");
const [lamp] = part("lamp");
const pins = [...svg.querySelectorAll("[data-pin]")];
let said = "";
const needle = ${needle.toString().replace("k.lineOnTop", "lineOnTop")};
const MEANING = { A: "A", C: "C", G: "G", T: "T", R: "A or G", Y: "C or T", S: "C or G", W: "A or T", K: "G or T", M: "A or C", B: "not A", D: "not C", H: "not G", V: "not T", N: "any base" };
const STEP = 0.62, LEAD = 1.2;
const READ_END = LEAD + SEQUENCE.length * STEP;
const STAMP_AT = READ_END + 0.5, SLIDE_AT = STAMP_AT + 1.4, REPLAY_AT = SLIDE_AT + 1.5, REPLAY_END = REPLAY_AT + 1.6, LOOP = REPLAY_END + 3;
const follow = (value, target, dt, seconds) => value + (target - value) * (1 - Math.exp(-dt / seconds));
const ease = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const state = { shift: -2 * PITCH, drop: {}, count: 0, press: 0, slide: 0, sealed: 0, replay: 0, shown: 1 };
let clock = 0, scrub = null, frame = 0, last = 0, visible = false, idle = 0;

// where the timeline wants everything at time t
function plan(t) {
  const column = Math.min(SEQUENCE.length - 1, Math.floor((t - LEAD) / STEP));
  const reading = t >= LEAD && t < READ_END;
  const want = {
    shift: t < LEAD ? -2 * PITCH : t < READ_END ? column * PITCH : t < LOOP - 0.9 ? (SEQUENCE.length + 1) * PITCH : -2 * PITCH,
    count: t < LEAD ? 0 : Math.min(SEQUENCE.length, column + 1),
    press: t < STAMP_AT ? 0 : t < STAMP_AT + 0.55 ? ease((t - STAMP_AT) / 0.55) : t < STAMP_AT + 0.8 ? 1 : 1 - ease((t - STAMP_AT - 0.8) / 0.5),
    slide: t < SLIDE_AT ? 0 : t < LOOP - 0.6 ? 1 : 0,
    sealed: t >= STAMP_AT + 0.5 && t < LOOP - 0.6 ? 1 : 0,
    replay: t < REPLAY_AT || t >= LOOP - 0.6 ? 0 : Math.min(1, (t - REPLAY_AT) / (REPLAY_END - REPLAY_AT)),
    shown: t >= LOOP - 0.6 && t < LOOP - 0.1 ? 0 : 1,
  };
  let text;
  if (t < LEAD) text = "tape loaded · " + SEQUENCE.length + " symbols";
  else if (reading) { const s = SEQUENCE[column]; text = "base " + (column + 1) + " of " + SEQUENCE.length + " · " + s + (s.length && MEANING[s] !== s ? " = " + MEANING[s] : ""); }
  else if (t < SLIDE_AT) text = SEQUENCE.length + " bases read · sealed " + MODULE;
  else if (t < REPLAY_AT) text = "sealed " + MODULE + " · to the replay station";
  else if (t < REPLAY_END) text = "replaying " + MODULE + " · " + Math.round(want.replay * SEQUENCE.length) + " of " + SEQUENCE.length;
  else text = "replayed · valid";
  return { want, text };
}

function draw(text) {
  for (const tape of tapes) tape.setAttribute("transform", translateAlong(P, [state.shift, 0, 0]));
  const column = Math.round(state.shift / PITCH), offset = Math.abs(state.shift - column * PITCH);
  const symbol = SEQUENCE[column];
  for (const pin of pins) {
    const base = pin.dataset.pin;
    const down = symbol && IUPAC[symbol].includes(base) && offset < 0.6;
    pin.setAttribute("transform", translateAlong(P, [0, 0, -(state.drop[base] || 0)]));
    pin.querySelectorAll(".iso-solid").forEach((el) => el.toggleAttribute("data-lit", (state.drop[base] || 0) > DROP / 2));
    pin.dataset.down = down ? "1" : "";
  }
  count.setAttribute("d", needle(COUNTER[0], COUNTER[1], COUNTER_R, COUNTER_TOP, state.count / 16));
  stampEl.setAttribute("transform", translateAlong(P, [0, 0, -state.press * STAMP_FALL]));
  mod.setAttribute("transform", translateAlong(P, [state.slide * TRAVEL, 0, 0]));
  mod.style.opacity = state.shown.toFixed(3);
  seal.setAttribute("opacity", state.sealed.toFixed(3));
  replay.setAttribute("d", needle(VALID[0], VALID[1], VALID_R, VALID_TOP, state.replay * SEQUENCE.length / 16));
  lamp.querySelectorAll(".iso-solid").forEach((el) => el.toggleAttribute("data-lit", state.replay >= 0.999));
  if (text && text !== said) say(said = text);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  let goal;
  if (scrub !== null) {
    goal = plan(LEAD + scrub * STEP + 0.01);
  } else {
    clock = (clock + dt) % LOOP;
    goal = plan(clock);
  }
  const w = goal.want;
  state.shift = follow(state.shift, w.shift, dt, w.shift < state.shift - PITCH ? 0.25 : 0.12);
  const column = Math.round(state.shift / PITCH), offset = Math.abs(state.shift - column * PITCH), symbol = SEQUENCE[column];
  for (const base of "ACGT") {
    const down = symbol && IUPAC[symbol].includes(base) && offset < 0.6 ? DROP : 0;
    state.drop[base] = follow(state.drop[base] || 0, down, dt, 0.05);
  }
  state.count = follow(state.count, w.count, dt, 0.15);
  state.press = w.press;
  state.slide = follow(state.slide, w.slide, dt, 0.3);
  state.sealed = follow(state.sealed, w.sealed, dt, 0.08);
  state.replay = follow(state.replay, w.replay, dt, 0.08);
  state.shown = follow(state.shown, w.shown, dt, 0.1);
  if (w.shown === 0 && state.shown < 0.05) { state.slide = 0; state.sealed = 0; }
  draw(goal.text);
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still) { last = 0; frame = requestAnimationFrame(tick); } };
const seen = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" });
seen.observe(stage);
signal.addEventListener("abort", () => { seen.disconnect(); cancelAnimationFrame(frame); clearTimeout(idle); visible = false; });

// pointing at the tape reads the column under the pointer
stage.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  const box = svg.getBoundingClientRect();
  const share = Math.min(1, Math.max(0, ((event.clientX - box.left) / box.width - 0.15) / 0.5));
  scrub = Math.round(share * (SEQUENCE.length - 1));
  clearTimeout(idle);
  idle = setTimeout(() => { scrub = null; clock = 0; }, 3600);
  run();
}, { signal });
stage.addEventListener("keydown", (event) => {
  const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
  if (!step) return;
  event.preventDefault();
  scrub = Math.min(SEQUENCE.length - 1, Math.max(0, (scrub ?? 0) + step));
  clearTimeout(idle);
  idle = setTimeout(() => { scrub = null; clock = 0; }, 3600);
  run();
}, { signal });

if (still) {
  // one still frame: the module sealed, replayed and valid, the reader on an ambiguous base
  Object.assign(state, { shift: 4 * PITCH, count: 15, slide: 1, sealed: 1, replay: 1 });
  for (const base of "ACGT") state.drop[base] = IUPAC.R.includes(base) ? DROP : 0;
  draw("replayed · valid");
} else draw(plan(0).text);
`;

const MACHINE_CSS = `
.ep-hole{fill:var(--anatomy-shade-0);stroke:var(--anatomy-mid);stroke-width:var(--anatomy-weight)}
.iso[data-theme]{--e-ink:var(--ink,#F2F2F2);--e-paper:var(--paper,#101010);--e-lit:var(--accent,#6F8FFF)}
.iso[data-theme="light"]{--e-ink:var(--ink,#0E0E0E);--e-paper:var(--paper,#FFFFFF);--e-lit:var(--accent,#0000FF)}
/* drawn like the plates around it: ink lines on the page's paper, faint washes for volume, one blue part */
.iso[data-theme],.iso[data-theme="light"]{
--anatomy-page:var(--e-paper);--anatomy-card:var(--e-paper);--anatomy-paper:var(--e-paper);--anatomy-face:var(--e-paper);--anatomy-top:var(--e-paper);
--anatomy-shade-0:color-mix(in srgb,var(--e-ink) 16%,var(--e-paper));--anatomy-shade-1:color-mix(in srgb,var(--e-ink) 10%,var(--e-paper));
--anatomy-shade-2:color-mix(in srgb,var(--e-ink) 6%,var(--e-paper));--anatomy-shade-3:color-mix(in srgb,var(--e-ink) 3%,var(--e-paper));
--anatomy-lit-top:color-mix(in srgb,var(--e-lit) 12%,var(--e-paper));--anatomy-lit-shade:color-mix(in srgb,var(--e-lit) 22%,var(--e-paper));
--anatomy-hi:var(--e-ink);--anatomy-mid:color-mix(in srgb,var(--e-ink) 80%,var(--e-paper));--anatomy-lo:color-mix(in srgb,var(--e-ink) 58%,var(--e-paper));
--anatomy-faint:color-mix(in srgb,var(--e-ink) 30%,var(--e-paper));--anatomy-lit:var(--e-lit);--anatomy-dot:var(--e-ink);
--anatomy-mono:var(--text,ui-sans-serif,system-ui,sans-serif);--anatomy-weight:.8px}
.iso .iso-halo{display:none}
`;

// the preview page, for looking at the figure on its own
const body = k.plateHtml({
  fig: "",
  title: "",
  hint: "Point at the tape to read a base",
  readout: "tape loaded · 15 symbols",
  keys: [],
  caption: "",
  body: `<div class="iso-stage" tabindex="0" aria-label="Epigenesis as a machine: arrow keys read the tape one base at a time">${svg}</div>`,
});
const preview = `const stage = document.querySelector(".iso-stage"), readout = document.querySelector("[data-readout]");
const say = (text) => { readout.textContent = text; }, signal = new AbortController().signal, still = matchMedia("(prefers-reduced-motion: reduce)").matches;
${live}`;
const file = theme === "light" ? "epigenesis-light.html" : "epigenesis.html";
writeFileSync(join(HERE, file), k.pageHtml({ title: "Epigenesis", theme, body: `<style>${MACHINE_CSS}</style>` + body, script: kitScript() + preview, width: 900 }));
console.log("wrote", file);

// the module the site loads: the drawing, the kit it moves with, and the live code
const site = `// Generated by figures/epigenesis/build.mjs with the Anatomy kit. Rebuild it rather than editing it.
const CSS = ${JSON.stringify(k.ISO_CSS + MACHINE_CSS)};
const SVG = ${JSON.stringify(svg)};
${kitScript()}
export const ratio = ${HEIGHT / WIDTH};
export function mount(stage, say, signal, still) {
  if (!document.getElementById("iso-css")) document.head.append(Object.assign(document.createElement("style"), { id: "iso-css", textContent: CSS }));
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  const paint = () => { stage.dataset.theme = scheme.matches ? "dark" : "light"; };
  paint();
  scheme.addEventListener("change", paint, { signal });
  stage.classList.add("iso");
  stage.innerHTML = SVG;
${live}
}
`;
writeFileSync(join(HERE, "../../home/machine.js"), site);
console.log("wrote home/machine.js");
