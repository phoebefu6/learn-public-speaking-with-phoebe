# Agent brief - shared by every fan-out page of learn-public-speaking-with-phoebe

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   how many options each question has (4):
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-public-speaking-with-phoebe/courses/01-one-idea-worth-the-room.html`
   For rhythm on a numbers-heavy page you may also skim
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-public-speaking-with-phoebe/courses/04-the-pace-bench.html`
2. The source map: every verified number, its evidence tier, per-session coverage, the seams, the
   constructed facts about Noor. Use ONLY its numbers; never invent a statistic; if a fact is
   missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-public-speaking-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens (first 30 lines):
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-public-speaking-with-phoebe/assets/style.css`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY `<a href="../index.html">learn-public-speaking-with-phoebe</a> / Session N of 6`,
#toggle-all, #zoom-toggle) · masthead (eyebrow "Learn Public Speaking with Phoebe · Session N of 6",
h1 with one `<span class="accent">`, .sub, .chip-row with the level chip (🟡 Core for sessions 2-3,
🟠 Deeper for sessions 5-6), two `.chip.audience`, `.chip.time` "45 min", .agenda a1-a4 with flex
weights, labels "0-3 · Welcome", "3-18 · ...", "18-40 · Build-along: ...", "40-45 · Q&amp;A")
· main.wrap · section#intro (Part 0: kicker "Where we are", .lede, .legend pills exactly as in the
template, .callout.win "★ What you walk out with tonight.") · 3 Parts, each `section.section#part-N`
with section-kicker (klabel "Part N · covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE
figure, `details.card` accordions (summary: `.mode.live` or `.mode.self`, title, `.mini`,
`.caret ▶`), at least one `.callout.example` with `span.ex-pill` "Real world" on the page ·
section#demo-1 Build-along (kicker `.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure,
`.steps > .step`, each with a `p` and a `.prompt-box.good` carrying a `span.label` "★ Step N · ..."
BELOW the p; build-alongs are worksheets and scripts on the learner's own talk, with Noor's
constructed version alongside) · section#exercise Homework (h2 "Before session N+1", ol, 4 items;
session 6 uses "Where to go from here") · section#quiz (3 x `.quiz-q data-answer="0-based"`,
`p.qtext`, 4 x `button.qopt` "A · ...", `p.qwhy`; one `p.quiz-score` after the last; vary the
correct letter) · section#official, h2 EXACTLY "What this session teaches, and where it came from",
`.covered > .covered-row` (pill solid ✓ / light ◐ + name + note), then the `.mono` line EXACTLY
"Every fact on this page, and its verification tier, is recorded in the course's source map." ·
section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin this</span>", .grid-2 of six
.cheat-item) · `.callout.next` with `.nx-pill` "Next session" (session 6: point to the hub and the
neighbouring courses instead) · footer.pagefoot · `<script src="../assets/app.js?v=1">`.

Head: the template's social meta block with this page's own title/description/url
(`https://phoebefu6.github.io/learn-public-speaking-with-phoebe/courses/<file>`, og:image stays
`.../assets/og-cover.png`); `<title>Session N · <Title> - learn public speaking with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. Never invent outputs as if measured.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
- Citations in the form of the map's appendix; anything marked R or U in the map is "reported" or
  "could not be read" on the page, never put in quotation marks as the author's words. Quotes:
  only the AS quotes in the map, verbatim, under 25 words each.
- NEVER "lottery" or "lotteries"; say the mechanism.
- Default to the English word. Any Chinese term carries its English in brackets, every occurrence.
- Titles and class names must not collide with siblings. Do NOT use as titles: "The spoken
  version", "Structure", "The first fifteen seconds decide the next ten minutes", "Silence, on
  purpose", "Nerves, honestly", "Slides that carry", "The 30-second test", "The room". Ids
  `pace-bench` and classes starting `pb-` are reserved for session 4.
- **FICTIONAL CASE ONLY.** The running case is Noor Haddad, a CONSTRUCTED team lead (see the map
  for her exact constructed facts; do not invent new numbers for her beyond what a step needs, and
  label any you add "constructed"). Label her "constructed" at first mention on the page. NEVER use
  Phoebe's own journey, employers, clients or courses as a case, and never mention Phoebe in body
  text. Real-world callouts use the real sources in the map (Anderson, Robinson, Brooks, the
  replication, Chapman, Kawasaki, Yue/Bjork/Bjork, Sticht) or generic unnamed professional
  situations; never a named private person.
- Seams: link, never teach. Message structure and the meeting-length spoken message ->
  https://phoebefu6.github.io/learn-communication-with-phoebe/courses/03-structure.html and
  https://phoebefu6.github.io/learn-communication-with-phoebe/courses/05-the-spoken-version.html ;
  deck design -> https://phoebefu6.github.io/learn-visual-storytelling-with-phoebe/ and
  https://phoebefu6.github.io/learn-ai-ppt-with-phoebe/ ; running a workshop or meeting ->
  https://phoebefu6.github.io/learn-facilitation-with-phoebe/ ; speaking in a second language ->
  https://phoebefu6.github.io/learn-business-english-with-phoebe/
- Never invent speaking statistics ("audiences remember 10%", "practise 10 times", "people decide
  in 7 seconds", "93% is non-verbal" as fact). If a famous number comes up, use the map's status.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): `#8F0500` (primary, cinnabar) `#5A0A04` (deep)
`#A8200A` (vermilion mid) `#F3B9AB` (soft) `#FDEFEB` (tint) `#2B1411` (ink) `#6B4A44` (muted)
`#E2CAC4` (faint) `#F2E3DF` (hairline) `#8A5A00` (ochre contrast) `#5E3D00` (ochre ink) `#FBF1DC`
(ochre tint) `#FFFCFB` · `#FFFFFF` · universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a
wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: `s<session><letter>` (s2a, s2b, s2c, s2d;
  s3a...; s5a...; s6a...).
- `<defs>` holds with prefix P: a wobble filter `id="PSk"` (`feTurbulence type="fractalNoise"
  baseFrequency="0.02" numOctaves="2" seed="<int>"` + `feDisplacementMap scale="2.4"
  xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%" width="106%" height="106%"`), a
  hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one `#8F0500` line, opacity .5), an
  open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, stroke `#2B1411` 1.6). ALL shapes
  sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#2B1411" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation (-2 to 2 degrees
  for items, under 1 for panels). Fills: white, `#FDEFEB`, `#FBF1DC`, the hachure for "the pile" or
  "the data", and the cinnabar `#8F0500` ONLY for the one thing the figure is about. One doodle
  anchor per figure, simple strokes, never a mascot. Text classes: `.PH` 800 12px ink heading ·
  `.PL` 600 12px ink label · `.PS` 400 11px muted · `.PB` 800 11px `#5E3D00` · `.PV` 800 16-20px
  `#5A0A04` value · `.PW` 800 12px white, ONLY on a `#8F0500`, `#5A0A04`, `#A8200A` or `#8A5A00`
  fill · `.PN` 400 12px muted note. Hand-stacked items must not overlap as painted rects (a
  background shape behind items must be a `path`, not a `rect`).
- ALL `<text>` outside the filtered group, sans stack `Inter, sans-serif`, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110
  chars; 40px between neighbouring point labels; bottom note 22px below the last row, H clears it
  by 8px. No line, arrow or curve may cross any label (the gate flags it). Every label must sit
  fully inside its box. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along (4 figures). Draw the MECHANISM (what
  moves where, what is compared with what, what a test catches), never a metaphor literally, never
  decoration.

## Voice and honesty

Every Part gets a real-world angle: a source from the map, or a generic unnamed professional
situation. Constructed material says "constructed" on the page. Research findings are reported
with their scope (who, how many, what task) and their limits. The bench page's honesty standard
applies: say what a finding does not show.

## Footer chain and session titles

1 · One idea worth the room · 01-one-idea-worth-the-room.html
2 · The first thirty seconds and the last line · 02-the-first-thirty-seconds.html
3 · Nerves are physiology · 03-nerves-are-physiology.html
4 · The pace bench · 04-the-pace-bench.html
5 · Slides that support, not compete · 05-slides-that-support.html
6 · Rehearsal that works, and the questions after · 06-rehearsal-and-the-questions.html

Footer left: "Session N of 6 · learn-public-speaking-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: `<a href="<prev file>">← Prev: <prev title></a> &nbsp;·&nbsp; <a href="<next file>">Next: <next title> →</a>`
(session 6: prev is session 5, and the right-hand link is `<a href="../index.html">Course home →</a>`).
