# Reference HTML Templates

Permanent copies of the canonical-good HTML video patterns. Originals live under gitignored `videos/` and `sandbox/` directories — these copies are tracked so they survive any branch operation.

| File | Origin | What it demonstrates |
|---|---|---|
| `editorial-reference-36s.html` | `videos/editorial-reference/index.html` | 36s linear-scene editorial video, OpenAI Layo rebuild. Single self-contained HTML with vendored GSAP, atmospheric kit, multi-beat composition. Approved as the canonical Track B reference. |
| `editorial-reference-BEATS.md` | `videos/editorial-reference/BEATS.md` | Per-beat spec for the above (13 beats, atmospheres, transitions). Load-bearing for understanding the HTML — shows the intent vs the implementation. |
| `openai-replica-18s.html` | `sandbox/openai-replica-18s.html` | First-try 18-second sandbox proof. Built when Claude was asked to mimic the ssstwitter video. Worked first try. The single-HTML editorial pattern's ground-zero reference. |
| `wpforms-ai-prompt-open.html` | `videos/wpforms-ai-prompt-open/index.html` | Hand-prompted beat-by-beat with explicit HTML supplied. The closest reference to the approved editorial direction (2026-05-10). Demonstrates the **identity-continuity authoring pattern**: a single morphing element (`#cta`) carries viewer attention Button → Input → Sullie pill → Chat panel over 12s. |

**Why these matter for any future editorial work:**

These four files together encode the entire successful editorial pattern. Read in this order:
1. `openai-replica-18s.html` — proof the pattern works
2. `editorial-reference-36s.html` + `editorial-reference-BEATS.md` — the canonical 36s shape
3. `wpforms-ai-prompt-open.html` — what "best" looks like for this product specifically

Any new editorial-track video should clone-and-customize one of these, not invent from scratch. See `docs/editorial-direction-audit-2026-05-10.md` and `docs/winning-pattern-analysis-2026-05-10.md` for the analysis behind this rule.
