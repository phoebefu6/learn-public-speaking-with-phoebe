<!-- learn-with-phoebe hub banner -->
> ### 📚 Part of [**Learn with Phoebe**](https://phoebefu6.github.io/learn-with-phoebe/)
> The shelf of 148 free, hands-on courses on AI, data, and the craft around them. **[Browse every course ↗](https://phoebefu6.github.io/learn-with-phoebe/)**
<!-- /learn-with-phoebe hub banner -->

# Learn Public Speaking with Phoebe

Six 45-minute sessions on giving a talk to a room: the one sentence your talk is for, the first
thirty seconds and the last line, what nerves are and what the evidence on taming them shows,
your speaking pace measured against real talks, slides that support you instead of competing, and
rehearsal plus the questions after. The running case is a constructed team lead preparing her
first all-hands talk; every build-along runs on a talk of your own.

**Live site:** https://phoebefu6.github.io/learn-public-speaking-with-phoebe/

| # | Session | Signature thing |
|---|---|---|
| 1 | One idea worth the room | The throughline, the cut list, a ten-minute slot as a word budget |
| 2 | The first thirty seconds and the last line | An opening that earns attention, a close that ends on your sentence, Mehrabian's real scope |
| 3 | Nerves are physiology | The "get excited" study read at source, with its 2025 replication |
| 4 | The pace bench | Your pace against 2,299 TED talks, computed in the browser |
| 5 | Slides that support, not compete | Identical on-screen text in a controlled study; 10/20/30 as opinion |
| 6 | Rehearsal that works, and the questions after | Rehearsing on the clock, predicting questions, the final run-through |

The bench in session 4 (`assets/pace-live.js`, data in `assets/pace-sample.js`, presets in
`assets/pace-presets.js`) holds derived per-talk counts for 2,299 one-speaker TED talks from the
Kaggle dataset rounakbanik/ted-talks: word, sentence, pause-mark, filler, laughter and applause
cue counts, plus running time. Median pace is 152.2 words a minute over the whole talk, the middle
half 136.9 to 167.7, the 99th percentile 205.7. A learner pastes their own transcript and sees
where they sit. The anti-lever, "speak faster to fit more in", puts a constructed opening at 216.6
words a minute with 6.4 pause marks per 100 words; comprehension is not measured and the widget
says so. A break button shuffles running times across talks: the median holds but half the talks
leave the real range.

TED talks are licensed CC BY-NC-ND 4.0, so no transcript text, titles or speaker names are
shipped, only counts derived once by `materials/build-pace-sample.py`. An independent Python
reference (`materials/pace-reference.py`) agrees with the browser engine on every count for all
2,464 transcripts and on every bench number to six decimals.

Free, by Phoebe Fu.
