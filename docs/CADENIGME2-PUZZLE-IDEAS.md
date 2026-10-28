# CADENIGME2 — puzzle ideas pool

Living document for **candidate chapter concepts** (not yet sequenced, not implementation specs). Product rules and global constraints: [`CADENIGME-PRODUCT.md`](CADENIGME-PRODUCT.md), [`CADENIGME2-DESIGN.md`](CADENIGME2-DESIGN.md).

**Do not** paste final archive passwords or full solutions here unless a task explicitly requires spoilers.

---

## Pool principles (v2 tone)

These ideas are selected and written for a **calm, reflective** co-op session:

| Prefer | Avoid (for this pool) |
|--------|------------------------|
| Pausing, re-reading, comparing notes aloud | Countdown timers, “survive the rush”, twitch reflex |
| Describing, translating, deducing, ordering | Real-time sync minigames, simultaneous button presses under pressure |
| Wrong tries that stay **silent** or gently humorous | Harsh fail states that reset long progress |
| Notebook as **reference** players consult at their pace | Mechanics that punish slow discussion |

All concepts assume **voice-only** remote play: no screen share, no linked HTML state, asymmetric DOM per player, optional **procedural instance** (one seed / one truth per game).

**Password model (typical):** each player may reveal a **letter half** or ordered glyphs on their device; combined lowercase word for the next archive — same family as Aliens & hats unless a concept notes a single shared word.

---

## Implementation scope (browser — mandatory)

Every idea in this pool must be buildable like **CADENIGME1** and **Aliens & hats**: static assets on a USB key, opened in a normal browser.

| In scope | Out of scope (for this pool) |
|----------|------------------------------|
| **One HTML page per player** (+ local `assets/`: PNG/SVG, short audio, optional short looped video/GIF) | 3D scenes, free camera, “walk around” spaces, WebGL-heavy toys |
| **Single-screen layout** (viewport shell per [`CADENIGME2-DESIGN.md`](CADENIGME2-DESIGN.md)); inner scroll in a panel is OK | Multi-page apps, embedded mini-games that need their own engine |
| **Simple interactions:** `<button>`, toggles, tabs, `<select>`, text fields (if needed), **drag-and-drop to slots**, **sortable lists**, play/pause **`<audio>`** | Physics, twitch arcs, continuous real-time steering |
| **Feedback:** CSS transitions/keyframes, swap images, `data-*` / `aria-*` state, optional `aria-live` text | Simulation that runs on its own while players race the clock |
| **Co-op split** via different HTML files and notebook PDFs — not live sync | Shared server state, websockets, “both press at once” online gates |

When authoring a concept below, the **On-screen UI** subsection is the contract for implementers: if it cannot be described with the in-scope patterns, rewrite the idea.

**Reference patterns:** levers/toggles, gallery DnD, sortable audio lanes (CADENIGME1), book + object pool (Aliens & hats) — see [`.cursor/rules/03-interactive-puzzles.mdc`](../.cursor/rules/03-interactive-puzzles.mdc).

---

## Index (this pool)

| Working title | Voice core | Primary interaction |
|---------------|------------|---------------------|
| [Ghost Dictaphone Society](#ghost-dictaphone-society) | Listen → describe vowels and contours → name the spirit | Audio encode + icon offering |
| [Twin Apothecary](#twin-apothecary) | Symptom ↔ ingredient reasoning | Lab mixing, dose choices |
| [Elevator of Unlikely Floors](#elevator-of-unlikely-floors) | Narrative manifest ↔ symbol logic | Sequence building |
| [Archive of Lost Gestures](#archive-of-lost-gestures) | Spatial / body description | Pose matching |
| [The Split Symphony](#the-split-symphony-conductor--engineer) | Rhythm & texture in words | Stem layout / ordering |
| [The Two Switchboards](#the-two-switchboards) | Wire labels ↔ room names | Plug DnD into grid |
| [Postcard Wall](#postcard-wall) | Scene & stamp description | Caption ↔ postcard slots |
| [Weaver’s Loom](#weavers-loom) | Pattern readout ↔ weaving | Grid colour cycling |
| [Stamp & Register](#stamp--register) | Document type reasoning | Stamp DnD on rows |
| [Bird Log (dawn chorus)](#bird-log-dawn-chorus) | Call description | Audio + species grid |
| [Costume Call](#costume-call) | Symbol roles ↔ looks | Costume DnD |
| [Telegraph Bench](#telegraph-bench) | Rhythm / grouping | Audio + tap buffer |
| [Exhibit Placards](#exhibit-placards) | Object ↔ label text | Photo ↔ placard DnD |
| [Partitioned Hymn](#partitioned-hymn-no-audio) | Metre & rhyme by voice | Verse ↔ chord rows |
| [Pinboard Alibi](#pinboard-alibi) | Timeline reconstruction | Suspect ↔ time slots |

**Shipped / in repo:** Aliens & hats — [`CADENIGME2-DESIGN.md`](CADENIGME2-DESIGN.md#puzzle-aliens--hats-working-title). Ghost Dictaphone Society — [`CADENIGME2/GhostDictaphoneSociety/`](../CADENIGME2/GhostDictaphoneSociety/README.txt).

---

## Ghost Dictaphone Society

### One-line pitch

A paranormal club archives **wax-cylinder ghosts**. **Troncadelle** plays each cylinder’s ghost vowels; **Ravabulle** rebuilds the series on a CRT and reads back the spirit’s **type and desire**; Troncadelle then sets that ghost and offering on the loaded cylinder. Implementation: [`CADENIGME2/GhostDictaphoneSociety/`](../CADENIGME2/GhostDictaphoneSociety/README.txt).

### Fantasy & tone

Cozy-spooky, not horror. A miss stays silent: the entry strip does not reset, and Troncadelle’s screen stays dark. No clock. Cylinders can be replayed freely.

### Co-op split (voice-only)

| Player | Screen | Partner does not get |
|--------|--------|----------------------|
| **Troncadelle** | **Cylinder bank** (I–VIII), dictaphone with play/stop, **12 ghost** toggles and **24 offering** toggles, small CRT on the machine | Vowel sequences, Ravabulle’s spirit list, Ravabulle’s password half |
| **Ravabulle** | Central **CRT**, vowel row, contour row, duration row, four-note strip | Cylinder audio, the icon grid, Troncadelle’s password half |

**Notebook (session-agnostic):** names of the six contours and the two durations, eight **blank lines** (one per cylinder numeral) for a recap, and the rule that the archive word is **Ravabulle’s half then Troncadelle’s**. It does not list which spirit wants what.

### On-screen UI (HTML scope)

- **Troncadelle:** drag a cylinder onto the dictaphone (keyboard: select + **Placer**). **Lecture / Stop** plays a synthesized vowel series. No waveform. Twelve ghost buttons (one at a time) and twenty-four item buttons (several at once). The loaded cylinder **remembers** its toggles. A neutral **Réglé** mark shows that a cylinder has a selection; it is not a correctness check. The small CRT shows a password half only when **every** cylinder’s ghost and item set match.
- **Ravabulle:** CRT in the center. Three button rows — vowels **A E I O U**, contour curves (flat low, flat high, rise, fall, arch, valley), duration **dot / dash**. A four-slot strip with listen, backspace, and clear. Committing a fourth note that matches a cylinder adds that spirit to the CRT, labelled with the cylinder’s Roman numeral, and clears the strip. The register stays in numeral order. A miss changes nothing. The password half appears on the glass when all eight spirits are found; **the list stays**, including the latest spirit.

A desire is one category. The correct offering is **exactly** the items in that category (all of them, and no others).

### Co-op flow (reflective)

1. Troncadelle names a cylinder aloud (**I–VIII**) and plays it.
2. They describe each sound: vowel, contour, and short or long. Ravabulle can replay the strip they are building.
3. When four notes match, the CRT names the cylinder numeral, the spirit, and the desire. Ravabulle says them aloud. The list stays in numeral order, so a later correction still points at the right cylinder.
4. Troncadelle loads that cylinder and sets its ghost and items. Nothing on that screen says whether the choice is right.
5. Repeat at their own pace. Ravabulle’s half appears after the eighth spirit. Troncadelle’s half appears only when all eight cylinders are right together.

### Instance variation

Per game / seed (same seed on both pages):

- The **four-note sequence** on each cylinder (vowel × contour × duration).
- Which **8 of 12** ghost types are used (the other four stay on the board as decoys).
- Which **desire category** belongs to each cylinder (categories may repeat).
- The two **password halves**.

Ghost and item **button order** stays fixed so printed icons and the notebook do not change per session.

### Win condition & password

- **Ravabulle:** eight matched spirits → half on the CRT; the spirit list remains.
- **Troncadelle:** silent check after every toggle. Success only when each cylinder has the right ghost **and** the exact item set. Half appears on the dictaphone screen.
- Players join the halves in notebook order: Ravabulle, then Troncadelle. Lowercase letters only.

### Design intent

- The voice work is **describing a sung vowel**: pitch contour and length, not charades.
- Troncadelle’s icons are the spoken payoff (type and desire), not a second cipher.
- Replay-friendly: sound never runs ahead of the player, and a wrong strip or a wrong offering does not wipe earlier work.

### Open questions

- [ ] Final illustrated icons replace the placeholder silhouettes. Captions can stay until the art is readable on its own.
- [ ] Whether a later version should allow a desire that spans more than one category. The prototype uses exactly one category per spirit.

---

## Twin Apothecary

### One-line pitch

Two apothecaries share one **ridiculous patient**: one sees **symptoms and reactions**, the other owns the **lab** with cryptically labelled jars. Together they deduce a **prescription** per visit — no twitchy crafting.

### Fantasy & tone

Whimsical anatomy (jelly beast, moss knight, clockwork bird). Humour in side effects; mood is “gentle clinic”, not emergency room.

### Co-op split

| Player | Screen | Notebook |
|--------|--------|----------|
| **Bedside** | Animated **patient**, symptom checklist that updates when the lab sends a dose | **Folk ↔ scholarly** name table, icon legend for “what worsens what” |
| **Lab** | **Shelves** of ingredients (symbols + long names), a **prescription pad** with slots: morning / noon / evening (or 3–5 dose lines) | Same name table from the other script angle, **contraindication** hints as riddles |

Neither screen shows the partner’s full ingredient list labels in plain form if names are the puzzle — bedside might see effects as colours/icons only.

### On-screen UI (HTML scope)

- **Bedside page:** large **patient illustration** (one layer stack or a few CSS states: `data-mood`, symptom icons as a `<ul>`); **visit tabs** or prev/next for each patient.
- **Lab page:** **jar grid** (fixed slots, click or DnD jar icon into **3–5 dose slots** on a prescription pad); jar labels visible only on lab side.
- **“Send dose”** (or auto-apply on fill): bedside runs a short CSS animation / swaps sprite — no minigame timer.
- **Validate all visits** when every pad is complete; silent until correct.

### Co-op flow

1. Read the **visit card** (patient name + chief complaint flavour text).
2. Bedside describes **visible symptoms** (animation + vitals as icons, not numbers racing).
3. Lab proposes ingredients; bedside **applies** or the lab “sends” dose — patient reacts (silent wrong, subtle wrong, obvious wrong — tune for kindness).
4. Iterate until the visit stabilizes; move to next patient in the **day book**.
5. Five to eight visits per chapter; players can reopen past visits freely.

### Instance variation

- Which **ingredients** are decoys on the shelf.
- Patient roster and which **letter** each cured patient contributes.
- Symptom animations randomized among a species template.

### Win condition & password

- All visits **stable** → patients line up for a **group photo**; markings (spots, stripes, bandages) encode **letters** per player (different encoding, same word when notebook order is applied).
- Or: prescription pad footer prints **password half** in dose order.

### Design intent

- **Logic + communication**: “when we added X, the shimmer stopped” — classic co-op deduction.
- No real-time stirring; at most **select / assign** ingredients to time slots.
- Notebook stays a **dictionary** players skim together on voice.

### Open questions

- [ ] Single patient revisited vs roster of distinct patients.
- [ ] Whether bedside or lab “commits” the final prescription click.
- [ ] Physical prop: sticker **herb stamps** in notebook vs all-digital.

---

## Elevator of Unlikely Floors

### One-line pitch

An art-deco tower whose floors are **rooms**, not numbers. One player holds the **passenger manifest**; the other operates an **elevator** with symbolic buttons. Together they reconstruct the **only route** that satisfies every rider’s absurd request.

### Fantasy & tone

Dry wit, European comic sensibility. Elevator music optional; **no time limit**. Wrong stops might open doors on silly empty scenes — informative, not punishing.

### Co-op split

| Player | Screen | Notebook |
|--------|--------|----------|
| **Lobby clerk** | **Manifest**: riders, props, mumbled destination hints, boarding order | **Floor glyph** stickers: symbol → room name |
| **Operator** | **Cab panel**: unlabeled buttons that show **symbols** when lit; floor indicator as icon | Same glyph sheet (different art border per edition colour) |

Clerk does not see which symbol lights which room on first play; operator does not see rider names unless read aloud.

### On-screen UI (HTML scope)

- **Clerk page:** scrollable **manifest** (`<article>` per rider or paginated cards); optional checkbox “done discussing” per rider (cosmetic).
- **Operator page:** **symbol buttons** (grid, `aria-pressed` when added to queue); **ordered list** of stops (sortable or remove buttons); **“Run ride”** advances one stop at a time — each step shows a **static door illustration** + one line of log text (`aria-live`), not a moving cab.
- Penthouse: full-width **mural image** with letter tiles revealed on success.

### Co-op flow

1. Clerk reads the **day’s manifest** chunk by chunk (or one rider at a time).
2. Operator builds a **stop queue** (symbol A → symbol C → …) via clicks or sortable list.
3. **Step simulation** with an explicit **Next stop** button: each step updates log text and a still image — not real-time travel.
4. Adjust queue until **all riders satisfied**; manifest may contain **red herring** lines (visitors who never board).
5. Final stop: **penthouse** or **roof garden** opens two different murals.

### Instance variation

- Rider set and boarding order.
- Symbol set drawn from a larger glyph pool.
- Clerk’s manifest **paragraph order** ≠ operator’s button layout order.

### Win condition & password

- Correct sequence → murals show **mosaic letters** (each player sees half the tiles or half the word).
- Notebook margin notes **reading order** (e.g. clerk top-to-bottom, operator left mural then right).

### Design intent

- **Pure sequencing puzzle** with narrative colour — no dexterity.
- Encourages **careful re-reading** of the manifest aloud.
- Strong notebook **sticker / glyph** physicality without CADENIGME1 scissors gimmick.

### Open questions

- [ ] Max stops per puzzle (10–15 clicks).
- [ ] Whether simulation is step-by-step story text or animated doors only.
- [ ] Rav vs Tron: clerk vs operator assignment fixed or swappable per chapter.

---

## Archive of Lost Gestures

### One-line pitch

Anthropologists rebuild a **dead sign language** from silent films. One player watches **hand loops**; the other picks **pose cards** from a fixed library. Match clip ID to pose ID, then assemble grammar from the notebook.

### Fantasy & tone

Academic adventure, respectful whimsy (invented language, not mocking real Deaf culture). Calm pacing; clips loop until paused.

### Co-op split

| Player | Screen | Notebook |
|--------|--------|----------|
| **Archivist** | **Film reel** UI: short loops (hands / forearms only), clip ID per reel | **Grammar sheet**: order of morphemes, numbered pose thumbnails **without** full solution text |
| **Sculptor** | **Pose library** (grid of illustrated hand poses) + **match slots** (one slot per clip ID) | **Descriptor cheat sheet** (shared vocabulary: “cup hand”, “hook index”, “palms facing”) |

Archivist cannot export frames; sculptor cannot see films. Loops: short **video** or **GIF** in a `<video>` / `<img>` carousel — no 3D rig.

### On-screen UI (HTML scope)

- **Archivist:** list of clips; preview pane; optional **catalogue table** (dropdown or second DnD: assign clip → pose number once partner agrees).
- **Sculptor:** **pose chips** (PNG) in a pool; **drop targets** per catalogue row — same interaction family as Aliens & hats object box + slots.
- **Grammar finale:** second small grid — order pose numbers with a **sortable list** or numbered slots (3–4 morphemes).

### Co-op flow

1. Archivist describes a clip using **shared vocabulary** from the notebook (players may add household analogies).
2. Sculptor selects or drags the matching **pose chip** into the slot; both confirm aloud.
3. Archivist records the pairing on their catalogue if their UI mirrors the same IDs.
4. After N matches, **grammar** section: sort pose IDs into the order required by notebook rules.
5. Optional: two clips differ only slightly — rewards **precise** finger detail in voice.

### Instance variation

- Which clips appear; which pose IDs are correct pairings.
- Page order of catalogue rows per player → password letter order.

### Win condition & password

- Catalogue complete and grammar puzzles solved → **coat-of-arms** tiles unlock letters.
- Wrong pairings: tiles stay blank; no timer.

### Design intent

- Deep **description** skill like Aliens & hats, different domain.
- UI is **pose presets + fine tweaks**, not motion capture or timed mimicry.
- Notebook vocabulary reduces ambiguous “left/right” without a webcam.

### Open questions

- [ ] Pose count in library vs number of clips (keep pool scrollable in ~⅓ column like Aliens & hats).
- [ ] Number of clips (8–10) vs grammar layer depth.
- [ ] Cultural sensitivity review before art direction locks.

---

## The Split Symphony (conductor / engineer)

### One-line pitch

The hall lost power mid-rehearsal. The **conductor** holds a **score with gaps**; the **engineer** has **isolated stems** (strings, brass, percussion…). Align order and layering until the **silhouette** matches the target — all at conversation pace.

### Fantasy & tone

Warm concert-hall drama. No “start the concert in 60s”. Players audition combinations, discuss timbre in plain language.

### Co-op split

| Player | Screen | Notebook |
|--------|--------|----------|
| **Conductor** | **Score**: measures with missing instrument icons, tempo mark as **static** BPM (reference only), target **shape** sketch at bottom | **Instrument nicknames** (what the engineer’s labels mean), measure numbers |
| **Engineer** | **Stem lanes**: reorder short loops, mute/solo, no live keyboard performance | Same nickname table + **colour code** for stems |

Conductor does not hear stems unless engineer plays them (engineer clicks play — not simultaneous stress test).

### On-screen UI (HTML scope)

- **Conductor:** static **score image** or HTML table of measures with **icon gaps**; reference **target silhouette** (PNG); no playback on this page.
- **Engineer:** **sortable track list** (jQuery UI sortable or up/down buttons) + per-track **Play** + **mute** toggles; optional simple **level bars** (decorative PNG, not live analyser required).
- **Lock movement** button per section; global validate when all locked.
- Same audio pattern as CADENIGME1 music puzzles: one `Audio` object per stem, reset `currentTime` on play.

### Co-op flow

1. Pick a **movement** (3–4 movements = 3–4 password chunks or one long word).
2. Engineer plays lanes one-by-one; conductor says “measure 12 wants brass, not woodwind”.
3. Engineer sets **order of entries** (drag bars) and **which lanes active** per section.
4. **Compare** to target waveform / silhouette (visual match, not rhythm game).
5. Lock movement when both agree; validation silent until all movements locked.

### Instance variation

- Stem assignments and decoy lanes.
- Score gap pattern per seed.
- Conductor measure numbering permuted vs engineer’s lane list order.

### Win condition & password

- All movements match → **programme dedications** reveal letters on each screen.
- Optional: final **unison** play button for satisfaction (cosmetic).

### Design intent

- Audio-rich but **turn-based**: play, discuss, adjust.
- Distinct from CADENIGME1 tape-reorder: here the puzzle is **who hears the score vs who hears the parts**.
- Accessible path: strong **visual silhouette** match even if hearing impaired player relies on partner description.

### Open questions

- [ ] Length of loops (keep files small for USB).
- [ ] Whether movements are independent or one continuous piece.
- [ ] Captioning / visual-only mode for engineer-described spectra.

---

## The Two Switchboards

### One-line pitch

A vintage hotel’s wiring was split between two maintenance closets: one clerk sees **which guest room needs power**, the other holds the **plugs** — but neither sees the full map until they talk.

### Fantasy & tone

Gentle bureaucratic mystery, brass and wood veneer. Wrong plugs might blink a hallway lamp off (cosmetic); no sparks, no timers.

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Panel A** (role TBD) | **Socket board**: numbered holes in a fixed grid, each row labelled with a **glyph** only (no room name) | **Room directory**: glyph → guest room name / floor |
| **Panel B** | **Plug tray**: draggable plugs (colour band + second glyph); empty sockets mirror Panel A’s layout **without** row glyphs visible on B | Same directory from the other column order, plus **wire colour** legend |

Panel A does not see plug art; Panel B does not see which glyph sits on which socket until A reads it aloud.

### On-screen UI (HTML scope)

- Split layout: **~⅓ plug pool** / **~⅔ socket board** (mirror Aliens & hats proportions).
- Sockets = drop targets; one plug per socket; plugs return to pool on drag-out.
- **Validate** when all sockets filled; silent fail; optional `aria-live` “panel humming” on success only.
- Row **indicator lamps** (CSS `data-lit`) — decorative until solve, then reveal letter strip under each lit row.

### Co-op flow

1. A reads socket **position + glyph** row by row; B finds matching room meaning in notebook.
2. B describes plug **colour and mark**; A confirms which row needs that wire.
3. B places plugs; A confirms “row 3 feels warm” (flavour) when row matches internal check — or wait for full validate.
4. Iterate at leisure; reorder plugs freely.

### Instance variation

- Permutation of glyph ↔ room mapping (notebook static, instance swaps which glyph is on which row).
- Decoy plugs in tray (more plugs than sockets).
- Row order for password letters differs per player (`row_order_rav` / `row_order_tron`).

### Win condition & password

- All sockets correct → lamps animate on → **letter row** per player (half-password or shared word built from combined halves).
- Lowercase letters only per product rules.

### Design intent

- Pure **CADENIGME pairing**: symbolic cross-reference + physical placement.
- No spatial navigation — one board, one tray.

### Open questions

- [ ] Grid size (e.g. 8 rows × 1 plug vs 4×2).
- [ ] Rav vs Tron: who holds glyphs on sockets vs plugs.
- [ ] Keyboard: “move plug to socket N” menu.

---

## Postcard Wall

### One-line pitch

A travel club archives **postcards** and **captions** in two different drawers. Reunite each photo with its text by describing stamps, skies, and odd details — never showing the partner the full card.

### Fantasy & tone

Nostalgic, slightly absurd destinations (“Lake of Quiet Keys”). Flipping a postcard is a button, not a 3D rack.

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Collector** | **Postcard rack**: fixed slots; each card shows **photo side**; button **flip** reveals **postmark code** (letters/digits as symbols, not the password) | **Postmark glossary** + reading order for final line |
| **Typist** | **Caption pool** (shuffled phrases) + **empty slots** under slot numbers | Same glossary; optional **destination nicknames** |

Collector never sees caption text; typist never sees photos.

### On-screen UI (HTML scope)

- Rack: 8–10 slots, one postcard image per slot (front); flip toggles `data-face` and swaps image or CSS layer.
- Typist: DnD caption chips into numbered slots; pool scrolls in side column.
- Validate when all slots filled.

### Co-op flow

1. Pick slot index; collector describes picture and, if needed, flipped postmark.
2. Typist reads candidate captions aloud; both narrow down; place chip.
3. Repeat; revisit slots anytime.

### Instance variation

- Which caption belongs to which slot (seed).
- Display order of slots on typist vs collector.
- Decoy captions in pool.

### Win condition & password

- Correct pairing → postcards **align** in rack (CSS); postmark codes read in notebook order spell **password material** (or each player gets a half-string).

### Design intent

- **Description-heavy**, zero action — cousin to Aliens & hats “describe the B&W half”.
- Flip button is accessible (`aria-pressed`).

### Open questions

- [ ] Whether postmark codes are puzzle step or only flavour.
- [ ] French postcard copy vs symbol-heavy captions for a11y.

---

## Weaver’s Loom

### One-line pitch

A guild keeps **pattern books** and **looms** in separate workshops. One weaver sees the **finished motif**; the other **clicks threads** on a blank grid until both patterns match.

### Fantasy & tone

Craft fair calm; soft colour palette. Wrong patterns stay silent — no unravel animation required (optional gentle shake on validate fail).

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Pattern keeper** | **Reference grid** (read-only): small woven pattern using **thread symbols** (not colour names in DOM if puzzle — use icons) | **Symbol → colour name** wheel or table |
| **Weaver** | **Editable grid**: click cell cycles through thread palette (3–5 symbols) | Same symbol table (other script border) |

Keeper cannot touch loom; weaver cannot see reference grid.

### On-screen UI (HTML scope)

- Fixed grid e.g. 6×6 or 8×8; cells are `<button>` with `data-thread="0..n"` and background from CSS.
- Keeper may open a **larger static view** of the same reference grid (modal PNG).
- **Weaver** has the only **Validate** control; both clients share the same instance (seed). Keeper’s pattern is generated from that instance for read-aloud; weaver must match it cell-for-cell.
- On success, keeper sees letters on the reference frame border; weaver sees letters on the loom frame (order may differ per role).

### Co-op flow

1. Keeper reads pattern **row by row** (“row 1: sun, sun, leaf, …”) using notebook names.
2. Weaver sets cells; reads back rows for confirmation.
3. Validate when satisfied; no step limit.

### Instance variation

- Pattern generated from seed (symmetry optional).
- Palette size fixed; motif complexity capped for voice.

### Win condition & password

- Weaver grid matches → **border threads** on loom illustration reveal letters (per-player order).

### Design intent

- **Grid logic** without chess or combat; click-only interaction.
- Strong co-op readback reduces mis-click frustration.

### Open questions

- [ ] Grid dimensions for one sitting.
- [ ] Dual validate vs weaver-only validate.
- [ ] Colourblind-safe symbols (required).

---

## Stamp & Register

### One-line pitch

The town hall split duties: one desk **files requests**, the other **stamps them** — but the stamp drawer and the ledger use different codes.

### Fantasy & tone

Dry humour, paperwork stacks. Stamps make a satisfying thud sound (optional, non-critical).

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Clerk** | **Ledger table**: rows with applicant symbol, date icon, **empty stamp cell** | **Stamp code → meaning** (approval, delay, archive…) |
| **Registrar** | **Stamp tray** + same row count **drop targets** (or single ledger with stamp slots) | **Meaning → allowed row types** rules |

Clerk sees row content; registrar sees stamp shapes; neither sees full solution on the other’s terms without voice.

### On-screen UI (HTML scope)

- Table: 8–12 rows; stamp cell = drop target.
- Stamp tray: 6–10 icons, infinite use or one stamp per type — prefer **one stamp per row** (unique assignment puzzle).
- Validate all rows stamped.

### Co-op flow

1. Clerk reads row **icons and flavour text** (short).
2. Registrar proposes stamp; clerk confirms against rules in notebook.
3. Place stamp; next row.

### Instance variation

- Which stamp per row (seed).
- Row order permuted on clerk vs registrar view.
- Decoy stamps.

### Win condition & password

- Correct → stamp ink shows **letter** in margin per row; modal half-password.

### Design intent

- Classification puzzle — slower than levers, richer than binary toggles.
- Familiar DnD stamp metaphor.

### Open questions

- [ ] Unique stamps vs reusable stamps with repetition.
- [ ] Whether clerk rows include red herrings.

---

## Bird Log (dawn chorus)

### One-line pitch

Ornithologists compile a **dawn chorus log**: one researcher **listens** in the field; the other **writes species** into the journal from description alone.

### Fantasy & tone

Morning calm, watercolour birds. Lighter than Ghost Dictaphone — clips are short, clear, replayable.

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Listener** | **Perch list**: select observation # → play `<audio>` (one bird per clip) | **Habitat icons** + **call adjectives** (not species names) |
| **Naturalist** | **Field guide grid** (illustrated birds, no audio) + **log slots** per observation | **Habitat → likely species family** hints only |

Naturalist has no audio element; listener has no species names in UI (only “Observation 3”).

### On-screen UI (HTML scope)

- Listener: vertical observation buttons + single audio player.
- Naturalist: scrollable bird pool + log column with DnD or “assign species” per row.
- Validate when log complete.

### Co-op flow

1. Open observation index; listener plays clip multiple times.
2. Describe rhythm, pitch contour, repeated notes — notebook adjectives help.
3. Naturalist picks bird; both move on.
4. Optional cross-check: naturalist reads **wing pattern** from art; listener confirms “not the striped one”.

### Instance variation

- Clip ↔ species mapping from seed.
- Observation order on log vs perch list.
- Decoy species in guide.

### Win condition & password

- Correct log → **migration map** footer prints letters along route (static PNG + text).

### Design intent

- Audio co-op without transcript puzzle — different from Dictaphone’s phrase bank.
- Illustrations do the visual heavy lifting.

### Open questions

- [ ] Clip count (6–8 vs 10).
- [ ] Real bird recordings vs fictional calls (legal/licensing).
- [ ] French species names vs Latin symbols in HTML.

---

## Costume Call

### One-line pitch

Opening night, the **script** and **wardrobe** were delivered to different dressing rooms. Match symbolic roles to costumes before the curtain rises — slowly.

### Fantasy & tone

Theatre farce, warm lighting. Roles are **symbols** (like Aliens & hats tags); costumes are visual.

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Director** | **Script booklet** UI: pages with **role symbols** and line count / scene hints (no costume images) | **Symbol → character name** wheel |
| **Wardrobe** | **Costume tiles** (pool) + **role slots** (symbols on slots) | Same wheel (other script) + **fabric glossary** |

Director does not see costumes; wardrobe does not see scene hints (optional flavour lines only on director side).

### On-screen UI (HTML scope)

- Wardrobe: DnD costumes onto ~8–10 role slots; pool ~12 with decoys.
- Director: paginated script pages (prev/next); no drag — read-only.
- Validate on wardrobe when all slots filled (or both validate local copy — wardrobe is authoritative for placement).

### Co-op flow

1. Director reads **symbol + scene clue** (“appears in act 2 crowd”).
2. Wardrobe describes **silhouette, hat, trim**; director maps to name via wheel.
3. Place costume; flip to next role.

### Instance variation

- Role ↔ costume mapping (seed).
- Slot order on wardrobe vs script page order on director.
- Decoy costumes.

### Win condition & password

- Success → **curtain** image rises; props on stage hold **letter cards**.

### Design intent

- Direct structural parallel to Aliens & hats (symbol pairing + describe visual half).
- Theatre theme variety.

### Open questions

- [ ] Fixed Rav = director or alternate per edition.
- [ ] Number of acts / pages vs one flat list.

---

## Telegraph Bench

### One-line pitch

A museum restores a **telegraph desk**: one volunteer **listens** to archived dots and dashes; the other **taps** the key into a ledger — same message, two senses.

### Fantasy & tone

Historical, meditative. Clips are **slow**; player controls replay. No speed contest.

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Ear** | **Message list** + play `<audio>` per message (Morse-like tones) | **Grouping table**: how many letters per word, message order |
| **Hand** | **Tap key** button (dot/dash mode toggle or two buttons) + **buffer display** + assign buffer to message slot | **Alphabet strip** (optional morse chart — partial, not full solution) |

Hand has no audio; ear has no buffer.

### On-screen UI (HTML scope)

- Hand: `·` and `—` append to buffer; backspace; “clear”; drop buffer into one of N message slots.
- Ear: play/pause only.
- Validate when all message slots filled (compare to instance encoding).

### Co-op flow

1. Ear plays message; vocally groups dots (“first letter is…”) without saying Latin letters if puzzle forbids — or spells aloud once Hand has draft.
2. Hand taps; reads buffer back; ear confirms.
3. Commit to slot; next message.

### Instance variation

- Message texts from seed (short words).
- Audio timing per message.
- Slot order per player for password.

### Win condition & password

- Correct → **tape reel** label prints letters; half per player.

### Design intent

- Minimal DOM — good “small chapter” candidate.
- Optional link to CADENIGME1 lever/binary vibes without copying.

### Open questions

- [ ] Letters revealed aloud vs Hand decodes from chart.
- [ ] Number of messages (4–6).
- [ ] a11y: visual pulse on ear side synced to audio (decorative, not required for solve).

---

## Exhibit Placards

### One-line pitch

Museum storage holds **objects**; the archive holds **labels** that fell off the shelf. Pair them using era clues and careful description.

### Fantasy & tone

Curator documentary calm. Photos are well-lit PNGs on shelves — no walkable gallery.

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Storage** | **Shelf grid** of numbered object photos | **Era table** (icon → century / collection) |
| **Archive** | Shuffled **placard texts** (no numbers) + **number slots** | Same era table + **material keywords** |

Storage sees no placard prose; archive sees no photos.

### On-screen UI (HTML scope)

- Archive: DnD text cards onto slots 1…N.
- Storage: click photo to enlarge in modal (optional); numbers fixed.
- Validate when all slots assigned.

### Co-op flow

1. Storage describes **shape, material, damage, colour**.
2. Archive reads placard candidates; both use era notebook to narrow.
3. Assign text to number; continue.

### Instance variation

- Permutation text ↔ object id.
- Decoy placards.
- Reading order for accession line.

### Win condition & password

- Solve → **accession footer** on archive screen; storage sees **shelf LED** numbers spelling complementary half.

### Design intent

- Text + image co-op without video or 3D.
- Similar to v1 gallery/simon DNA but label-first.

### Open questions

- [ ] Object count vs placard length (reading fatigue).
- [ ] Modal enlarge required for a11y alt text strategy.

---

## Partitioned Hymn (no audio)

### One-line pitch

A choir’s **lyrics** and **chords** were photocopied on different paper. Rebuild the hymn by matching metre and rhyme — **no audio files**.

### Fantasy & tone

Chapel quiet; Sunday morning. Symbols instead of full verses in HTML if passwords must stay off DOM — notebook supplies names.

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Cantor** | **Lyrics**: verses with **blank symbols**; verse metadata (syllable count, rhyme scheme ABAB) | **Saint / feast name** key if symbols map to themes |
| **Organist** | **Chord rows** (labelled A, B, C…) with progressions only | **Metre chart** (4/4, 3/4) per row |

Neither sees the other’s full sheet content without reading aloud.

### On-screen UI (HTML scope)

- Organist: dropdown or DnD to assign **chord row → verse slot** (6–8 verses).
- Cantor: read-only verses; optional highlight when partner marks assignment locally (skip — no sync; purely voice).
- Validate on organist (or both independently with same instance).

### Co-op flow

1. Cantor reads verse aloud, counts syllables, notes rhyme.
2. Organist reads chord row characteristics (“starts minor, four bars”).
3. Match pairs; assign; review all before validate.

### Instance variation

- Verse ↔ row mapping from seed.
- Decoy chord rows.

### Win condition & password

- Correct → **hymn number** footer and **initial letters** of assigned rows spell password pieces.

### Design intent

- Split Symphony cooperation **without** USB audio weight.
- Literacy and listening only.

### Open questions

- [ ] French hymn flavour vs nonsense Latin (product tone).
- [ ] Music theory depth (keep layman-friendly).

---

## Pinboard Alibi

### One-line pitch

Detectives pin **where** photos were taken; witnesses place **who** was on the **train timeline**. Cross the two stories to find the one consistent alibi chain.

### Fantasy & tone

Cozy mystery, cork board aesthetic. No chase scenes — just thinking.

### Co-op split (voice-only)

| Player | Screen | Notebook |
|--------|--------|----------|
| **Detective** | **Polaroids** on fixed pins (location art + pin label A–F) | **Timetable** static print: train stops ↔ times |
| **Witness** | **Time slots** (ordered) + **suspect chips** (portraits) | Same timetable + **suspect nicknames** |

Detective does not see suspects; witness does not see location photos.

### On-screen UI (HTML scope)

- **Detective:** fixed **polaroids** on cork board; each photo has a **time dropdown** (or slot buttons) — “this picture was taken at which run?”
- **Witness:** ordered **time slots** with **suspect drop targets** (DnD chips).
- **Validate** on each page when local board is complete; silent check against shared instance `(time → location, time → suspect)`.
- On success: SVG **string lights** between pins fade in (CSS); letter readout in footer.

### Co-op flow

1. Witness reads times; detective reads locations on photos.
2. Use timetable: “the 10:15 stop is the harbour.”
3. Place suspect and time-on-photo; align stories.
4. Validate.

### Instance variation

- Truth table from seed.
- Display order of times vs photos.

### Win condition & password

- Correct → **string lights** between pins (CSS) trace letters; witness card shows complementary letters.

### Design intent

- Logic puzzle; two assignment UIs, no animation beyond lights.
- Notebook timetable is the shared anchor.

### Open questions

- [ ] Suspect count vs time slots.
- [ ] Red herring polaroids.
- [ ] Single combined password vs halves.

---

## Additional candidates (simple HTML)

The ten concepts above are fully specified for implementation scoping. New ideas should be added here as **short pitches** until expanded to the same section template, then moved into the [index](#index-this-pool).

---

## Using this document

- **Authors:** expand one section into a full chapter brief (notebook spreads + asset list) before DEV folder work under `CADENIGME2/`.
- **Agents:** when implementing, copy structure from Aliens & hats (instance shape, `password_half_*`, silent validation) into a puzzle-specific implementation guide.
- **Sequencing:** chapter order and archive numbers remain TBD in [`CADENIGME2-DESIGN.md`](CADENIGME2-DESIGN.md).

When an idea graduates to active development, add a row to the puzzle index there and optionally move detailed specs out of this pool file to avoid duplication.
