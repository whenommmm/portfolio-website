// The symbiote for the day/night switch.
//
// A field computed on the GPU (a front spreading from the toggle, pushed into
// lobes and torn into streaks by noise) decides where the new theme shows: its
// zero line is traced into a sharp vector path (marching squares) that clips
// the new screen's snapshot. On a live canvas above everything, the symbiote
// itself is drawn at full resolution: a band of glossy black goo along the
// front, and rope-like tendrils with a crisp white highlight down each one.
// Going to night the suit goes on: tendrils shoot ahead of the goo, latch on,
// pull taut and drag it over. Going to day it strips off: the goo is dragged
// back while ropes cling to the page, stretch thin, lose their grip and whip away.

// Whether the last switch stopped part-way (it never does so twice in a row),
// and which way the last stop was going. Switches alternate direction, so
// without the second one the stops would all land on the same direction: the
// direction that stopped last gets half the chance, to hand the other a turn.
let hesitated = false;
let lastStop = null;

// Tuning (lengths in CSS px)
export const INK = {
  duration: 1900, // ms for the whole spread
  cell: 3,        // grid spacing the edge is traced at
  maxDpr: 2,      // the goo is drawn at up to this many device px per CSS px
  tendrils: 40,   // going to night: ropes that shoot ahead of the goo and latch on
  feelers: 9,     // free tentacles on the front: writhing ahead going to night, clawing back going to day
  strands: 30,    // going to day: ropes that cling to the page until they're torn off
  hesitates: 0.7, // chance that it stops part-way, looks about, and carries on (never twice running)
};

// ── Shaders ──────────────────────────────────────────────────────────────────
const NOISE = `
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * noise(p); p = p * 2.07 + 17.1; a *= 0.5; }
  return s / 0.9375;
}`;

// The field, one value per grid cell: > 0 is the new theme. R holds it finely
// (±16 px) for tracing the edge, G coarsely (±64 px) for the goo band.
const QUAD_VS = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;
const FIELD_FS = `
precision highp float;
uniform vec2 uOrigin;
uniform float uR;      // radius of the front
uniform float uDrift;  // slow crawl of the edge, 0..1 over the spread
uniform float uSeed;
uniform vec2 uGrid;    // grid size in cells, border included
uniform float uCell;
uniform float uPad;    // cells outside the viewport on each side
uniform float uTear;   // how torn the front is: full putting the suit on, calmer stripping off
${NOISE}
void main() {
  vec2 cellPos = gl_FragCoord.xy - 0.5; // row 0 is the top of the screen
  // The outermost ring of cells is always clear, so every outline closes
  if (cellPos.x < 0.5 || cellPos.y < 0.5 || cellPos.x > uGrid.x - 1.5 || cellPos.y > uGrid.y - 1.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  vec2 p = (cellPos - uPad) * uCell;
  float d = length(p - uOrigin);
  float ramp = smoothstep(0.0, 150.0, uR); // the first blot starts nearly round

  // Big lobes and bays, domain-warped and crawling slowly
  vec2 q = p / 260.0 + uSeed;
  vec2 w = vec2(fbm(q + uDrift * 0.4), fbm(q + 5.2 - uDrift * 0.3));
  float lobes = (fbm(p / 240.0 + w * 1.6 + uSeed) - 0.5) * 320.0;
  float mid = (fbm(p / 90.0 + w * 1.8 + uSeed * 1.3) - 0.5) * 70.0;

  // Fibres: noise stretched along a slowly turning direction
  float ang = fbm(p / 420.0 + uSeed * 0.7) * 6.2832;
  vec2 fd = vec2(cos(ang), sin(ang));
  vec2 fp = vec2(dot(p, fd) / 60.0, dot(p, vec2(-fd.y, fd.x)) / 10.0);
  float fib = (noise(fp + uSeed) - 0.5) * 16.0 + (noise(fp * 2.3 + 3.1) - 0.5) * 5.0;

  float f = uR - d + (lobes + mid + fib) * ramp;

  // Torn streaks along the front: splashes thrown just ahead of it, and
  // patches it hasn't closed over yet just behind it
  vec2 sp = vec2(dot(p, fd) / 85.0, dot(p, vec2(-fd.y, fd.x)) / 9.0);
  float sn = noise(sp + uSeed * 3.0) * 0.8 + noise(sp * 2.1 + 7.7) * 0.2;
  float ahead = smoothstep(130.0, 20.0, -f) * step(f, 0.0) * ramp * uTear;
  f = mix(f, max(f, (sn - 0.74) * 90.0), ahead);
  float sn2 = noise(sp * 0.8 + 31.0 + uSeed) * 0.8 + noise(sp * 1.9 + 13.0) * 0.2;
  float behind = smoothstep(100.0, 12.0, f) * step(0.0, f) * ramp * uTear;
  f = mix(f, min(f, (0.76 - sn2) * 90.0), behind);

  gl_FragColor = vec4(clamp(f, -16.0, 16.0) / 32.0 + 0.5, clamp(f, -64.0, 64.0) / 128.0 + 0.5, 0.0, 1.0);
}`;

// Glossy black: a tube's surface normal tilts across it (v from -1 to 1) toward
// \`side\`, and a light from the top-left leaves one crisp white streak
const GLOSS = `
vec3 goo(float v, vec2 side) {
  v = clamp(v, -1.0, 1.0);
  vec3 n = normalize(vec3(side * v, sqrt(max(0.0, 1.0 - v * v))));
  float l = dot(n, normalize(vec3(-0.36, -0.46, 0.81)));
  float streak = smoothstep(0.88, 0.92, l);
  float sheen = smoothstep(0.45, 0.88, l) * 0.1;
  float rim = smoothstep(0.75, 1.0, abs(v)) * 0.05;
  vec3 c = vec3(0.016, 0.018, 0.026) + vec3(0.62, 0.68, 0.8) * sheen + vec3(0.5, 0.56, 0.7) * rim;
  return mix(c, vec3(0.9, 0.93, 0.98), streak);
}`;

// The goo band along the front, read from the field (full-screen pass)
const BAND_FS = `
precision highp float;
uniform sampler2D uField;
uniform vec2 uGrid;
uniform float uCell;
uniform float uPad;
uniform float uDpr;
uniform float uHeight;  // canvas height in device px
uniform float uMode;    // 1: suit on (goo inside the front), -1: stripping off (goo outside it)
uniform float uSeed;
uniform float uStart;   // grows the band in as the first blot appears
${NOISE}
${GLOSS}
float fieldAt(vec2 css) {
  vec4 s = texture2D(uField, (css / uCell + uPad + 0.5) / uGrid);
  float fine = (s.r - 0.5) * 32.0;
  return abs(fine) < 15.0 ? fine : (s.g - 0.5) * 128.0;
}
float coarseAt(vec2 css) { return (texture2D(uField, (css / uCell + uPad + 0.5) / uGrid).g - 0.5) * 128.0; }
void main() {
  vec2 css = vec2(gl_FragCoord.x, uHeight - gl_FragCoord.y) / uDpr;
  float f = fieldAt(css);
  // Stripping off, the lip of goo is wider, so it reads against the dark page it's leaving
  float width = (11.0 + 15.0 * noise(css / 80.0 + uSeed)) * uStart * (uMode > 0.0 ? 1.0 : 1.7);
  if (f * uMode < -2.0 || f * uMode > width + 3.0) discard;

  // Distance to the edge in px, and which way is "into" the goo, from the
  // field's broad shape so the gloss follows the goo rather than every tear
  float e = uCell * 3.0;
  vec2 grad = vec2(coarseAt(css + vec2(e, 0.0)) - coarseAt(css - vec2(e, 0.0)),
                   coarseAt(css + vec2(0.0, e)) - coarseAt(css - vec2(0.0, e))) / (2.0 * e);
  float g = max(length(grad), 0.25);
  float dist = f / g * uMode;
  vec2 inward = grad / g * uMode;

  float aa = 0.6 / uDpr;
  float cover = smoothstep(-0.7 - aa, -0.7 + aa, dist) * (1.0 - smoothstep(width - aa, width + aa, dist));
  if (cover <= 0.0) discard;
  gl_FragColor = vec4(goo((dist - width * 0.5) / (width * 0.5), inward) * cover, cover);
}`;

// Tendrils and strands: triangles built in JS, one vertex = (x, y, v, side)
const TUBE_VS = `
attribute vec2 aPos;
attribute float aV;
attribute vec2 aSide;
uniform vec2 uView; // viewport in CSS px
varying float vV;
varying vec2 vSide;
void main() {
  vV = aV;
  vSide = aSide;
  gl_Position = vec4(aPos.x / uView.x * 2.0 - 1.0, 1.0 - aPos.y / uView.y * 2.0, 0.0, 1.0);
}`;
const TUBE_FS = `
precision highp float;
varying float vV;
varying vec2 vSide;
${GLOSS}
void main() { gl_FragColor = vec4(goo(vV, normalize(vSide)), 1.0); }`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}
function link(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

// ── Marching squares ─────────────────────────────────────────────────────────
// Corners: top-left 1, top-right 2, bottom-right 4, bottom-left 8.
// Edges: top 0, right 1, bottom 2, left 3. Each crossed cell gives directed
// segments with the inside always on the same side, so outlines come out
// consistently wound (holes the other way) and chain into closed loops.
const MID = [[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]];
const CORNER = [[0, 0, 1], [1, 0, 2], [1, 1, 4], [0, 1, 8]];
const T = 0, R = 1, B = 2, L = 3;
const PAIRS = {
  1: [[T, L]], 2: [[T, R]], 3: [[L, R]], 4: [[R, B]], 6: [[T, B]], 7: [[L, B]], 8: [[L, B]],
  9: [[T, B]], 11: [[R, B]], 12: [[L, R]], 13: [[T, R]], 14: [[T, L]],
};
const SADDLE = { // centre inside / centre outside
  5: [[[T, R], [L, B]], [[T, L], [R, B]]],
  10: [[[T, L], [R, B]], [[T, R], [L, B]]],
};
function orient(pair, mask) {
  const [a, b] = pair.map((e) => MID[e]);
  let s = 0;
  for (const [cx, cy, bit] of CORNER) {
    const cross = (b[0] - a[0]) * (cy - a[1]) - (b[1] - a[1]) * (cx - a[0]);
    if (Math.abs(cross) > 1e-9) s += Math.sign(cross) * (mask & bit ? 1 : -1);
  }
  return s < 0 ? [pair[1], pair[0]] : pair;
}
const TABLE = {};
for (const [mask, pairs] of Object.entries(PAIRS)) TABLE[mask] = pairs.map((p) => orient(p, +mask));
const SADDLES = {};
for (const [mask, [inside, outside]] of Object.entries(SADDLE)) {
  SADDLES[mask] = [inside.map((p) => orient(p, +mask)), outside.map((p) => orient(p, +mask))];
}

/** The field's zero line (R channel, 127.5 = edge) as closed loops of path data, in CSS px. */
function traceField(bytes, nx, ny, cell, pad) {
  const H = ny * (nx - 1); // horizontal edges come first, then vertical
  const next = new Int32Array(H + (ny - 1) * nx).fill(-1);
  const v = (i, j) => bytes[(j * nx + i) * 4] - 127.5;
  const edgeId = (e, i, j) => (e === T ? j * (nx - 1) + i : e === B ? (j + 1) * (nx - 1) + i : e === L ? H + j * nx + i : H + j * nx + i + 1);

  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const tl = v(i, j), tr = v(i + 1, j), br = v(i + 1, j + 1), bl = v(i, j + 1);
      const mask = (tl > 0 ? 1 : 0) | (tr > 0 ? 2 : 0) | (br > 0 ? 4 : 0) | (bl > 0 ? 8 : 0);
      if (mask === 0 || mask === 15) continue;
      const segs = SADDLES[mask] ? SADDLES[mask][tl + tr + br + bl > 0 ? 0 : 1] : TABLE[mask];
      for (const [from, to] of segs) next[edgeId(from, i, j)] = edgeId(to, i, j);
    }
  }

  // Where an edge is crossed, interpolated to the field's zero
  const point = (id) => {
    let i, j, x, y;
    if (id < H) {
      j = Math.floor(id / (nx - 1)); i = id - j * (nx - 1);
      const a = v(i, j), b = v(i + 1, j);
      x = i + a / (a - b); y = j;
    } else {
      const k = id - H;
      j = Math.floor(k / nx); i = k - j * nx;
      const a = v(i, j), b = v(i, j + 1);
      x = i; y = j + a / (a - b);
    }
    return [(x - pad) * cell, (y - pad) * cell];
  };

  const parts = [];
  for (let start = 0; start < next.length; start++) {
    if (next[start] < 0) continue;
    let id = start, area = 0, px = null, py = null, first = null, count = 0, d = '';
    while (next[id] >= 0) {
      const [x, y] = point(id);
      const to = next[id];
      next[id] = -1;
      id = to;
      if (px !== null && Math.abs(x - px) + Math.abs(y - py) < 0.6) continue; // skip near-duplicates
      if (first) area += px * y - x * py; else first = [x, y];
      d += (count ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      px = x; py = y; count++;
    }
    if (count < 3) continue;
    area += px * first[1] - first[0] * py;
    if (Math.abs(area) < 12) continue; // dust
    parts.push(d + 'Z');
  }
  return parts.join('');
}

// ── Tendrils ─────────────────────────────────────────────────────────────────
function seeded(seed) {
  let s = Math.floor(seed * 1e6) % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smoothstep = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/**
 * Append a tube along a centreline to `out` as triangles of (x, y, v, sideX, sideY).
 * `points` are [x, y] along the line, `widths` the full width at each.
 */
function pushTube(out, points, widths) {
  const n = points.length;
  if (n < 2) return;
  const verts = [];
  for (let k = 0; k < n; k++) {
    const [x0, y0] = points[Math.max(0, k - 1)];
    const [x1, y1] = points[Math.min(n - 1, k + 1)];
    let tx = x1 - x0, ty = y1 - y0;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len; ty /= len;
    const sx = -ty, sy = tx; // the v = +1 side
    const w = widths[k] / 2;
    const [x, y] = points[k];
    verts.push([x - sx * w, y - sy * w, -1, sx, sy], [x + sx * w, y + sy * w, 1, sx, sy]);
  }
  for (let k = 0; k < n - 1; k++) {
    const [a, b, c, d] = [verts[2 * k], verts[2 * k + 1], verts[2 * k + 2], verts[2 * k + 3]];
    out.push(...a, ...b, ...c, ...b, ...d, ...c);
  }
}

/** Walk a centreline from (x, y): `heading(s)` gives the direction at s in 0..1 along `length`. */
function centreline(x, y, length, heading, steps) {
  const pts = [[x, y]];
  for (let k = 1; k <= steps; k++) {
    const h = heading(k / steps);
    x += Math.cos(h) * length / steps;
    y += Math.sin(h) * length / steps;
    pts.push([x, y]);
  }
  return pts;
}

// ── Public API ───────────────────────────────────────────────────────────────
let maker = null;

// Where the pointer last moved, so the goo can turn towards it
let pointer = null;
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => { pointer = { x: e.clientX, y: e.clientY, at: performance.now() }; }, { passive: true });
}

/** Points on the things a visitor can see (headings, buttons, cards, pictures), for the goo to reach for. */
function thingsOnScreen(width, height, rand, count) {
  const spots = [];
  const things = [...document.querySelectorAll('main h1, main h2, main h3, main a, main button, main img, main article, main li, main p')].slice(0, 400);
  for (const el of things) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8 || r.right < 0 || r.bottom < 0 || r.left > width || r.top > height) continue;
    // Somewhere on its outline, where a tendril would catch hold
    const onSide = rand() < r.height / (r.width + r.height);
    const px = onSide ? (rand() < 0.5 ? r.left : r.right) : r.left + rand() * r.width;
    const py = onSide ? r.top + rand() * r.height : (rand() < 0.5 ? r.top : r.bottom);
    if (px > 4 && py > 4 && px < width - 4 && py < height - 4) spots.push([px, py]);
  }
  // A random handful
  for (let k = spots.length - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [spots[k], spots[j]] = [spots[j], spots[k]]; }
  return spots.slice(0, count);
}

/** Compile the shaders once (cheap to call again); resolves to the ink maker, or rejects without WebGL. */
export async function loadInk() {
  if (maker) return maker;
  // The goo's canvas covers the screen during a switch; its own view-transition
  // name lifts it above both snapshots (see index.css)
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483647;view-transition-name:ink-goo';
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
  // The field gets a context of its own: reading it back every frame then
  // never has to wait for the goo's canvas to reach the screen
  const fieldCanvas = document.createElement('canvas');
  const fgl = fieldCanvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true });
  if (!gl || !fgl) throw new Error('WebGL unavailable');

  const field = link(fgl, QUAD_VS, FIELD_FS);
  const band = link(gl, QUAD_VS, BAND_FS);
  const tube = link(gl, TUBE_VS, TUBE_FS);
  const makeQuad = (c) => {
    const b = c.createBuffer();
    c.bindBuffer(c.ARRAY_BUFFER, b);
    c.bufferData(c.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), c.STATIC_DRAW);
    return b;
  };
  const quad = makeQuad(gl);
  const fieldQuad = makeQuad(fgl);
  const tubeBuffer = gl.createBuffer();
  const fieldTex = gl.createTexture();
  const u = (prog, name) => gl.getUniformLocation(prog, name);
  const fu = (name) => fgl.getUniformLocation(field, name);

  const drawQuad = (c, buffer, prog) => {
    c.bindBuffer(c.ARRAY_BUFFER, buffer);
    const a = c.getAttribLocation(prog, 'a');
    c.enableVertexAttribArray(a);
    c.vertexAttribPointer(a, 2, c.FLOAT, false, 0, 0);
    c.drawArrays(c.TRIANGLE_STRIP, 0, 4);
    c.disableVertexAttribArray(a);
  };

  maker = {
    canvas,
    /**
     * Start a spread from (x, y) over a width × height viewport. `mode` is
     * 'on' (to night: the suit goes on) or 'off' (to day: it strips off).
     * Returns frame(progress 0..1): draws the goo on the canvas and returns the
     * new screen's outline as path data for clip-path. frame.duration is how
     * long the whole thing takes, in ms: longer when it hesitates part-way.
     */
    spread({ x, y, width, height, mode, seed = Math.random() * 100, hesitate = !hesitated && Math.random() < INK.hesitates * (mode === lastStop ? 0.5 : 1) }) {
      hesitated = hesitate;
      if (hesitate) lastStop = mode;
      const { cell } = INK;
      const pad = 2;
      const dpr = Math.min(window.devicePixelRatio || 1, INK.maxDpr);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const nx = Math.ceil(width / cell) + 2 * pad + 1;
      const ny = Math.ceil(height / cell) + 2 * pad + 1;

      fieldCanvas.width = nx;
      fieldCanvas.height = ny;
      gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const bytes = new Uint8Array(nx * ny * 4);
      const fieldAt = (px, py) => {
        const i = Math.round(px / cell + pad), j = Math.round(py / cell + pad);
        if (i < 0 || j < 0 || i >= nx || j >= ny) return -1;
        return bytes[(j * nx + i) * 4] - 127.5;
      };

      // Far enough that even the deepest bay of the front has cleared the far corner
      const far = Math.max(Math.hypot(x, y), Math.hypot(width - x, y), Math.hypot(x, height - y), Math.hypot(width - x, height - y));
      const R0 = 26;
      const Rend = far + 230;
      // A held blot, a surge, and a slow soak into the last corner
      const ease = (t) => 0.65 * t * t * (3 - 2 * t) + 0.35 * t;
      const radius = (t) => R0 + (Rend - R0) * ease(t);

      // Sometimes it stops part-way, as if something caught its attention: the
      // front slows, draws back a touch and shifts about while its tentacles
      // keep feeling around, then it surges on. `pause` is when and for how long.
      const pause = hesitate ? { at: INK.duration * (0.32 + Math.random() * 0.22), ms: 750 + Math.random() * 450 } : null;
      const duration = INK.duration + (pause ? pause.ms : 0);
      // How far through its hold it is (0 outside it, 1 in the thick of it)
      const holding = (ms) => (pause ? smoothstep(pause.at - 150, pause.at + 120, ms) * (1 - smoothstep(pause.at + pause.ms - 120, pause.at + pause.ms + 150, ms)) : 0);
      // Spread progress 0..1 at `ms` of real time: the hold is time taken out of it
      const progress = (ms) => clamp01((ms - (pause ? pause.ms * smoothstep(pause.at - 150, pause.at + pause.ms + 150, ms) : 0)) / INK.duration);
      let held = 0; // this frame's holding(), for the tentacles

      /** Along the ray from the toggle at angle a, how far the front is (searching outward from `from`). */
      const frontAlong = (a, from = 0) => {
        const ca = Math.cos(a), sa = Math.sin(a);
        let last = from;
        for (let r = from; r < far + 260; r += cell) {
          if (fieldAt(x + ca * r, y + sa * r) <= 0) return last;
          last = r;
        }
        return last;
      };
      const onScreen = (px, py, margin) => px > -margin && py > -margin && px < width + margin && py < height + margin;

      const rand = seeded(seed);
      // Angles from the toggle that point into the screen
      const angleIntoScreen = () => {
        for (let k = 0; k < 200; k++) {
          const a = rand() * Math.PI * 2;
          if (onScreen(x + Math.cos(a) * 420, y + Math.sin(a) * 420, 60)) return a;
        }
        return Math.PI * 0.75;
      };

      // Suit on. Tendrils are thick, knobbly ropes of two or three strands
      // twisted together. They snake ahead of the front to a spot on the page,
      // fork there into bulb-tipped prongs that grip it, pull taut, and drag the
      // goo over. Some throw thinner webs sideways that latch on too.
      // What hangs off a rope: glossy blobs where it bunches up, hair-thin wisps
      // that flick about, and fine webs strung along it
      const dressing = () => ({
        blobs: Array.from({ length: 1 + Math.floor(rand() * 2) }, () => ({ at: 0.15 + rand() * 0.65, size: 0.5 + rand() * 0.6 })),
        wisps: Array.from({ length: 3 + Math.floor(rand() * 3) }, () => ({
          at: 0.1 + rand() * 0.8,
          turn: (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.9),
          len: 18 + rand() * 40,
          curl: (rand() - 0.5) * 3,
          phase: rand() * 6.28,
        })),
        threads: Array.from({ length: 2 + Math.floor(rand() * 3) }, () => {
          const a = 0.05 + rand() * 0.6;
          return { a, b: Math.min(0.98, a + 0.15 + rand() * 0.3), sag: (rand() < 0.5 ? -1 : 1) * (0.2 + rand() * 0.3) };
        }),
      });

      // It goes for what's on the page: most tendrils reach for a heading, a
      // button, a card; the rest for open ground.
      const prey = thingsOnScreen(width, height, rand, Math.round(INK.tendrils * 0.65));
      const began = performance.now();
      const tendrils = Array.from({ length: INK.tendrils }, (_, n) => {
        const [ax, ay] = prey[n] ?? [rand() * width, rand() * height];
        const a = Math.atan2(ay - y, ax - x), r = Math.hypot(ax - x, ay - y);
        const prongs = 2 + Math.floor(rand() * 2);
        return {
          ax, ay, a, r,
          reach: 300 + rand() * 240,   // how far ahead of the front it stirs
          hunt: 110 + rand() * 150,    // ms it spends rearing up and casting about before it strikes
          shoot: 150 + rand() * 60,    // ms to reach its spot
          width: 10 + rand() * 9,
          bow: (rand() - 0.5) * 0.3,   // how much it hangs in a curve
          waves: 1 + rand() * 1.2,     // S-bends along its length
          sway: 0.05 + rand() * 0.06,  // their size, as a share of its length
          phase: rand() * 6.28,
          twang: rand() * 6.28,
          side: rand() < 0.5 ? -1 : 1,
          plies: 1 + Math.floor(rand() * 2), // thinner strands twisted round the main one
          prongs: Array.from({ length: prongs }, (_, k) => ({
            turn: (k / (prongs - 1) - 0.5) * 1.5 + (rand() - 0.5) * 0.3,
            len: 30 + rand() * 34,
            curl: (rand() - 0.5) * 2.4,
          })),
          webs: Array.from({ length: rand() < 0.5 ? 1 + Math.floor(rand() * 2) : 0 }, () => {
            const wa = a + (rand() < 0.5 ? -1 : 1) * (0.07 + rand() * 0.14), wr = r * (0.72 + rand() * 0.22);
            return { x: x + Math.cos(wa) * wr, y: y + Math.sin(wa) * wr, at: 0.3 + rand() * 0.4, wait: 30 + rand() * 90 };
          }),
          ...dressing(),
          fired: null, // ms when it shot out
          done: false, // swallowed by the goo
        };
      });

      // Free tentacles that ride the front, writhing in S-bends and curling at the tip
      const feelers = Array.from({ length: INK.feelers }, (_, k) => ({
        a: angleIntoScreen(),
        len: 150 + rand() * 170,
        width: 13 + rand() * 9,
        waves: 1 + rand() * 1.1,
        amp: 0.45 + rand() * 0.4,
        phase: rand() * 6.28,
        lash: 2.2 + rand() * 2.5,
        curl: (rand() < 0.5 ? -1 : 1) * (3 + rand() * 3),
        delay: (k / INK.feelers) * 0.35 + rand() * 0.06,
        ...dressing(),
      }));

      // Stripping off. As the goo is dragged back it clings on: ropes stay
      // clamped to things on the page and stretch back to it, thinning and
      // trembling as their prongs lose hold one by one. When the last one
      // slips the rope whips back, and some lunge for the page once more
      // before they're hauled away.
      const holds = thingsOnScreen(width, height, rand, Math.round(INK.strands * 0.65));
      const strands = Array.from({ length: INK.strands }, (_, n) => {
        const [ax, ay] = holds[n] ?? [rand() * width, rand() * height];
        const slips = [0.4 + rand() * 0.15, 0.62 + rand() * 0.15, 1];
        return {
          ax, ay,
          a: Math.atan2(ay - y, ax - x),
          r: Math.hypot(ax - x, ay - y),
          max: 130 + rand() * 190,     // how far it stretches before it's torn off
          width: 9 + rand() * 8,
          bow: (rand() - 0.5) * 0.35,
          waves: 1 + rand() * 1.2,
          sway: 0.05 + rand() * 0.06,
          phase: rand() * 6.28,
          side: rand() < 0.5 ? -1 : 1,
          plies: 1 + Math.floor(rand() * 2),
          curl: (rand() < 0.5 ? -1 : 1) * (2.5 + rand() * 3),
          regrab: rand() < 0.45,       // lunges back for the page after it's torn off
          prongs: slips.map((slipAt, k) => ({
            turn: (k - 1) * 0.85 + (rand() - 0.5) * 0.3,
            len: 26 + rand() * 30,
            curl: (rand() - 0.5) * 2,
            slipAt,       // share of the stretch at which this prong loses hold
            slipped: null, // ms when it did
          })),
          ...dressing(),
          snapped: null, // { ms, length } once it's torn off
        };
      });

      const drawField = (Rt, t) => {
        fgl.viewport(0, 0, nx, ny);
        fgl.useProgram(field);
        fgl.uniform2f(fu('uOrigin'), x, y);
        fgl.uniform1f(fu('uR'), Rt);
        fgl.uniform1f(fu('uDrift'), t);
        fgl.uniform1f(fu('uSeed'), seed);
        fgl.uniform2f(fu('uGrid'), nx, ny);
        fgl.uniform1f(fu('uCell'), cell);
        fgl.uniform1f(fu('uPad'), pad);
        fgl.uniform1f(fu('uTear'), mode === 'on' ? 1 : 0.3);
        drawQuad(fgl, fieldQuad, field);
        fgl.readPixels(0, 0, nx, ny, fgl.RGBA, fgl.UNSIGNED_BYTE, bytes);
        // ...and hand it to the goo's context
        gl.bindTexture(gl.TEXTURE_2D, fieldTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, nx, ny, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
      };

      // A heartbeat: everything it grows swells a little, twice in quick succession, then rests
      const pulse = (ms) => {
        const b = (ms % 620) / 620;
        return 1 + 0.1 * Math.exp(-(((b - 0.12) / 0.06) ** 2)) + 0.06 * Math.exp(-(((b - 0.34) / 0.07) ** 2));
      };

      // Lumps along a rope, a fixed distance apart whatever its length
      const knobs = (d, ph) => 1 + 0.2 * Math.sin(d / 8 + ph) + 0.1 * Math.sin(d / 3.7 + ph * 2);

      // Glossy blobs swelling a rope where it bunches up
      const bulge = (s, blobs) => blobs.reduce((sum, b) => sum + b.size * Math.exp(-(((s - b.at) / 0.045) ** 2)), 0);

      /**
       * Dress a rope drawn along `pts`: hair-thin wisps flicking off it and fine
       * webs strung between two points along it. `grown` (0..1) scales the wisps
       * while the rope is still growing; points before `from` are under the goo.
       */
      const dress = (out, pts, d, ms, grown = 1, from = 0) => {
        const N = pts.length - 1;
        for (const wisp of d.wisps) {
          const k = Math.round(wisp.at * N);
          if (k < Math.max(from, 1) || k >= N || wisp.len * grown < 5) continue;
          const dir = Math.atan2(pts[k + 1][1] - pts[k - 1][1], pts[k + 1][0] - pts[k - 1][0]);
          const flick = 0.4 * Math.sin(ms * 0.006 + wisp.phase);
          const hair = centreline(pts[k][0], pts[k][1], wisp.len * grown, (s) => dir + wisp.turn + flick * s + wisp.curl * s * s, 12);
          pushTube(out, hair, hair.map((_, j) => Math.max(0.5, 2.3 * (1 - j / 12))));
        }
        for (const th of d.threads) {
          const i = Math.round(th.a * N), j = Math.round(th.b * N);
          if (i < from || grown < 0.6) continue;
          const [x0, y0] = pts[i];
          const dx = pts[j][0] - x0, dy = pts[j][1] - y0;
          const web = [];
          for (let q = 0; q <= 10; q++) {
            const bow = Math.sin(Math.PI * q / 10) * th.sag;
            web.push([x0 + dx * q / 10 - dy * bow, y0 + dy * q / 10 + dx * bow]);
          }
          pushTube(out, web, web.map(() => 1.1));
        }
      };

      /**
       * A rope thrown from (px, py) to its spot (qx, qy), `tau` ms after it
       * fired: it whips out behind a heavy head, snaking in S-bends, then holds
       * on, twangs taut and fattens as the goo pours down it. `plies` thinner
       * strands twist round it.
       */
      const lash = (out, px, py, qx, qy, tau, td, w, plies) => {
        const p = clamp01(tau / td.shoot);
        const reached = 1 - (1 - p) ** 2.2;
        const L = Math.hypot(qx - px, qy - py) || 1;
        const ux = (qx - px) / L, uy = (qy - py) / L;
        const held = Math.max(0, tau - td.shoot);
        const taut = smoothstep(0, 320, held);
        const beat = pulse(tau + td.twang * 100);
        const N = 40, pts = [], ws = [], offs = [];
        for (let k = 0; k <= N; k++) {
          const s = k / N;
          const whip = (1 - p) * 16 * Math.sin(Math.PI * 3 * s - tau * 0.035 + td.twang);
          const twang = p < 1 ? 0 : 9 * Math.exp(-held / 110) * Math.cos(held * 0.05);
          // It hangs slack and snakes from side to side; taking hold pulls about half of that out
          const slack = td.bow * L * reached * (1 - 0.6 * taut);
          const snake = td.sway * L * reached * Math.sin(Math.PI * 2 * td.waves * s + td.phase + tau * 0.003) * (1 - 0.5 * taut);
          const off = Math.sin(Math.PI * s) * ((whip + twang) * td.side + slack) + Math.sin(Math.PI * s) ** 0.6 * snake;
          offs.push(off);
          pts.push([px + ux * L * reached * s - uy * off, py + uy * L * reached * s + ux * off]);
          const head = p < 1 ? 0.9 * Math.exp(-(((1 - s) / 0.09) ** 2)) : 0;
          // Once it has hold it feeds: gulps travel down it, one after another
          const gulp = p < 1 ? 0 : 0.4 * Math.exp(-(((s - ((held * 0.0021 + td.phase) % 1.25)) / 0.07) ** 2));
          const body = (p < 1 ? 0.7 : 0.8 + 0.4 * taut) * (1 - 0.45 * s); // tapers towards the far end
          const flare = 1 + 0.9 * (1 - smoothstep(0, 0.14, s));          // widens into the goo
          ws.push(Math.max(0.8, w * (body * knobs(s * L * reached, td.phase) + head + gulp + (plies ? bulge(s, td.blobs) : 0)) * flare * beat));
        }
        // Only the part ahead of the goo shows: anything it has already covered is inside it
        let from = 0;
        for (let k = N - 1; k > 0; k--) if (fieldAt(pts[k][0], pts[k][1]) > 0) { from = k; break; }
        pushTube(out, pts.slice(from), ws.slice(from));
        for (let ply = 0; ply < plies; ply++) {
          const ppts = [], pws = [];
          for (let k = Math.max(from, 2); k <= N - 3; k++) {
            const s = k / N;
            // Winds from one side of the rope to the other
            const wind = ws[k] * 0.62 * Math.sin(s * L * reached / 17 + td.phase * 3 + ply * Math.PI + tau * 0.002);
            ppts.push([pts[k][0] - uy * wind, pts[k][1] + ux * wind]);
            pws.push(Math.max(0.8, ws[k] * 0.5));
          }
          pushTube(out, ppts, pws);
        }
        if (plies) dress(out, pts, td, tau, reached, from);
        return { held, pts, ux, uy };
      };

      /** Where a rope has landed: it forks into prongs that creep out, bulb-tipped, and grip the page. */
      const grip = (out, qx, qy, ux, uy, held, prongs, w) => {
        const h = Math.atan2(uy, ux);
        const pad = w * 0.75 * smoothstep(0, 60, held) * (1 + 0.5 * Math.exp(-held / 90));
        if (pad > 1) {
          const pts = centreline(qx - ux * pad, qy - uy * pad, pad * 2, () => h, 12);
          pushTube(out, pts, pts.map((_, j) => Math.max(0.5, pad * 2 * Math.sin(Math.PI * j / 12))));
        }
        let lastMid = null;
        for (const f of prongs) {
          // It touches, flinches back as if testing the spot, then clamps down
          const feel = smoothstep(0, 120, held - 10) - 0.35 * Math.exp(-(((held - 200) / 50) ** 2));
          const len = f.len * feel * (w / 14);
          if (len < 3) continue;
          const pts = centreline(qx, qy, len, (s) => h + f.turn + f.curl * s * s + 0.3 * Math.sin(s * 7 + f.len), 16);
          pushTube(out, pts, pts.map((_, j) => {
            const s = j / 16;
            const bulb = 0.5 * Math.exp(-(((s - 0.84) / 0.11) ** 2)); // a knob near the tip
            return Math.max(0.6, w * ((0.5 - 0.3 * s) * knobs(s * len, f.len) + bulb) * (s > 0.94 ? 0.5 : 1));
          }));
          // A fine web strung between this prong and the last, sagging towards the pad
          const mid = pts[10];
          if (lastMid && w > 6) {
            const web = [];
            for (let q = 0; q <= 8; q++) {
              const u = q / 8, sag = Math.sin(Math.PI * u) * 0.3;
              web.push([lastMid[0] + (mid[0] - lastMid[0]) * u + (qx - (lastMid[0] + mid[0]) / 2) * sag, lastMid[1] + (mid[1] - lastMid[1]) * u + (qy - (lastMid[1] + mid[1]) / 2) * sag]);
            }
            pushTube(out, web, web.map(() => 1));
          }
          lastMid = mid;
        }
      };

      const tubesOn = (t, Rt, out, ms) => {
        for (const td of tendrils) {
          if (td.done) continue;
          const root = Math.max(0, frontAlong(td.a, Math.max(0, Rt - 260)) - 8);
          if (td.fired === null) {
            if (root < td.r - td.reach || Rt < R0 + 30) continue;
            td.fired = ms;
          }
          // The goo has reached its spot: the tendril is swallowed
          if (fieldAt(td.ax, td.ay) > 0 || root >= td.r - 4) { td.done = true; continue; }
          const rx = x + Math.cos(td.a) * root, ry = y + Math.sin(td.a) * root;
          const tau = ms - td.fired - td.hunt;
          if (tau < 0) {
            // Rearing up out of the goo: a blunt head casts from side to side,
            // slower and slower, as it settles on its target
            const k = 1 + tau / td.hunt; // 0..1
            const aim = Math.atan2(td.ay - ry, td.ax - rx);
            const cast = (1 - k) ** 0.7 * 1.1 * Math.sin(tau * 0.028 + td.twang) * td.side;
            const stub = centreline(rx, ry, 26 + 46 * smoothstep(0, 0.6, k) - 14 * smoothstep(0.75, 1, k), (s) => aim + cast * s, 14);
            pushTube(out, stub, stub.map((_, j) => {
              const s = j / 14;
              return td.width * ((1.5 - 0.7 * s) + 0.75 * Math.exp(-(((s - 0.8) / 0.16) ** 2))) * (s > 0.95 ? 0.6 : 1) * pulse(ms);
            }));
            continue;
          }
          const { held, pts, ux, uy } = lash(out, rx, ry, td.ax, td.ay, tau, td, td.width, td.plies);
          if (tau < td.shoot) continue;
          grip(out, td.ax, td.ay, ux, uy, held, td.prongs, td.width);
          for (const wb of td.webs) {
            const wtau = held - wb.wait;
            const [sx, sy] = pts[Math.round(wb.at * 40)];
            if (wtau <= 0 || fieldAt(wb.x, wb.y) > 0 || fieldAt(sx, sy) > 0) continue;
            const web = lash(out, sx, sy, wb.x, wb.y, wtau, td, td.width * 0.4, 0);
            if (wtau >= td.shoot) grip(out, wb.x, wb.y, web.ux, web.uy, web.held, td.prongs.slice(0, 2), td.width * 0.45);
          }
        }

        const fade = 1 - smoothstep(0.8, 0.98, t); // the free ones draw back in as the goo finishes
        for (const fl of feelers) {
          const grow = smoothstep(fl.delay, fl.delay + 0.2, t) * fade * smoothstep(R0, R0 + 60, Rt);
          // While it holds still they stretch out further, feeling around
          const len = fl.len * grow * (0.88 + 0.12 * Math.sin(ms * 0.004 + fl.phase)) * (1 + 0.4 * held);
          if (len < 8) continue;
          const root = Math.max(0, frontAlong(fl.a, Math.max(0, Rt - 260)) - 8);
          // It moves in fits and starts, not like a pendulum: a pause, then a dart
          const lashing = (ms + 260 * Math.sin(ms * 0.0055 + fl.phase * 2)) * 0.001 * fl.lash + fl.phase;
          const fx = x + Math.cos(fl.a) * root, fy = y + Math.sin(fl.a) * root;
          // If the pointer has moved since the click and is out in the open, the
          // tentacle uncurls and leans its tip towards it, watching
          let watch = 0, lean = 0;
          if (pointer && pointer.at > began + 120 && fieldAt(pointer.x, pointer.y) <= 0) {
            const d = Math.hypot(pointer.x - fx, pointer.y - fy);
            const turn = Math.atan2(Math.sin(Math.atan2(pointer.y - fy, pointer.x - fx) - fl.a), Math.cos(Math.atan2(pointer.y - fy, pointer.x - fx) - fl.a));
            watch = (1 - smoothstep(250, 700, d)) * smoothstep(120, 500, performance.now() - pointer.at + 380);
            lean = Math.max(-1.4, Math.min(1.4, turn));
          }
          // Writhes along a travelling wave, then winds into a curl at the tip
          const heading = (s) => fl.a + fl.amp * (1 - 0.5 * watch) * Math.sin(Math.PI * 2 * fl.waves * s - lashing) * s ** 0.6
            + fl.curl * (1 - 0.85 * watch) * smoothstep(0.6, 1, s) ** 2 + lean * watch * s ** 0.7;
          const pts = centreline(fx, fy, len, heading, 48);
          pushTube(out, pts, pts.map((_, k) => {
            const s = k / 48;
            return Math.max(0.8, fl.width * (1 + 0.9 * (1 - smoothstep(0, 0.12, s))) * (knobs(s * len, fl.phase) + bulge(s, fl.blobs)) * Math.max(0.07, 1 - s ** 1.4) * pulse(ms + fl.phase * 100));
          }));
          dress(out, pts, fl, ms, grow);
        }
      };

      const tubesOff = (t, out, ms) => {
        for (const st of strands) {
          if (fieldAt(st.ax, st.ay) <= 0) continue; // the goo hasn't been dragged off this spot yet
          const cos = Math.cos(st.a), sin = Math.sin(st.a);
          const edge = frontAlong(st.a, st.r) + 6; // into the goo, beyond the front
          const stretch = edge - st.r;
          const gx = x + cos * edge, gy = y + sin * edge;
          // Once the goo has left the screen along this line, the rope is torn off
          const gone = !onScreen(gx, gy, -4);
          if (!st.snapped && (stretch > st.max || gone)) st.snapped = { ms, length: Math.min(stretch, st.max) };
          const w = st.width;
          const inward = st.a + Math.PI; // back towards the page, away from the goo

          if (!st.snapped) {
            const q = clamp01(stretch / st.max); // how close it is to being torn off
            const strain = smoothstep(0.65, 1, q);
            const beat = pulse(ms * (1 + 0.8 * strain) + st.phase * 100); // its heart races as it loses hold
            const N = 40, pts = [], ws = [];
            for (let k = 0; k <= N; k++) {
              const s = k / N; // 0 where it grips the page, 1 at the goo
              const slack = st.bow * stretch * (1 - q);
              const snake = st.sway * stretch * Math.sin(Math.PI * 2 * st.waves * s + st.phase + ms * 0.003) * (1 - 0.8 * q);
              const tremble = 1.8 * strain * Math.sin(ms * 0.085 + st.phase + s * 9);
              const off = Math.sin(Math.PI * s) * (slack + tremble) + Math.sin(Math.PI * s) ** 0.6 * snake;
              pts.push([st.ax + cos * stretch * s - sin * off, st.ay + sin * stretch * s + cos * off]);
              const thin = 1 - 0.72 * q ** 0.8 * Math.sin(Math.PI * s) ** 0.7; // pulled thin in the middle
              const flare = 1 + 0.9 * smoothstep(0.86, 1, s);                  // widens into the goo
              ws.push(Math.max(0.9, w * (0.7 + 0.3 * s) * (knobs(s * stretch, st.phase) + bulge(s, st.blobs)) * thin * flare * beat));
            }
            pushTube(out, pts, ws);
            for (let ply = 0; ply < st.plies; ply++) {
              const ppts = [], pws = [];
              for (let k = 2; k <= N - 3; k++) {
                const wind = ws[k] * 0.62 * Math.sin((k / N) * stretch / 17 + st.phase * 3 + ply * Math.PI + ms * 0.002);
                ppts.push([pts[k][0] - sin * wind, pts[k][1] + cos * wind]);
                pws.push(Math.max(0.8, ws[k] * 0.5));
              }
              pushTube(out, ppts, pws);
            }
            dress(out, pts, st, ms, smoothstep(0, 60, stretch));
            // The grip: a pad, and prongs dug into the page that lose hold one at a time
            const pad = w * 0.8 * beat;
            const padPts = centreline(st.ax - cos * pad, st.ay - sin * pad, pad * 2, () => st.a, 12);
            pushTube(out, padPts, padPts.map((_, j) => Math.max(0.5, pad * 2 * Math.sin(Math.PI * j / 12))));
            for (const f of st.prongs) {
              if (f.slipped === null && q >= f.slipAt) f.slipped = ms;
              const lost = f.slipped === null ? 0 : clamp01((ms - f.slipped) / 170);
              const len = f.len * (w / 14) * (1 - lost) ** 1.4;
              if (len < 3) continue;
              // Holding: it digs in harder as the strain grows. Slipped: it flicks up and back.
              const dig = f.curl * (1 + 0.8 * strain);
              const prong = centreline(st.ax, st.ay, len, (s) => inward + f.turn * (1 - lost) + (dig + lost * 5 * Math.sign(f.turn || 1)) * s * s, 16);
              pushTube(out, prong, prong.map((_, j) => {
                const s = j / 16;
                const bulb = 0.5 * Math.exp(-(((s - 0.84) / 0.11) ** 2));
                return Math.max(0.6, w * ((0.5 - 0.3 * s) * knobs(s * len, f.len) + bulb) * (s > 0.94 ? 0.5 : 1));
              }));
            }
            continue;
          }

          // Torn off. What's left on the page shrivels to a bead and is gone
          const since = ms - st.snapped.ms;
          const bead = w * 0.8 * (1 - clamp01(since / 240));
          if (bead > 1) {
            const pts = centreline(st.ax - cos * bead, st.ay - sin * bead, bead * 2, () => st.a, 12);
            pushTube(out, pts, pts.map((_, j) => Math.max(0.5, bead * 2 * Math.sin(Math.PI * j / 12))));
          }
          if (gone) continue;
          // The rope itself whips back towards the goo...
          const full = st.snapped.length;
          const reachable = Math.max(0, stretch - 10); // how far it is to the spot it held
          let len, aim = 0, hand = 0;
          if (st.regrab) {
            // ...then lunges for the spot it lost, falls short, and is hauled in
            const recoil = smoothstep(0, 170, since);
            const lunge = Math.sin(Math.PI * clamp01((since - 170) / 260));
            const hauled = smoothstep(430, 700, since);
            len = (full * (1 - 0.55 * recoil) + (Math.min(reachable, full * 1.15) - full * 0.45) * lunge * 0.9) * (1 - hauled);
            aim = lunge;
            hand = lunge * (1 - hauled);
          } else {
            len = full * (1 - smoothstep(0, 340, since)) ** 1.2;
          }
          if (len < 4) continue;
          const whip = smoothstep(0, 200, since) * (1 - aim);
          const heading = (s) => inward + st.curl * whip * s * s + 0.45 * (1 - aim) * Math.sin(s * 7 - ms * 0.012 + st.phase) * s;
          const pts = centreline(gx, gy, len, heading, 34);
          pushTube(out, pts, pts.map((_, j) => {
            const s = j / 34;
            const head = 0.7 * hand * Math.exp(-(((1 - s) / 0.1) ** 2));
            return Math.max(0.8, w * ((1.1 - 0.75 * s) * knobs(s * len, st.phase) + head) * (1 + 0.9 * (1 - smoothstep(0, 0.14, s))) * pulse(ms * 1.6 + st.phase * 100));
          }));
          if (hand > 0.15) {
            // Its prongs spread wide, grasping at the page
            const [tx, ty] = pts[34];
            const [px, py] = pts[31];
            const d = Math.hypot(tx - px, ty - py) || 1;
            grip(out, tx, ty, (tx - px) / d, (ty - py) / d, 30 + hand * 150, st.prongs, w * 0.9);
          }
        }

        // Tentacles on the retreating front claw back at the page it's being pulled off
        const fade = smoothstep(0.02, 0.16, t) * (1 - smoothstep(0.72, 0.94, t));
        for (const fl of feelers) {
          const edge = frontAlong(fl.a, 0) + 8;
          const fx = x + Math.cos(fl.a) * edge, fy = y + Math.sin(fl.a) * edge;
          if (!onScreen(fx, fy, -10)) continue; // the goo has been dragged off the screen here
          // Reach, drag back, reach again
          const clawing = 0.7 + 0.3 * Math.sin(ms * 0.0075 + fl.phase);
          const len = Math.min(fl.len * 0.85, edge * 0.7) * fade * clawing * (1 + 0.4 * held);
          if (len < 8) continue;
          const lashing = (ms + 260 * Math.sin(ms * 0.0055 + fl.phase * 2)) * 0.001 * fl.lash + fl.phase;
          // If the pointer is out on the freed page nearby, they strain towards it
          let watch = 0, lean = 0;
          if (pointer && pointer.at > began + 120 && fieldAt(pointer.x, pointer.y) > 0) {
            const to = Math.atan2(pointer.y - fy, pointer.x - fx) - (fl.a + Math.PI);
            watch = 1 - smoothstep(250, 700, Math.hypot(pointer.x - fx, pointer.y - fy));
            lean = Math.max(-1.4, Math.min(1.4, Math.atan2(Math.sin(to), Math.cos(to))));
          }
          const heading = (s) => fl.a + Math.PI + fl.amp * 0.8 * (1 - 0.5 * watch) * Math.sin(Math.PI * 2 * fl.waves * s - lashing) * s ** 0.6
            + fl.curl * 0.6 * (1 - 0.85 * watch) * smoothstep(0.6, 1, s) ** 2 + lean * watch * s ** 0.7;
          const pts = centreline(fx, fy, len, heading, 44);
          pushTube(out, pts, pts.map((_, k) => {
            const s = k / 44;
            return Math.max(0.8, fl.width * 0.85 * (1 + 0.9 * (1 - smoothstep(0, 0.12, s))) * (knobs(s * len, fl.phase) + bulge(s, fl.blobs)) * Math.max(0.07, 1 - s ** 1.4) * pulse(ms + fl.phase * 100));
          }));
          dress(out, pts, fl, ms, fade);
        }
      };

      const frame = (at) => {
        const ms = at * duration;
        const t = progress(ms);
        held = holding(ms);
        // While it holds, the front shifts about uneasily instead of standing dead still
        const Rt = radius(t) + held * (16 * Math.sin(ms * 0.0105) + 7 * Math.sin(ms * 0.023 + 1));
        drawField(Rt, ms / INK.duration); // its edge keeps churning through the hold
        const clip = traceField(bytes, nx, ny, cell, pad);

        // The goo, on the canvas above everything
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(band);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, fieldTex);
        gl.uniform1i(u(band, 'uField'), 0);
        gl.uniform2f(u(band, 'uGrid'), nx, ny);
        gl.uniform1f(u(band, 'uCell'), cell);
        gl.uniform1f(u(band, 'uPad'), pad);
        gl.uniform1f(u(band, 'uDpr'), dpr);
        gl.uniform1f(u(band, 'uHeight'), canvas.height);
        gl.uniform1f(u(band, 'uMode'), mode === 'on' ? 1 : -1);
        gl.uniform1f(u(band, 'uSeed'), seed);
        gl.uniform1f(u(band, 'uStart'), smoothstep(0, 0.05, t) * 0.7 + 0.3);
        drawQuad(gl, quad, band);

        const verts = [];
        if (mode === 'on') tubesOn(t, Rt, verts, ms); else tubesOff(t, verts, ms);
        if (verts.length) {
          gl.useProgram(tube);
          gl.uniform2f(u(tube, 'uView'), width, height);
          gl.bindBuffer(gl.ARRAY_BUFFER, tubeBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
          const stride = 5 * 4;
          const attrs = [['aPos', 2, 0], ['aV', 1, 8], ['aSide', 2, 12]].map(([name, size, offset]) => {
            const loc = gl.getAttribLocation(tube, name);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
            return loc;
          });
          gl.drawArrays(gl.TRIANGLES, 0, verts.length / 5);
          attrs.forEach((loc) => gl.disableVertexAttribArray(loc));
        }
        return clip;
      };
      frame.duration = duration;
      return frame;
    },
  };
  return maker;
}
