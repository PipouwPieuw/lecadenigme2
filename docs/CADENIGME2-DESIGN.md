# CADENIGME2 — design notes (for agents & authors)

Living document for **v2 puzzle concepts**, mechanics, physical props, and open questions. Player-facing rules and password format remain aligned with [`CADENIGME-PRODUCT.md`](CADENIGME-PRODUCT.md).

**Do not** paste final passwords or full solutions here unless the task explicitly requires it; use a separate spoiler doc or the roadmap equivalent when one exists.

---

## Session constraints (v2 — global)

These apply to **all** CADENIGME2 puzzles unless a specific puzzle doc says otherwise:

- Players are **not** in the same room and **cannot** see each other’s screens.
- There is **no** live link between the two HTML pages (no shared state, sync, or multiplayer backend).
- Progress and rewards are **per player, per device**: each side validates locally and reveals information only on that screen.
- Cooperation is **voice only** (call / headset): describe, listen, coordinate — no screen share, photos, or file transfer of puzzle content.

Design and implementation must assume partners only know what is said aloud plus what is in **their** notebook and **their** USB archive.

**Delivery:** each chapter is **one HTML page per player** (plus `assets/`), same as CADENIGME1 — buttons, toggles, DnD/sortable lists, short audio, CSS animation; not 3D navigation or action gameplay. Candidate concepts must respect this — see [`CADENIGME2-PUZZLE-IDEAS.md`](CADENIGME2-PUZZLE-IDEAS.md) (implementation scope).

*(When **hosted play** with a shared session ships, chapter links and **per-game puzzle instances** will come from the session document — see [`TODO-shared-progression.md`](TODO-shared-progression.md). Voice-only and asymmetric DOM rules still apply.)*

---

## Viewport & layout (v2 — all puzzles)

- Puzzles should use the **full viewport** as the playfield: **no page scroll** for the main puzzle UI under normal play (typical laptop/desktop browser, landscape or portrait).
- Use a **single root layout** (`100dvh` / `100vh` height, `overflow: hidden` on `body` or main shell) and manage overflow **inside** regions if needed (e.g. object box scroll) — avoid document-level scrolling.
- **Exceptions** must be deliberate (e.g. post-game credits, accessibility “skip to content”, or a dedicated rules panel) — not the default puzzle chrome.
- **Resize:** content should scale or reflow within the viewport; if a minimum size is required, show a clear message rather than breaking layout silently.
- Engineering details: [`.cursor/rules/02-html-css-js-style.mdc`](../.cursor/rules/02-html-css-js-style.mdc) (CSS → Viewport).

---

## Per-game variation (procedural instances)

**Intent:** Every **new game** (new session / room) should feel **unique**. Puzzles that support it draw from authored **pools** (assets, name lists, layouts) and **randomise on initialisation** — alien lineup, hat assignment, name draw, etc.

**Hard rule — one game, one truth:** For a given session, **Ravabulle and Troncadelle must receive the same underlying instance**. Randomisation runs **once** when the game is created (or once per chapter when that chapter is first unlocked — TBD per puzzle). Both clients render **different UIs** from the **same** instance data (or the same **seed** + shared deterministic generator).

| Concern | Approach |
|---------|----------|
| Who generates? | Prefer **session creator** writes instance to the session store, or an **Edge Function** on “create game” — avoid two clients rolling different RNG. |
| What is stored? | Either a **`seed`** (integer/string) + fixed generator version, or a full **`instances`** JSON blob per chapter. |
| Partner secrets | Instance may contain the full mapping; each HTML page must still **only display** that player’s half. Do not rely on players never opening DevTools — design for co-op trust, but avoid putting the partner’s visuals in the DOM. |
| Static puzzles | Chapters with fixed narrative need no instance; omit or use a constant default. |
| Passwords | Chapter passwords may be **derived** from the instance (e.g. hash of correct placements) or generated with the instance and checked server-side — see progression TODO. |
| Notebooks | Physical print is **session-agnostic** (translation wheel, generic instructions). Session-specific guest names are **digital + voice**, not reprinted per run. |

### Aliens & hats — instance shape (v2)

- **10 canonical guests** — each with a **name** drawn from the `guests` list in `data/catalog.json`, unique **alien** species (each `alien1`…`alien10` once), unique **hat** in book (`hat01`…`hat16`, 10 used), **variant** `1`…`5`, **`species_name`** (one label drawn from that species’ `names` array) / **`species_description`**, **`species_code`** + **`species_tag_art`** (`tag04`–`tag06`), **`name_code`** + **`name_tag_art`** (`tag01`–`tag03`), **`letter_rav`** / **`letter_tron`** (password glyphs). Until the hand-drawn symbols exist, the tags show the Latin species name and guest name (`SHOW_PLAIN_LABELS` in the puzzle script).
- **`rav_page_order`** / **`tron_page_order`** — the **same** permutation of `guest_id`. Page 1 on both books is the same guest, so the B&W alien and the B&W hat can be paired before the dossiers appear.
- **`password_half_rav`** / **`password_half_tron`** — 10 lowercase letters each, read in **that player’s page order** (not the same string).
- Tag art may repeat inside its set; the generator uses each of `tag01`…`tag03` and each of `tag04`…`tag06` at least once.
- Implementation: [`puzzles/AliensAndHats/ALIENS-AND-HATS-IMPLEMENTATION.md`](../puzzles/AliensAndHats/ALIENS-AND-HATS-IMPLEMENTATION.md).

---

## Puzzle index (draft)

| # (TBD) | Working title | Status | DEV / assets path |
|---------|---------------|--------|-------------------|
| — | **Aliens & hats** | Concept + assets | `puzzles/AliensAndHats/` |

**Candidate chapters** (calm co-op, not sequenced): [`CADENIGME2-PUZZLE-IDEAS.md`](CADENIGME2-PUZZLE-IDEAS.md).

Sequence, archive numbering, and notebook chapters for v2 are **not fixed** yet.

---

## Puzzle: Aliens & hats (working title)

### One-line pitch

Two guest books, **one guest per open spread**, in the **same page order** on both sides. The left page is the portrait. The right page is a dossier: species tag, shared description, name tag. **Ravabulle** adds **colored hats** to B&W aliens and types the guest **name**. **Troncadelle** adds **colored aliens** and types the **species** name. Players describe the coded labels to each other; the Latin words are not printed on the page that must type them.

### Co-op flow

1. **Pair spreads** by reading the shared species description (and, when the wheels exist, by translating codes).
2. **Species:** Ravabulle reads the species code. Troncadelle types the species name.
3. **Name:** Troncadelle reads the name code. Ravabulle types the guest name.
4. **Tron → Rav:** describe the B&W **hat** → Rav places the matching **colored hat** (16 in pool, 6 decoys).
5. **Rav → Tron:** describe the B&W **alien** (species + variant) → Tron places the matching **colored alien** (50 in pool).

### Co-op split (voice-only)

| Player | Pool | Left page | Right page shows | Player types |
|--------|------|-----------|------------------|--------------|
| **Ravabulle** | 16 **hats** (all; 10 used in solution) | B&W **alien** + hat slot | Species **code** (`tag04`–`tag06`), description, empty name tag (`tag01`–`tag03`) | Guest **name** |
| **Troncadelle** | 50 **aliens** (10×5 variants) | B&W **hat** + alien slot | Empty species tag, description, name **code** | **Species** name |

Tags are **not** draggable. The species name is not in Ravabulle’s page text. The guest name is not in Troncadelle’s page text. Descriptions are the same on both sides. Symbol strings are seed-generated; a printed wheel only matches one seed.

### Screen layout (both sides, same structure)

Follow **Viewport & layout (v2 — all puzzles)** above (no document scroll).

**Horizontal split (desktop-first):**

| Region | Width | Role |
|--------|-------|------|
| **Object box** (grabables) | **~⅓** of viewport | Hats or name tags; free-form drag-and-drop (no fixed grid). Items can stay in the box or move to the book. |
| **Book area** | **~⅔** of viewport | Cover closed or book open; this column is the book’s *stage*, not necessarily filled edge-to-edge. |

- The **book** is **centred** in the right-hand column (or aligned consistently) and **scaled to fit** the available height/width — it must **not** be forced to stretch to the full ⅔ if that would make spreads illegible or taller than the viewport.
- **Book cover** — click opens the book **inline** in the book area (no full-screen overlay); the object box stays usable. Leaving through the last page shows the same cover mirrored. Arrow keys turn pages; at the first page Left closes to the front cover, and at the last page Right closes to the mirrored cover.
- **Pages** — **10 double-page spreads** (one guest each). Turn pages while the pool remains available. One **placement slot** on the **left** page (hat or alien). The **left page** is the drop target; the item **snaps** to the slot. The right page does not accept drops.
- **Left page** — portrait only, in the same place as before the tag was removed (the old tag band stays empty). Rav: B&W alien with hat slot on the head. Tron: B&W hat with alien slot in the body.
- **Right page** — blank until every portrait is correct. Then the open page animates in (species tag from above, description from the right, name tag from below) and the other pages show the same content. Species tag at the top, species description in the middle, name tag at the bottom. The empty tag is a text field on the sprite.

**Narrow viewports:** may stack object box above book (still no page scroll) or reduce grabable size — exact breakpoint TBD at implementation; preserve ~⅓ / ⅔ intent where possible.

### Physical components

| Component | Role |
|-----------|------|
| **Translation wheels** (one per notebook, still physical) | Map Rav-script species codes and Tron-script name codes to the Latin words players type |
| **Notebook** (per player) | TBD: wheel instructions, alien roster, flavour; must not duplicate the partner’s secret layout |

### Win condition & password

- **Step 1:** each player fills **10** slots. **Validation:** every slot filled → check against the instance; **silent** if wrong. When all 10 are correct, the right-hand pages appear.
- **Step 2:** each player fills **10** text fields (Ravabulle: guest names; Troncadelle: species names). The password appears only when those words match **and** the placements are still correct. A wrong word stays silent; items and text remain.
- **Correct:** both pages of the current spread fade, then **one letter** appears centered on that spread. Other spreads already show their letter. Modal shows this player’s **10-letter half** (`password_half_rav` or `password_half_tron`). Halves **differ**; order follows **that player’s page order**. Lowercase a–z only.
- Partner’s half on their device under the same rules. Screens not linked.
- Combined password: both halves by voice for chapter gate (hosted progression).

### Implementation assets (repo)

Early art lives under `puzzles/AliensAndHats/assets/`:

| Folder | Contents (current) |
|--------|-------------------|
| `aliens/` | `alien1` … `alien10`, variants `-1` … `-5` per alien |
| `hats/` | `hat01` … `hat16` |
| `misc/` | `bookfront`, `bookopen`, `tag01` … `tag06` (more may be added) |

**Tags:** species codes use `tag04`–`tag06`; name codes use `tag01`–`tag03`. Strings are unique per species or guest; art may repeat inside its set (≥1 of each sprite in that set).

**Code:** `puzzles/AliensAndHats/` — `ravabulle.html`, `troncadelle.html`, shared `js/aliens-and-hats-core.js`, `data/catalog.json` for names and descriptions, `data/book-layout.json` for asset tuning.

### Interaction notes (for implementation)

- Drag-and-drop must be **keyboard-accessible** with clear drop targets (see `03-interactive-puzzles.mdc`).
- Do not expose partner-colored assets in the wrong role’s page DOM beyond co-op needs (Rav book has no colored hats pre-placed).
- **Drop rules:** wrong hat/alien allowed in the left-page slot. The right-hand page appears only when all 10 placements are correct. Wrong text is allowed after that. The password appears only when placements and all 10 fields are correct.
- **Same `seed`** (or shared session instance) required for both players until hosted sync ships.

### Open design questions

- [ ] Final guest names, species names, and descriptions (replace `data/catalog.json` placeholders).
- [ ] Notebook copy for wheels and pairing hints.
- [ ] Fine-tune `book-layout.json` per species.

### Design intent

- **Describe codes and the shared description** → type species and names → **describe hat / describe alien** → fill slots.
- **Same page order** pairs each B&W alien with the B&W hat before the dossiers appear. **Decoy hats** add description depth.
- **Layout data file** for author tuning without code changes.
