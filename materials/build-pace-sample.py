"""Builds assets/pace-sample.js from the public Kaggle TED dataset (rounakbanik/ted-talks, v3).

TED talk transcripts are CC BY-NC-ND, so NOTHING from a transcript is shipped: no text, no
titles, no speaker names, no urls. Only per-talk integers derived here (word count, sentence
count, pause marks, filler counts, laughter and applause cue counts) and the talk's duration.

Filter (stated on the widget): one speaker, at least 300 transcript words, fewer than 3 music or
singing cues (removes performances). Duration is the whole video in seconds, so it includes
applause, laughter and any clip: words per minute here is pace over the whole talk.

Usage: python3 materials/build-pace-sample.py   (needs kagglehub; no login required)
"""
import json, os, sys
import pandas as pd
import kagglehub
sys.path.insert(0, os.path.dirname(__file__))
from pace_metrics import text_metrics

P = kagglehub.dataset_download("rounakbanik/ted-talks")
m = pd.read_csv(os.path.join(P, "ted_main.csv"))
t = pd.read_csv(os.path.join(P, "transcripts.csv")).drop_duplicates("url")
j = m.merge(t, on="url")
rows = []
for _, r in j.iterrows():
    k = text_metrics(r.transcript)
    if r.num_speaker != 1 or k["words"] < 300 or k["music"] >= 3:
        continue
    rows.append((int(r.film_date), int(r.duration), k))
rows.sort(key=lambda x: (x[0], x[1], x[2]["words"]))
cols = {"w": "words", "s": "sentences", "p": "pauses", "h": "hes", "f": "phr", "la": "laughter", "ap": "applause"}
S = {"n": len(rows), "merged": int(len(j)), "d": [r[1] for r in rows]}
for c, k in cols.items():
    S[c] = [r[2][k] for r in rows]
S["years"] = [int(pd.to_datetime(min(r[0] for r in rows), unit="s").year), int(pd.to_datetime(max(r[0] for r in rows), unit="s").year)]
out = os.path.join(os.path.dirname(__file__), "..", "assets", "pace-sample.js")
with open(out, "w") as fh:
    fh.write("/* pace-sample.js - derived per-talk numbers from the public Kaggle TED dataset (rounakbanik/ted-talks).\n"
             "   No transcript text, titles or names: TED content is CC BY-NC-ND. Built by materials/build-pace-sample.py. */\n")
    fh.write("window.PACE_SAMPLE = " + json.dumps(S, separators=(",", ":")) + ";\n")
print(S["n"], S["merged"], S["years"], os.path.getsize(out))
