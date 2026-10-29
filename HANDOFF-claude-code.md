# Jungle John's — handoff for Claude Code

Read all of this before touching code. Owner: Flah. He is not a programmer. Talk plain, short, lowercase is fine.

## 1. What this is
A top-down SNES-style grocery store game, played in the browser. You are the store boss on roller skates.
Parody of Jungle Jim's International Market (Fairfield + Eastgate, Ohio). Name in game: "Jungle John's".
Live copy: https://claude.ai/artifact/M3M1YVBEoMT2pDLgQWMmuY (published from claude.ai chat).

## 2. Where everything is (Flah's PC)
```
C:\jungle jim\
  jungle-johns-game-folder\
    game\                      <- git repo (local only, no remote yet)
      jungle-johns.html        <- the built game. double-click to play
      README.txt               <- plain-English notes for Flah
      HANDOFF-claude-code.md   <- this file
      source\
        build.py               <- python build.py  -> source\dist.html (copy over jungle-johns.html)
        run_tests.py           <- python run_tests.py  -> build + every test, ALL GREEN or RED
        template.html          <- HTML + CSS shell; fonts are inlined from source\fonts
        src\                   <- the code (see section 4)
        tests\                 <- browser tests (see section 6)
  plinky\                      <- Flah's local Slimehedron copy; compare with section 5
  plinky-assets\               <- Slimehedron assets/backups
```
Keep all game files inside `C:\jungle jim\jungle-johns-game-folder\game\`.

## 3. Flah's rules (follow every time)
- Ask before assuming intent, architecture or requirements. One round of questions, each with your recommended answer.
- Simplest thing that works. No abstractions nobody asked for.
- Don't touch code unrelated to the task.
- Flag uncertainty out loud. Check sources. Never guess facts.
- A test that proves it RUNS is not a test that it WORKS. Check it is playable, readable, findable.
- Never change a design just to make a test pass. Fix the thing, then the test.
- Art: match the established pixel style. Never swap illustrated art for flat vector/chart glyphs. Ask before changing art direction.
- UI copy: short, plain, concrete. No flavour text, no "AI words".
- Don't describe the project as a version or successor of anything.
- End every pass with a plain list of what to upload/delete on GitHub (there is no repo yet; see backlog).

## 4. Code map (source\src, plain JS, no framework, one canvas)
| file | what |
|---|---|
| data.js | CONFIG (store/owner name), DEPTS (aisles: position, layout, prices, crate type), CRATES, UPGRADES, EVENTS, GOALS, customer LINES |
| art.js | procedural pixel art: floors, shelf items, shelves, coolers, bins, counters, props, customers |
| art2.js | 3x5 pixel font, pixel signs, the boss sprite (skate poses) |
| world.js | building footprint (FOOT), stock room, doors, dept layouts, A* pathfinding, ground pre-render |
| game.js | state, clock, customers AI, registers, staff AI, skate physics (updatePlayer), actions, tasks, save/load |
| render.js | camera, y-sorted drawing, shadows, lighting, rain, monorail, overlay text, bubbles |
| ui.js | DOM HUD, dialog, title, catalog, report, journal, map, pause |
| music.js | generative music (built from Slimehedron, section 5) |
| audio.js | sound effects + musicTick() which picks the music situation |
| main.js | input (keyboard + touch), loop, start-up |
Debug hook: `window.__game` exposes state. Save key: `localStorage['jungle-store-save-v1']` (saves at end of each day).

Rename the store: data.js -> CONFIG.storeName / ownerName, then rebuild.

## 5. Music: what exists and what's next
music.js reuses Slimehedron (c) FlahMusic, GPL-3.0-or-later, taken from the PUBLIC GitHub repo FlahMusic/Slimehedron (cloned 2026-10-28), not from the files Flah put in C:\jungle jim.
Reused: rep()/bars() step format, KITS (chip, bossa, pop, march, conga, samba, jazz), KITVOICE, padKeeps() thinning, FEEL humanize, CHORD_FN.major odds, one-fifth key journey per day, pluck() voice.
Credit: pop/bossa/jazz patterns came from casio-music-data via Slimehedron; see its THIRD-PARTY.md before anything public/commercial.

Built here on top:
- API: MUSIC.init/start/stop/setSituation/setDay/sting/setVolume. Situation changes land on the next bar line.
- 14 situations (title, prep, day, busy, lounge, candy, checkout, stock, outside, rain, fest, night, menu, sleep). Each has bpm, meter (4/4 or 3/4 waltz), key offset from the day's root, mode (major, dorian, mixolydian, minor, lydian), lead voice, bass voice, lead density.
- Voices: accordion (2 detuned squares + saw, vibrato), flute (sine+tri, vibrato), chip square, pluck, tuba (filtered saw, oom-pah), pad, drums. 8-voice cap. Melody echo, darker repeats. Master low-pass.
- Melody: a 2-bar motif (rhythm + contour) re-fitted to each chord, varied every 4 bars, new motif every 8 bars, rests every 4th pair of bars.
- Picking the situation: audio.js musicTick() (area, inside/outside, time, rain, fest, register, stock room, menus).

How the SNES numbers were chosen: measured 11 Harvest Moon (SNES) FAN MIDI transcriptions from vgmusic.com (stats only, no melodies copied): 95-180 bpm, mostly major, 3 of 11 in 3/4, fall/winter in A minor, 5-10 lead notes per bar, 4-10 voices, GM programs mostly 21 accordion, 48 strings, 58 tuba, 0 piano, 72 piccolo, 45 pizzicato. Fan transcriptions can be wrong (tempos may be written double-time). Do not copy any tune.

Next for music (ask Flah first):
1. Diff Flah's local Slimehedron files against the GitHub version used here. If his are newer, port the changes that matter (kits, chord brain, voices). Don't port the tank/physics, lessons or UI.
2. He wants more flavour per environment: more modes/keys/bpms, maybe a situation per international area.
3. Samples or synth only? Samples (accordion, marimba, flute) would sound more SNES. Ask.
4. He decides by ear. Numbers don't decide "relaxing" or "happy".

## 6. Tests (run them, keep them green, add to them)
Setup once: `pip install playwright mido` then `python -m playwright install chromium` (done on Flah's PC 2026-10-29).
One command: `python source\run_tests.py` builds, runs all five, prints PASS/FAIL per suite, exits 1 if any are red (`-v` prints full output). It checks FAIL lines, page errors, reach blocked lists and sim path failures. Skate numbers have no targets yet, so it only checks skate runs clean.
Build output uses LF line endings, so a fresh build is byte-identical to jungle-johns.html when nothing changed.
- tests\t2.py: 21 real-keypress flows (skate, crates, restock, lost customer escort, mop, wrench, fish, cheese cooler, register scan, sleep, report, catalog buy, next day, save/continue)
- tests\reach.py: every aisle, pallet, register lane and door reachable on foot (with and without upgrades)
- tests\sim.py: simulates full idle days (economy, path failures)
- tests\skate.py: skate physics numbers (accel, strides alternate L/R, coast, brake, carve, T-stop, fine tap)
- tests\mtest.py (+ mtest.html): offline-renders every music situation; peak < -1 dBFS, <= 8 voices, notes per bar, situation switches on bar lines
Mutation check (do it when you change a rule): break the rule on purpose, confirm the test goes red, put it back.
Last known results: all green. Music peak about -14 dB, max 7 voices. Skate: 0.37 s to top speed, coast 2.5 tiles, brake 0.5 tile, T-stop 0.37 s.

## 7. Legal / likeness (keep it this way)
- Parody name Jungle John's. No Jungle Jim's logos, photos, map art.
- Do not draw Jim Bonaminio or his wizard mascot art. The title uses an original generic wizard hat; the boss sprite is an original design.
- Real brands are generic in game (soup can, coffee bar, sub counter, "Mercado Grande").
- Layout follows the Fairfield floor plan (facts), with Eastgate extras (deals, honey hive).

## 8. Facts used, with sources
- 1971 first produce stand, Erie & High St, Hamilton OH — junglejims.com/about-us/the-jungle-jim-story
- "treat customers like gold, have fun doing it" — same page
- ~82,000 shoppers a week — en.wikipedia.org/wiki/Jungle_Jim%27s_International_Market
- Sherwood Forest scene on aisle 25; elephants/giraffes, palm trees, waterfalls outside — thetakeout.com/1792042/jungle-jims-ohio-grocery-store-animatronics
- fake penguins in frozen, real hornets' nests in honey, Corn & Butter under the 1974 sign, Big Cheese case — kiosk.travelbutlercounty.com/blog/post/must-see-jungle-jims
- porta-potty restrooms (2007 best bathroom award), soup can on a swing near the Foodie entrance — travelbutlercounty.com/node/11636
- fire truck and race car hung from the ceiling, singing lion — evansvilleliving.com/stranger-things/
- monorail from Kings Island, moved there in 1998 — kicentral.com/?p=123
- open 8 AM - 10 PM — junglejims.com
- Product counts disagree across sources (180k / 200k+, 70+ / 75+ countries). In game only the numbers printed on their maps are used.

## 9. Backlog (ask Flah which first)
1. Sound check with Flah, tune situations by ear (music.js SIT table).
2. Skate feel tuning with Flah (game.js updatePlayer, SK constants).
3. Art quality: customers, counter cases, tasting bar, registers. Same pixel style. Show Flah before/after.
4. Local git repo exists (2026-10-29). Still open: GitHub remote (where? FlahMusic?), and a license (music.js is GPL-3.0-or-later code, so the game likely has to be GPL too if shared; ask Flah). Give the upload/delete list each pass.
5. Rhino entrance "quick trips" register (map has registers there).
6. Save mid-day (now only at day end).
7. Skate targets in run_tests (needs Flah's OK on the numbers).

## 10. Skills to use
- prove-it-works: verify outcomes a human notices (playable/readable/findable), not "it ran".
- frontend-design: HUD/menus/title look.
- modern-web-guidance: browser APIs (Web Audio, canvas, storage) before writing client JS.
- engineering:testing-strategy and engineering:debug: when adding tests or chasing bugs.
- design:design-critique: before/after art reviews with Flah.
If a skill isn't installed in your Claude Code setup, say so and carry on without it.
