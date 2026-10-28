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

- **10 canonical guests** — each with unique **name** (author list + random assign), unique **alien** species (each `alien1`…`alien10` once), unique **hat** in book (`hat01`…`hat16`, 10 used), **variant** `1`…`5`, `tag_art`, **`tag_rav`** and **`tag_tron`** (two scripts, same name via wheels), **`letter_rav`** / **`letter_tron`** (password glyphs).
- **`rav_page_order`** / **`tron_page_order`** — permutations of `guest_id`; **different** between players.
- **`password_half_rav`** / **`password_half_tron`** — 10 lowercase letters each, read in **that player’s page order** (not the same string).
- Tag art: may repeat; generator ensures **at least one** of each `tag01`…`tag06` in the book.
- Implementation: [`CADENIGME2/AliensAndHats/ALIENS-AND-HATS-IMPLEMENTATION.md`](../CADENIGME2/AliensAndHats/ALIENS-AND-HATS-IMPLEMENTATION.md).

---

## Puzzle index (draft)

| # (TBD) | Working title | Status | DEV / assets path |
|---------|---------------|--------|-------------------|
| — | **Aliens & hats** | Concept + assets | `CADENIGME2/AliensAndHats/` |

**Candidate chapters** (calm co-op, not sequenced): [`CADENIGME2-PUZZLE-IDEAS.md`](CADENIGME2-PUZZLE-IDEAS.md).

Sequence, archive numbering, and notebook chapters for v2 are **not fixed** yet.

---

## Puzzle: Aliens & hats (working title)

### One-line pitch

Two guest books with **fixed symbol tags** (two languages) and **shuffled page order**. Each player places the partner’s half of the portrait: **Ravabulle** adds **colored hats** to pages that show B&W aliens; **Troncadelle** adds **colored aliens** (species + variant) to pages that show B&W hats. Wheels in the notebooks map tags to the same names so players can pair pages, then describe hats and aliens.

### Co-op flow

1. **Translate tags** (voice + physical wheels) → pair guests by **name**, not page number.
2. **Tron → Rav:** describe the B&W **hat** on Tron’s page for that name → Rav places the matching **colored hat** (16 in pool, 6 decoys).
3. **Rav → Tron:** describe the B&W **alien** on Rav’s page (species + variant) → Tron places the matching **colored alien** (50 in pool).

### Co-op split (voice-only)

| Player | Pool | Fixed on each page | Player fills | B&W in book |
|--------|------|-------------------|--------------|-------------|
| **Ravabulle** | 16 **hats** (all; 10 used in solution) | B&W **alien** + **tag** (Rav script) | **Hat** slot (colored) | Alien |
| **Troncadelle** | 50 **aliens** (10×5 variants) | B&W **hat** + **tag** (Tron script) | **Alien** slot (colored) | Hat |

Tags are **not** draggable. Names are **not** shown in Latin in the HTML (symbols only); wheels are **physical** (one script per notebook).

### Screen layout (both sides, same structure)

Follow **Viewport & layout (v2 — all puzzles)** above (no document scroll).

**Horizontal split (desktop-first):**

| Region | Width | Role |
|--------|-------|------|
| **Object box** (grabables) | **~⅓** of viewport | Hats or name tags; free-form drag-and-drop (no fixed grid). Items can stay in the box or move to the book. |
| **Book area** | **~⅔** of viewport | Cover closed or book open; this column is the book’s *stage*, not necessarily filled edge-to-edge. |

- The **book** is **centred** in the right-hand column (or aligned consistently) and **scaled to fit** the available height/width — it must **not** be forced to stretch to the full ⅔ if that would make spreads illegible or taller than the viewport.
- **Book cover** — click opens the book **inline** in the book area (no full-screen overlay); the object box stays usable.
- **Pages** — **5 double-page spreads** (10 guests, **2 per spread**). Turn pages while the pool remains available. One **placement slot** per page (hat or alien). **Whole page** is a drop target; item **snaps** to the slot. Empty slot area visible until filled.
- **Page composition** — symbol **tag** anchored at the **bottom** of each page (above the frame border); portrait in the **center** (Rav: B&W alien with hat slot on the head; Tron: B&W hat with alien slot over the hat area).

**Narrow viewports:** may stack object box above book (still no page scroll) or reduce grabable size — exact breakpoint TBD at implementation; preserve ~⅓ / ⅔ intent where possible.

### Physical components

| Component | Role |
|-----------|------|
| **Translation wheels** (one per notebook) | Map Rav-script tags and Tron-script tags to the same guest **names** |
| **Notebook** (per player) | TBD: wheel instructions, alien roster, flavour; must not duplicate the partner’s secret layout |

### Win condition & password

- Each player fills **10** slots (hats or aliens). **Validation:** all slots occupied → check against instance; **silent** if wrong; items remain movable.
- **Correct (10/10):** each page’s scene fades to a **letter** (current spread animates; other spreads show letters when navigated). Modal shows this player’s **10-letter half** (`password_half_rav` or `password_half_tron`). Halves **differ**; order follows **that player’s page order**. Lowercase a–z only.
- Partner’s half on their device under the same rules. Screens not linked.
- Combined password: both halves by voice for chapter gate (hosted progression).

### Implementation assets (repo)

Early art lives under `CADENIGME2/AliensAndHats/assets/`:

| Folder | Contents (current) |
|--------|-------------------|
| `aliens/` | `alien1` … `alien10`, variants `-1` … `-5` per alien |
| `hats/` | `hat01` … `hat16` |
| `misc/` | `bookfront`, `bookopen`, `tag01` … `tag06` (more may be added) |

**Tags:** unique symbol strings per guest per script; art may repeat (≥1 of each `tag01`…`tag06` in book).

**Code:** `CADENIGME2/AliensAndHats/` — `ravabulle.html`, `troncadelle.html`, shared `js/aliens-and-hats-core.js`, `data/book-layout.json` for asset tuning.

### Interaction notes (for implementation)

- Drag-and-drop must be **keyboard-accessible** with clear drop targets (see `03-interactive-puzzles.mdc`).
- Do not expose partner-colored assets in the wrong role’s page DOM beyond co-op needs (Rav book has no colored hats pre-placed).
- **Drop rules:** wrong hat/alien allowed in slot; validate only at 10/10.
- **Same `seed`** (or shared session instance) required for both players until hosted sync ships.

### Open design questions

- [ ] Final guest **name list** (replace `data/names.json` placeholder).
- [ ] Notebook copy for wheels and pairing hints.
- [ ] Fine-tune `book-layout.json` per species.

### Design intent

- **Tag translation first** → **name-aligned pairing** → **describe hat / describe alien** → fill slots.
- **Shuffled page order** forces voice; **decoy hats** add description depth.
- **Layout data file** for author tuning without code changes.
