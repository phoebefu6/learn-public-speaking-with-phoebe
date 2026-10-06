/* pace-live.js - the pace bench for learn-public-speaking-with-phoebe
 *
 * Data: derived per-talk numbers for 2,299 one-speaker TED talks (Kaggle rounakbanik/ted-talks,
 * filmed 1984-2017), see pace-sample.js. No transcript text is shipped (TED content is
 * CC BY-NC-ND): only word, sentence, pause-mark, filler and cue counts, plus duration in seconds.
 * Everything below is COUNTED in the browser. Nothing is modelled, and comprehension is NOT
 * measured anywhere: the bench measures pace, sentence length, pause marks and filler words.
 *
 * textMetrics() is mirrored rule for rule by materials/pace_metrics.py.
 * computeAll() is mirrored by materials/pace-reference.py; materials/pace-node.js prints canon.
 * Break button: shuffle durations across talks (seeded). Each talk's words are paired with
 * another talk's minutes, so "pace" stops describing any speaker.
 */
(function (root) {
  "use strict";

  var HESITATION = ["um", "uh", "er", "erm", "ah", "hmm", "mm"];
  var PHRASES = ["you know", "i mean", "sort of", "kind of", "basically", "literally"];
  var B = "[^A-Za-z0-9']";

  /* ---------- text metrics (mirrors pace_metrics.py) ---------- */
  function textMetrics(text) {
    var t = String(text).replace(/[‘’]/g, "'");
    var cueRe = /\(([^)]*)\)/g, m, laughter = 0, applause = 0, music = 0;
    while ((m = cueRe.exec(t)) !== null) {
      var c = m[1].trim().toLowerCase();
      if (c.indexOf("laugh") === 0) laughter++;
      if (c.indexOf("applause") === 0 || c.indexOf("cheer") === 0) applause++;
      if (c.indexOf("music") >= 0 || c.indexOf("sing") >= 0) music++;
    }
    var body = t.replace(/\(([^)]*)\)/g, " ");
    var words = (body.match(/[A-Za-z0-9']+/g) || []).length;
    var sentences = (body.match(/[.!?]+/g) || []).length;
    var parts = body.split(/[.!?]+/);
    if (/[A-Za-z0-9']/.test(parts[parts.length - 1])) sentences++;
    var pauses = (body.match(/[.,;:!?]/g) || []).length;
    var low = body.toLowerCase();
    var hits = [];
    function scan(list, kind) {
      var re = new RegExp("(^|" + B + ")(" + list.map(function (p) { return p.replace(/ /g, "\\s+"); }).join("|") + ")(?=" + B + "|$)", "g");
      var x, n = 0;
      while ((x = re.exec(low)) !== null) {
        n++;
        hits.push({ kind: kind, word: x[2].replace(/\s+/g, " "), at: x.index + x[1].length });
        re.lastIndex = x.index + x[1].length + x[2].length;
      }
      return n;
    }
    var hes = scan(HESITATION, "hesitation");
    var phr = scan(PHRASES, "phrase");
    hits.sort(function (a, b) { return a.at - b.at; });
    return { words: words, sentences: sentences, pauses: pauses, hes: hes, phr: phr,
      laughter: laughter, applause: applause, music: music, hits: hits, body: body };
  }

  /* ---------- numeric helpers (mirrored exactly in the Python reference) ---------- */
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function pearson(x, y) {
    var n = x.length, mx = mean(x), my = mean(y), sxy = 0, sxx = 0, syy = 0;
    for (var i = 0; i < n; i++) { var dx = x[i] - mx, dy = y[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
    return (sxx > 0 && syy > 0) ? sxy / Math.sqrt(sxx * syy) : 0;
  }
  /* numpy's default "linear" percentile */
  function pct(sorted, q) {
    var h = (sorted.length - 1) * q / 100, lo = Math.floor(h), hi = Math.min(lo + 1, sorted.length - 1);
    return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
  }
  /* share of talks strictly below v, in percent */
  function below(sorted, v) {
    var lo = 0, hi = sorted.length;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (sorted[mid] < v) lo = mid + 1; else hi = mid; }
    return 100 * lo / sorted.length;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffled(arr, seed) {
    var a = arr.slice(), rnd = mulberry32(seed);
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function asc(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function summary(sorted) {
    return { p1: pct(sorted, 1), p5: pct(sorted, 5), p25: pct(sorted, 25), p50: pct(sorted, 50), p75: pct(sorted, 75),
      p95: pct(sorted, 95), p99: pct(sorted, 99), min: sorted[0], max: sorted[sorted.length - 1], mean: mean(sorted) };
  }
  var BIN = 10, NBINS = 30;  /* 0-300 wpm in 10 wpm bins; anything at 300 or above lands in the last bin */
  function hist(values) {
    var h = []; for (var i = 0; i < NBINS; i++) h.push(0);
    values.forEach(function (v) { h[Math.min(NBINS - 1, Math.floor(v / BIN))]++; });
    return h;
  }

  function computeAll(S, seed) {
    var d = seed ? shuffled(S.d, seed) : S.d;
    var wpm = [], sl = [], pm = [], fr = [];
    for (var i = 0; i < S.n; i++) {
      wpm.push(S.w[i] / (d[i] / 60));
      sl.push(S.w[i] / S.s[i]);
      pm.push(100 * S.p[i] / S.w[i]);
      fr.push(100 * S.f[i] / S.w[i]);
    }
    var ws = asc(wpm), real = seed ? asc(S.w.map(function (w, i) { return w / (S.d[i] / 60); })) : ws;
    var lo = pct(real, 1), hi = pct(real, 99), outside = 0;
    ws.forEach(function (v) { if (v < lo || v > hi) outside++; });
    var hes = 0, hesTalks = 0, laughTalks = 0, apTalks = 0, words = 0;
    for (var k = 0; k < S.n; k++) {
      hes += S.h[k]; if (S.h[k] > 0) hesTalks++; words += S.w[k];
      if (S.la[k] > 0) laughTalks++; if (S.ap[k] > 0) apTalks++;
    }
    return {
      seed: seed || 0, n: S.n,
      wpm: summary(ws), wpmSorted: ws, hist: hist(wpm),
      wordsMinutesR: pearson(S.w, d.map(function (x) { return x / 60; })),
      outsideRealRange: 100 * outside / S.n,
      sentence: summary(asc(sl)), sentenceSorted: asc(sl),
      pauses: summary(asc(pm)), pausesSorted: asc(pm),
      phraseFillers: summary(asc(fr)), phraseSorted: asc(fr),
      hesitationTotal: hes, hesitationTalks: hesTalks, wordsTotal: words,
      hesitationPer10k: 10000 * hes / words,
      laughShare: 100 * laughTalks / S.n, applauseShare: 100 * apTalks / S.n,
      laughMedian: pct(asc(S.la), 50), applauseMedian: pct(asc(S.ap), 50)
    };
  }

  function scoreText(text, seconds, R) {
    var m = textMetrics(text);
    var out = { words: m.words, sentences: m.sentences, pauses: m.pauses, hes: m.hes, phr: m.phr,
      laughter: m.laughter, applause: m.applause, hits: m.hits, seconds: seconds };
    if (!m.words || !(seconds > 0)) return out;
    out.wpm = m.words / (seconds / 60);
    out.wpmBelow = below(R.wpmSorted, out.wpm);
    out.sentenceLen = m.words / Math.max(1, m.sentences);
    out.sentenceBelow = below(R.sentenceSorted, out.sentenceLen);
    out.pausesPer100 = 100 * m.pauses / m.words;
    out.pausesBelow = below(R.pausesSorted, out.pausesPer100);
    out.phrPer100 = 100 * m.phr / m.words;
    out.phrBelow = below(R.phraseSorted, out.phrPer100);
    out.hesPer100 = 100 * m.hes / m.words;
    return out;
  }

  /* ---------- UI ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function f1(x) { return x.toFixed(1); }
  function metric(label, value, unit, kind) {
    return '<div class="mb-metric"><span class="mb-mlabel">' + esc(label) + '</span><span class="mb-mvalue">' + esc(value) +
      '</span><span class="mb-munit">' + esc(unit) + '</span><span class="mb-mkind is-' + kind + '">' + kind + "</span></div>";
  }
  function parseSeconds(s) {
    s = String(s).trim();
    var mm = s.match(/^(\d+):(\d{1,2})$/);
    if (mm) return parseInt(mm[1], 10) * 60 + parseInt(mm[2], 10);
    var v = parseFloat(s);
    return isFinite(v) ? v : NaN;
  }

  var rootEl, sample, presets, results, seed = 0, current, readout, chart, ta, secs, breakBtn, againBtn, hitsEl, presetBox;

  function drawHist(R, mark) {
    var W = 880, H = 250, x0 = 56, x1 = 846, y0 = 30, y1 = 190;
    var max = 0; R.hist.forEach(function (c) { max = Math.max(max, c); });
    var bw = (x1 - x0) / NBINS, s = '<svg class="pb-hist" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Histogram of words per minute across ' +
      R.n + ' TED talks' + (seed ? ", durations shuffled" : "") + '">';
    s += '<line x1="' + x0 + '" y1="' + y1 + '" x2="' + x1 + '" y2="' + y1 + '" class="pb-axis"/>';
    R.hist.forEach(function (c, i) {
      var h = max ? (y1 - y0) * c / max : 0;
      if (h > 0) s += '<rect x="' + (x0 + i * bw + 1).toFixed(1) + '" y="' + (y1 - h).toFixed(1) + '" width="' + (bw - 2).toFixed(1) + '" height="' + h.toFixed(1) + '" class="pb-bar"/>';
    });
    for (var t = 0; t <= 300; t += 50) {
      var x = x0 + (t / BIN) * bw;
      s += '<line x1="' + x.toFixed(1) + '" y1="' + y1 + '" x2="' + x.toFixed(1) + '" y2="' + (y1 + 5) + '" class="pb-axis"/>';
      s += '<text x="' + x.toFixed(1) + '" y="' + (y1 + 20) + '" text-anchor="middle" class="pb-tick">' + (t === 300 ? "300+" : t) + "</text>";
    }
    s += '<text x="' + ((x0 + x1) / 2) + '" y="' + (y1 + 42) + '" text-anchor="middle" class="pb-cap">words per minute over the whole talk, 10 wpm bins</text>';
    var mid = x0 + R.wpm.p25 / BIN * bw, mid2 = x0 + R.wpm.p75 / BIN * bw;
    s += '<line x1="' + mid.toFixed(1) + '" y1="' + (y0 - 8) + '" x2="' + mid2.toFixed(1) + '" y2="' + (y0 - 8) + '" class="pb-iqr"/>';
    s += '<text x="' + (mid2 + 8).toFixed(1) + '" y="' + (y0 - 4) + '" class="pb-iqrl">middle half of talks: ' + Math.round(R.wpm.p25) + " to " + Math.round(R.wpm.p75) + "</text>";
    if (mark && mark.wpm) {
      var mx = x0 + Math.min(mark.wpm, 299.9) / BIN * bw;
      s += '<line x1="' + mx.toFixed(1) + '" y1="' + (y0 + 4) + '" x2="' + mx.toFixed(1) + '" y2="' + y1 + '" class="pb-you"/>';
      var right = mx > 660;
      s += '<text x="' + (right ? mx - 8 : mx + 8).toFixed(1) + '" y="' + (y0 + 22) + '" text-anchor="' + (right ? "end" : "start") + '" class="pb-youl">' +
        esc(mark.label) + ": " + f1(mark.wpm) + " wpm</text>";
    }
    return s + "</svg>";
  }

  function verdict(r) {
    if (!r.wpm) return ["ok", "Paste a transcript and give its duration to place it."];
    var R = results, w = r.wpm;
    if (seed) return ["ok", "Shuffle is ON: every talk's words are now divided by some other talk's minutes. The middle half spans " +
      Math.round(R.wpm.p25) + " to " + Math.round(R.wpm.p75) + " wpm and " + f1(R.outsideRealRange) + "% of talks sit outside the real 1st to 99th percentile. Pace only means something when words and minutes belong to the same speaker."];
    if (w > R.wpm.p99) return ["bad", f1(w) + " wpm is faster than " + f1(r.wpmBelow) + "% of the talks, above the real 99th percentile (" + f1(R.wpm.p99) + "). The words got in; whether the room kept up is not something a word count can measure."];
    if (w < R.wpm.p1) return ["ok", f1(w) + " wpm is slower than 99% of the talks. Check the duration includes only the speech you pasted."];
    if (w >= R.wpm.p25 && w <= R.wpm.p75) return ["good", f1(w) + " wpm sits in the middle half of real talks (" + Math.round(R.wpm.p25) + " to " + Math.round(R.wpm.p75) + "). Pace is not your problem; look at sentences and fillers."];
    return ["ok", f1(w) + " wpm is faster than " + f1(r.wpmBelow) + "% of the talks: outside the middle half, inside the real range."];
  }

  function renderHits(r, text) {
    if (!r.hits || !r.hits.length) { hitsEl.innerHTML = '<p class="pb-none">No listed filler found.</p>'; return; }
    var counts = {};
    r.hits.forEach(function (h) { counts[h.word] = (counts[h.word] || 0) + 1; });
    hitsEl.innerHTML = '<p class="pb-hitcap">Every match, so you can judge it (a word list cannot tell "you know where it is" from "you know, it is"):</p><div class="pb-hitlist">' +
      Object.keys(counts).sort().map(function (k) {
        var kind = HESITATION.indexOf(k) >= 0 ? "is-hes" : "is-phr";
        return '<span class="pb-hit ' + kind + '">' + esc(k) + " x" + counts[k] + "</span>";
      }).join("") + "</div>";
  }

  function render() {
    var text, sec, label;
    if (current === "own") { text = ta.value; sec = parseSeconds(secs.value); label = "Yours"; }
    else { var p = presets.filter(function (x) { return x.id === current; })[0]; text = p.text; sec = p.seconds; label = "This text"; }
    var r = scoreText(text, sec, results), g = verdict(r), R = results;
    var h = '<div class="mb-verdict is-' + g[0] + '">' + esc(g[1]) + ' <span class="mb-mkind is-measured">measured</span></div><div class="mb-metrics">';
    if (r.wpm) {
      h += metric("Pace", f1(r.wpm), "wpm: " + r.words + " words in " + f1(r.seconds) + " s; faster than " + f1(r.wpmBelow) + "% of talks", "measured");
      h += metric("Sentence length", f1(r.sentenceLen), "words per sentence; TED median " + f1(R.sentence.p50) + ", longer than " + f1(r.sentenceBelow) + "% of talks", "measured");
      h += metric("Pause marks", f1(r.pausesPer100), "per 100 words (. , ; : ! ?); TED median " + f1(R.pauses.p50) + ", more than " + f1(r.pausesBelow) + "% of talks", "measured");
      h += metric("Phrase fillers", r.phr + "", f1(r.phrPer100) + " per 100 words; TED median " + R.phraseFillers.p50.toFixed(2) + ", 95th percentile " + R.phraseFillers.p95.toFixed(2), "measured");
      h += metric("Hesitations", r.hes + "", f1(r.hesPer100) + " per 100 words; TED transcripts are tidied, " + R.hesitationTotal + " in " + R.wordsTotal.toLocaleString("en-US") + " words", "measured");
      h += metric("Comprehension", "not measured", "no count of words can tell you whether the room understood", "not-measured");
    } else {
      h += metric("Words", r.words + "", "need a duration in seconds or m:ss to compute pace", "measured");
    }
    readout.innerHTML = h + "</div>";
    chart.innerHTML = drawHist(R, r.wpm ? { wpm: r.wpm, label: label } : null);
    renderHits(r, text);
    breakBtn.classList.toggle("is-on", !!seed);
    breakBtn.textContent = seed ? "Shuffle is ON: durations permuted across talks" : "Break it: shuffle durations across talks";
    againBtn.hidden = !seed;
  }

  function setView(id) {
    current = id;
    Array.prototype.forEach.call(presetBox.querySelectorAll(".mb-preset"), function (l) {
      var on = l.getAttribute("data-id") === id; l.classList.toggle("is-on", on); l.querySelector("input").checked = on;
    });
    if (id !== "own") {
      var p = presets.filter(function (x) { return x.id === id; })[0];
      ta.value = p.text; secs.value = String(p.seconds);
    }
    render();
  }
  function setSeed(s) { seed = s; results = computeAll(sample, seed); render(); }

  function buildUI() {
    presetBox = document.createElement("div"); presetBox.className = "mb-presets";
    presets.concat([{ id: "own", label: "Your own transcript", note: "Paste what you actually said (a phone transcript is fine) and how long it took." }]).forEach(function (p) {
      var lab = document.createElement("label");
      lab.className = "mb-preset" + (p.anti ? " is-anti" : ""); lab.setAttribute("data-id", p.id);
      lab.innerHTML = '<input type="radio" name="pace-v" value="' + p.id + '"><span class="mb-pname">' + esc(p.label) +
        (p.anti ? ' <em class="mb-anti">the anti-lever</em>' : "") + '</span><span class="mb-pnote">' + esc(p.note) +
        (p.seconds ? " Constructed." : "") + "</span>";
      lab.querySelector("input").addEventListener("change", function () { setView(p.id); });
      presetBox.appendChild(lab);
    });
    var edit = document.createElement("div"); edit.className = "mb-edit pb-edit";
    edit.innerHTML = '<label class="pb-lab" for="pb-text">Transcript</label><textarea id="pb-text" rows="7" spellcheck="false"></textarea>' +
      '<label class="pb-lab" for="pb-secs">Duration (seconds, or m:ss)</label><input id="pb-secs" class="pb-secs" type="text" inputmode="numeric">';
    ta = edit.querySelector("textarea"); secs = edit.querySelector("input");
    function toOwn() { if (current !== "own") { current = "own"; Array.prototype.forEach.call(presetBox.querySelectorAll(".mb-preset"), function (l) { var on = l.getAttribute("data-id") === "own"; l.classList.toggle("is-on", on); l.querySelector("input").checked = on; }); } render(); }
    ta.addEventListener("input", toOwn); secs.addEventListener("input", toOwn);
    var bar = document.createElement("div"); bar.className = "pb-actions";
    breakBtn = document.createElement("button"); breakBtn.type = "button"; breakBtn.className = "btn pb-break";
    breakBtn.addEventListener("click", function () { setSeed(seed ? 0 : 1); });
    againBtn = document.createElement("button"); againBtn.type = "button"; againBtn.className = "btn"; againBtn.textContent = "Draw another shuffle";
    againBtn.addEventListener("click", function () { setSeed(seed + 3); });
    bar.appendChild(breakBtn); bar.appendChild(againBtn);
    var hint = document.createElement("p"); hint.className = "mb-hint";
    hint.textContent = sample.n.toLocaleString("en-US") + " one-speaker TED talks filmed " + sample.years[0] + " to " + sample.years[1] +
      " (Kaggle dataset rounakbanik/ted-talks), kept if the transcript has 300+ words and fewer than three music cues. Duration is the whole video, applause included. " +
      "Only derived counts are shipped, no transcript text or titles (TED content is CC BY-NC-ND). Every figure is computed in your browser; your text never leaves it. " +
      "Fillers counted: um, uh, er, erm, ah, hmm, mm, you know, I mean, sort of, kind of, basically, literally. Not counted: like, so, actually, right.";
    readout = document.createElement("div"); readout.className = "mb-readout";
    chart = document.createElement("div"); chart.className = "pb-chart";
    hitsEl = document.createElement("div"); hitsEl.className = "pb-hits";
    rootEl.appendChild(presetBox); rootEl.appendChild(edit); rootEl.appendChild(bar); rootEl.appendChild(hint);
    rootEl.appendChild(readout); rootEl.appendChild(chart); rootEl.appendChild(hitsEl);
    setView(presets[0].id);
  }

  function init() {
    rootEl = document.getElementById("pace-bench");
    if (!rootEl || !root.PACE_SAMPLE || !root.PACE_PRESETS) return;
    sample = root.PACE_SAMPLE; presets = root.PACE_PRESETS;
    results = computeAll(sample, 0);
    buildUI();
    root.PACE_LIVE = { show: setView, shuffle: setSeed, score: function (t, s) { return scoreText(t, s, results); },
      get results() { return results; }, get current() { return current; } };
  }

  var api = { textMetrics: textMetrics, computeAll: computeAll, scoreText: scoreText, mulberry32: mulberry32, pct: pct };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  }
})(typeof window !== "undefined" ? window : globalThis);
