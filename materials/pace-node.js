// Runs the browser engine (assets/pace-live.js) under node on the shipped sample and presets and
// prints canon JSON in the same shape as pace-reference.py. Usage: node materials/pace-node.js
const fs = require("fs"), path = require("path");
const A = p => fs.readFileSync(path.join(__dirname, "..", "assets", p), "utf8");
const S = JSON.parse(A("pace-sample.js").match(/window\.PACE_SAMPLE = (.*);\s*$/s)[1]);
const P = JSON.parse(A("pace-presets.js").match(/window\.PACE_PRESETS = (.*);\s*$/s)[1]);
const E = require(path.join(__dirname, "..", "assets", "pace-live.js"));
const out = {};
for (const sd of [0, 1, 4, 7]) {
  const R = E.computeAll(S, sd);
  out["seed" + sd] = R;
  const ps = {};
  for (const p of P) { const o = E.scoreText(p.text, p.seconds, R); delete o.hits; ps[p.id] = o; }
  out["presets_seed" + sd] = ps;
}
function r6(v, k) {
  if (typeof v === "number") return Number.isInteger(v) ? v : Math.floor(v * 1e6 + 0.5) / 1e6;
  if (Array.isArray(v)) return v.map(x => r6(x));
  if (v && typeof v === "object") { const o = {}; Object.keys(v).sort().forEach(k => { if (!/Sorted$/.test(k)) o[k] = r6(v[k]); }); return o; }
  return v;
}
console.log(JSON.stringify(r6(out), null, 1));
