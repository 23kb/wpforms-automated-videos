# `editorial-reference` — Per-Beat Spec

36 seconds total. 13 beats. Times are approximate (±0.2s ok). Source: dense frame analysis of the OpenAI Layo reference at 0.05s spacing.

| # | Time | Composition | Atmosphere | Subject / animation | Transition out |
|---|---|---|---|---|---|
| 1 | 0.0 – 0.5 | white-empty | white-empty | Blue caret blinks alone at center. | (continues into beat 2) |
| 2 | 0.5 – 2.7 | white-empty | white-empty | **caret-typing**: "Your customers just asked AI" types letter-by-letter at center, caret advancing. | (continues into beat 3) |
| 3 | 2.7 – 4.5 | small-element-on-empty | white-empty | **typed-text-to-input-morph**: typed line gains a "+" prefix, container border, send-circle on right. Becomes a chat-input row. Final text: "+ Your customers just asked AI to do your job." with a circular send button on the right. | hard-pop |
| 4 | 4.5 – 7.5 | centered-subject | bottom-asymmetric-bloom (right) | Phone slides UP from bottom (anticipation: brief delay before fast pop-up). New caption "…and you weren't there." pops in at top. Inside phone: ChatGPT mock. User msg "Book me a hotel in New York City" appears at ~5.9s. AI reply "Sorry, I can't help with that." appears at ~6.7s. | anticipation + directional exit (phone exits upward with blur) |
| 5 | 7.5 – 10.5 | centered-subject | bottom-symmetric-bloom | **char-cascade-reveal**: "Be the answer." appears at center-top. Holds for ~2.5s. | element pop-in |
| 6 | 10.5 – 14.5 | centered-subject | cyan-bar-with-texture | A small device-frame container ("Mobile 353×852" label visible above) appears centered, containing a phone with a map preview inside. **Layo logo** appears above it. Caption "Your app, inside AI." at bottom. The whole assembly is a small element on a mostly-empty canvas with a faint city-map texture in the bg. | hard layout swap |
| 7 | 14.5 – 16.7 | wide-three-region | side-bloom-purple (right) | "Build the interface." text top-left as part of a three-line dimmed/active stack. Layo AI side panel top-right with "Make the room cards clickable…" text typing in (caret-typing). Hotel card "Crosby Street Hotel" appears in canvas with a "Card" tag. Subtle drag motion on the card. | horizontal slide bridge (map slides in from right as bridge) |
| 8 | 16.7 – 21.0 | full-canvas-content | side-bloom-peach (left) | **Bridge state** ~16.7–17.4s: map texture appears on right, transitions through. Then **progressive-row-fill**: spreadsheet "Hotels" table fills with rows top-to-bottom (~0.07s per row stagger). Whole table slides down ~10–20px during fill. Side chat panel with quick-reply pills appears. Caption "Connect your data." at top-left, three-line stack with active highlight. Long hold ~3s after fill completes. | anticipation + directional exit |
| 9 | 21.0 – 23.5 | wide-three-region | saturated-blue | "Deploy everywhere" composition: a browser-like share/publish UI with a "Publish" button visible, plus an AI Chat panel on the right with "Thought for 4s. Your app is ready to go live, want me to publish?" caption. | hard layout swap (within beat — see beat 10) |
| 10 | 23.5 – 24.5 | single-element-zoom | white-empty | **The Publish button alone in the middle of the frame**, white background, all other UI gone. ~1 second hold on the button. This is a within-section zoom-in to a click target. | hard-pop |
| 11 | 24.5 – 27.0 | small-element-on-empty | white-empty | **toggle-flick** sequence: ChatGPT row with toggle flicks to active (green). Claude row appears below; its toggle flicks to active. "Last published 1d ago" + "Docs ↗" caption underneath. | hard-pop |
| 12 | 27.0 – 30.5 | centered-subject | white-empty → soft outro blue | Phone returns. **focus-pull-reveal** on phone (high blur + low opacity → resolved, with subtle scale). User msg "Book me a hotel in New York City" already there. AI replies with "Absolutely, here are hotels from Stayspot." Map of NYC with hotel pins fills the lower part of the screen (focus-pull-reveal again on map). | anticipation + directional exit (phone slides up out of frame with blur) |
| 13 | 30.5 – 36.0 | centered-subject | outro-blue-gradient | Caption "Your app. Right when they need it." reveals (word-stagger-reveal). Then resolves to fade. **scale-up-outro**: Layo logo grows from ~0.7 to ~1.0 scale over ~3–4s, centered. Final hold. | (end) |

## Required behaviors checklist

The rebuild must demonstrate every item below.

**Opening (beats 1–3):**
- [ ] Real blinking caret visible from frame 0
- [ ] caret-typing (not word-stagger) for letter-by-letter reveal
- [ ] At ~2.7s typed text morphs into chat-input row (with "+" prefix and send-circle)

**Transitions:**
- [ ] At least 4 of the 5 transition types are used (horizontal-slide-bridge optional)
- [ ] Every element exit has anticipation cue (~0.15s slight pre-move)
- [ ] No two consecutive beats use the same transition type

**Atmospheres:**
- [ ] At least 6 distinct atmospheres across the 13 beats
- [ ] Continuous subtle motion on every atmosphere (no frozen pixels) via `pausableRaf` or registered timeline
- [ ] Atmosphere swaps WITH transitions, no gradual drift

**Within-beat moves:**
- [ ] Beat 8 progressive-row-fill on spreadsheet
- [ ] Beat 10 single-element-zoom on Publish button (white-empty, button alone)
- [ ] Beat 11 toggle-flick on both rows
- [ ] Beat 13 scale-up-outro on Layo logo over 3+ seconds

**Layout discipline:**
- [ ] No full-page mock UI; UI fragments small (~25–30%) with empty atmospheric space
- [ ] At least 2 beats use single-element-zoom or small-element-on-empty composition

**Postmortem ambition floor:**
- [ ] At least one MorphSVG keyframe (Layo logo lockup or input-morph at beat 3)
- [ ] At least one DrawSVG path-with-morph (input row outline at beat 3)
- [ ] At least one named CustomEase with comment explaining its feel (phone exit ease)
- [ ] At least one Physics2D moment OR equivalent manual physics RAF (toggle flick ejecta in beat 11)
- [ ] Animated grain via `pausableRaf` throughout
- [ ] Multi-stop gradients (3+) on every gradient
- [ ] Multi-layer radial blur on glows/halos

## Anti-patterns (do NOT repeat — Phase 1 misses)

1. Uniform blur-dissolve between every beat. Reference uses 5 different transitions.
2. One persistent atmospheric bed for the whole video. Atmospheres are scene-specific.
3. Word-stagger reveal for the opening line. It's caret-typing, with a visible cursor.
4. Full-canvas mock UI in every UI beat. Reference uses small UI fragments on empty canvas.
5. No within-beat zoom-in. The Publish-button moment is structural.
6. No anticipation before exits. Elements should pre-move ~0.15s.
7. Static atmosphere during holds. Even 3-second holds have subtle motion.
8. Word-by-word reveal for "Be the answer." It's character cascade.
9. Outro is a quick fade. It's a 3+ second logo scale-up.
