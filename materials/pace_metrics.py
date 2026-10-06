"""Text metrics for the pace bench. Mirrored exactly by textMetrics() in assets/pace-live.js.

Every rule here is stated on the widget:
- curly apostrophes become straight; text is lowercased for filler matching only
- a parenthesised cue such as (Laughter) or (Applause) is counted, then removed before counting words
- a word is a run of ASCII letters, digits or apostrophes
- a sentence ends at a run of . ! or ? ; trailing words with no end mark count as one more sentence
- pause marks are the characters . , ; : ! ? (where a transcript gives a reader a place to breathe)
- hesitation fillers: um uh er erm ah hmm mm  (whole words)
- phrase fillers: you know, i mean, sort of, kind of, basically, literally (whole words)
  "like", "so", "actually" and "right" are NOT counted: a word list cannot tell the filler from the meaning.
"""
import re

HESITATION = ["um", "uh", "er", "erm", "ah", "hmm", "mm"]
PHRASES = ["you know", "i mean", "sort of", "kind of", "basically", "literally"]

CUE_RE = re.compile(r"\(([^)]*)\)")
WORD_RE = re.compile(r"[A-Za-z0-9']+")
END_RE = re.compile(r"[.!?]+")
PAUSE_RE = re.compile(r"[.,;:!?]")
HES_RE = re.compile(r"(?<![A-Za-z0-9'])(?:" + "|".join(HESITATION) + r")(?![A-Za-z0-9'])")
PHR_RE = re.compile(r"(?<![A-Za-z0-9'])(?:" + "|".join(p.replace(" ", r"\s+") for p in PHRASES) + r")(?![A-Za-z0-9'])")


def text_metrics(text):
    t = text.replace("’", "'").replace("‘", "'")
    cues = [c.strip().lower() for c in CUE_RE.findall(t)]
    laughter = sum(1 for c in cues if c.startswith("laugh"))
    applause = sum(1 for c in cues if c.startswith("applause") or c.startswith("cheer"))
    music = sum(1 for c in cues if "music" in c or "sing" in c)
    body = CUE_RE.sub(" ", t)
    words = len(WORD_RE.findall(body))
    ends = END_RE.findall(body)
    sentences = len(ends)
    tail = END_RE.split(body)[-1]
    if WORD_RE.search(tail):
        sentences += 1
    pauses = len(PAUSE_RE.findall(body))
    low = body.lower()
    hes = len(HES_RE.findall(low))
    phr = len(PHR_RE.findall(low))
    return {"words": words, "sentences": sentences, "pauses": pauses, "hes": hes, "phr": phr,
            "laughter": laughter, "applause": applause, "music": music}
