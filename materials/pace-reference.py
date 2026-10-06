"""Python reference for the pace bench. Recomputes every number from assets/pace-sample.js and
assets/pace-presets.js independently of the browser engine. Must agree with
`node materials/pace-node.js` to 6 decimals. Usage: python3 materials/pace-reference.py"""
import json, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
from pace_metrics import text_metrics

def load(name, var):
    s = open(os.path.join(here, "..", "assets", name)).read()
    return json.loads(re.search(r"window\." + var + r" = (.*);\s*$", s, re.S).group(1))

M32 = 0xFFFFFFFF
def imul(a, b):
    r = ((a & M32) * (b & M32)) & M32
    return r - (1 << 32) if r & 0x80000000 else r
def to_i32(x):
    x &= M32
    return x - (1 << 32) if x & 0x80000000 else x
def mulberry32(a):
    st = [to_i32(a)]
    def rnd():
        a = to_i32(st[0] + 0x6D2B79F5); st[0] = a
        t = imul(a ^ ((a & M32) >> 15), 1 | a)
        t = to_i32(to_i32(t + imul(t ^ ((t & M32) >> 7), 61 | t)) ^ t)
        return ((t ^ ((t & M32) >> 14)) & M32) / 4294967296
    return rnd
def shuffled(arr, seed):
    a = list(arr); rnd = mulberry32(seed)
    for i in range(len(a) - 1, 0, -1):
        j = int(rnd() * (i + 1)); a[i], a[j] = a[j], a[i]
    return a
def mean(a): return sum(a) / len(a) if a else 0
def pearson(x, y):
    mx, my = mean(x), mean(y); sxy = sxx = syy = 0.0
    for a, b in zip(x, y):
        dx, dy = a - mx, b - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy
    return sxy / (sxx * syy) ** 0.5 if sxx > 0 and syy > 0 else 0
def pct(s, q):
    h = (len(s) - 1) * q / 100; lo = int(h); hi = min(lo + 1, len(s) - 1)
    return s[lo] + (h - lo) * (s[hi] - s[lo])
def below(s, v): return 100 * sum(1 for x in s if x < v) / len(s)
def summary(s):
    return {"p1": pct(s, 1), "p5": pct(s, 5), "p25": pct(s, 25), "p50": pct(s, 50), "p75": pct(s, 75),
            "p95": pct(s, 95), "p99": pct(s, 99), "min": s[0], "max": s[-1], "mean": mean(s)}

def compute_all(S, seed):
    d = shuffled(S["d"], seed) if seed else S["d"]
    n = S["n"]
    wpm = [S["w"][i] / (d[i] / 60) for i in range(n)]
    sl = sorted(S["w"][i] / S["s"][i] for i in range(n))
    pm = sorted(100 * S["p"][i] / S["w"][i] for i in range(n))
    fr = sorted(100 * S["f"][i] / S["w"][i] for i in range(n))
    ws = sorted(wpm)
    real = sorted(S["w"][i] / (S["d"][i] / 60) for i in range(n))
    lo, hi = pct(real, 1), pct(real, 99)
    hist = [0] * 30
    for v in wpm: hist[min(29, int(v // 10))] += 1
    hes = sum(S["h"]); words = sum(S["w"])
    return {"seed": seed, "n": n, "wpm": summary(ws), "hist": hist,
            "wordsMinutesR": pearson(S["w"], [x / 60 for x in d]),
            "outsideRealRange": 100 * sum(1 for v in ws if v < lo or v > hi) / n,
            "sentence": summary(sl), "pauses": summary(pm), "phraseFillers": summary(fr),
            "hesitationTotal": hes, "hesitationTalks": sum(1 for x in S["h"] if x > 0), "wordsTotal": words,
            "hesitationPer10k": 10000 * hes / words,
            "laughShare": 100 * sum(1 for x in S["la"] if x > 0) / n, "applauseShare": 100 * sum(1 for x in S["ap"] if x > 0) / n,
            "laughMedian": pct(sorted(S["la"]), 50), "applauseMedian": pct(sorted(S["ap"]), 50),
            "_sorted": (ws, sl, pm, fr)}

def score(text, seconds, R):
    m = text_metrics(text); ws, sl, pm, fr = R["_sorted"]
    o = {k: m[k] for k in ("words", "sentences", "pauses", "hes", "phr", "laughter", "applause")}
    o["seconds"] = seconds
    o["wpm"] = m["words"] / (seconds / 60); o["wpmBelow"] = below(ws, o["wpm"])
    o["sentenceLen"] = m["words"] / max(1, m["sentences"]); o["sentenceBelow"] = below(sl, o["sentenceLen"])
    o["pausesPer100"] = 100 * m["pauses"] / m["words"]; o["pausesBelow"] = below(pm, o["pausesPer100"])
    o["phrPer100"] = 100 * m["phr"] / m["words"]; o["phrBelow"] = below(fr, o["phrPer100"])
    o["hesPer100"] = 100 * m["hes"] / m["words"]
    return o

def r6(v):
    if isinstance(v, bool): return v
    if isinstance(v, (int, float)): return int((v * 1e6 + 0.5) // 1) / 1e6 if isinstance(v, float) else v
    if isinstance(v, list): return [r6(x) for x in v]
    if isinstance(v, dict): return {k: r6(v[k]) for k in sorted(v) if not k.startswith("_")}
    return v

if __name__ == "__main__":
    S = load("pace-sample.js", "PACE_SAMPLE"); P = load("pace-presets.js", "PACE_PRESETS")
    out = {}
    for sd in (0, 1, 4, 7):
        R = compute_all(S, sd)
        out["seed%d" % sd] = R
        out["presets_seed%d" % sd] = {p["id"]: score(p["text"], p["seconds"], R) for p in P}
    print(json.dumps(r6(out), indent=1, sort_keys=True))
