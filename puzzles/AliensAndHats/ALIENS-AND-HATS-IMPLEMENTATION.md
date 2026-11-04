# Aliens & Hats — implementation guide (v2)

For product rules and co-op flow, see [`docs/CADENIGME2-DESIGN.md`](../../docs/CADENIGME2-DESIGN.md).

## Run locally

From `puzzles/AliensAndHats/`:

```bash
npx serve .
```

Open:

- `http://localhost:3000/troncadelle.html?seed=42`
- `http://localhost:3000/ravabulle.html?seed=42`

**Both players must use the same `seed`** (until session sync exists) so the instance matches.

`?seed=stage2` opens the book already at step 2 of seed **42**: correct portraits placed, right-hand pages visible, text fields empty. No entrance animation.

## File map

| File | Role |
|------|------|
| `ravabulle.html` / `troncadelle.html` | Thin shells; call `AliensAndHatsCore.init({ role })` |
| `js/puzzle-instance.js` | `createInstance(seed, catalog)` → shared blob |
| `js/aliens-and-hats-core.js` | UI, DnD, validation, reveal, sizing |
| `css/aliens-and-hats.css` | Layout (⅓ pool, ⅔ book), portrait stack, dossier |
| `data/book-layout.json` | Per-species sizes and hat-on-head offsets |
| `data/catalog.json` | Guest names, species names, and species descriptions (placeholders until authored) |

## `init({ role, seed?, instance? })`

- `role`: `'ravabulle'` | `'troncadelle'`
- `seed`: optional; same for both players
- `instance`: optional pre-built object (future Supabase)

## Ravabulle vs Troncadelle

| | Ravabulle | Troncadelle |
|---|-----------|-------------|
| Pool | 16 colored hats | 50 colored aliens (10×5 variants) |
| Left page | B&W alien + hat slot | B&W hat + alien slot |
| Species tag (`tag04`–`tag06`) | Rav-script code, not editable | Empty tag + text field |
| Name tag (`tag01`–`tag03`) | Empty tag + text field | Tron-script code, not editable |
| Description | Same species text on both sides | Same species text on both sides |
| Validates | `hat_id` and typed guest `name` | `alien` + `alien_variant` and typed `species_name` |
| Page order | `instance.rav_page_order` (same sequence as Troncadelle) | `instance.tron_page_order` (same sequence as Ravabulle) |
| Password half | `password_half_rav` (10 letters, Rav page order) | `password_half_tron` |

## Book spread DOM

**10 spreads**, one guest each. Page index `p` is also the spread index.

Each `.book_spread` contains:

- `.book_spread_frame`
- Left `.book_page--portrait` → `.page_scene` → `.portrait_stack` → `.portrait_body` (alien silhouette) + `.portrait_hat` (absolute, head anchor). No tag. `.portrait_stack` stays at `bottom: 16%` so the band the old tag occupied stays empty and sprites do not shift.
- Right `.book_page--dossier` → `.page_scene--dossier`
  - `.dossier_tag--species` — code or `<input class="tag_input">`
  - `.species_description`
  - `.dossier_tag--name` — code or input
- `.spread_letter` — one password glyph for the spread (hidden until solve)

The right page is not a drop target.

**Both roles** use the same portrait composition: alien body anchored at the bottom of `.portrait_body`, hat anchored on the head via `.portrait_hat` (does not move when the partner piece is placed).

**Ravabulle:** B&W alien in the body; colored hat drops into `.portrait_hat`.

**Troncadelle:** B&W hat fixed in `.portrait_hat`; colored alien drops into the body slot below.

Cover: `#btn_open_book` opens only. When open, `#btn_close_book` in `#book_nav` calls `closeBook()`.

## Instance fields (`guests[]`)

| Field | Use |
|-------|-----|
| `guest_id` | Canonical index 0–9 |
| `name` | Latin guest name. Typed on Ravabulle; not written into Troncadelle’s page text |
| `species_name`, `species_description` | From `catalog.json` via `alien`. Description is shown on both sides. Species name is typed on Troncadelle and not written into Ravabulle’s page text |
| `alien`, `alien_variant`, `hat_id` | Pair identity |
| `species_code`, `species_tag_art` | Rav-script species code; art is `tag04`–`tag06` (each used at least once). Same code for a given `alien` key |
| `name_code`, `name_tag_art` | Tron-script guest-name code; art is `tag01`–`tag03` (each used at least once) |
| `letter_rav`, `letter_tron` | Password characters for that guest |

Page index `p` (0–9) → guest `instance.guests[page_order[p]]`.

## Piece sizing (grab items)

**Pool (grab box):** `alien_species_size.pool` and `hat_size.pool` — `widthPx` / `heightPx` (`0` = auto). Default pool height **140px** only when both dimensions are auto.

**Book (scales with the page):** `alien_species_size.book` — `widthPct` / `heightPct` relative to **`.portrait_body`** (`0` = auto). Merged with optional `rav_alien_on_page` frame `widthPct`. Applies to Rav B&W aliens and Tron placed aliens.

**Rav placed hats:** `rav_hat_on_alien` — alien-level `widthPct` / `marginBottomPct` = empty head layer. Per `hat01`…`hat16` (or `default`): **`widthPct`** = `.portrait_hat` width (% of `.portrait_body`); **`marginBottomPct`** = head offset (`--ah-hat-offset-y`). The grab piece fills the layer (`widthPct: 100`); optional **`heightPct`** on the hat entry only. Removing the hat restores alien-level layer values.

Px and pct can coexist; **pct is preferred on book**; px on pool.

While dragging, the piece keeps its current pixel box; `.grab_piece--dragging` applies `scale(1.08)`.

## DnD

- The left `.book_page--portrait` accepts drop; item snaps to `.placement_slot`. The dossier page does not.
- Hit-testing uses `document.elementsFromPoint` (dragged piece stays visible; `pointer-events: none` on drag).
- Invalid drop → restore pre-drag position.
- Drop on occupied slot → swap (slot↔slot, or pool↔slot). The piece that returns to the pool takes the pool position of the piece that replaced it.
- Pool: seeded **shuffle**, then **≥3 columns** (round-robin, count grows if needed for height); even vertical spread, centered in column (no jitter); layout runs after images decode; all pieces clamped in bounds; `#grab_pool { overflow: hidden }`.
- Silent check when all 10 slots are filled. If every placement is correct, navigation and dragging lock, `valid.mp3` plays after one second, and about 1.5 seconds later the right-hand pages appear. The open spread animates: species tag from above, description from the right, name tag from below, each with `swap.mp3`. Navigation stays locked until that entrance ends. Other spreads already show their dossier. A wrong full set stays silent.
- After the dossiers are visible, pieces can still move and the entrance does not play again. The puzzle solves only when the placements are still correct **and** all 10 text fields for this role are non-empty and match. Typed answers are trim + case-insensitive, with internal whitespace collapsed. Accents must match the catalog. A wrong word leaves pieces and text in place.
- A drop that lands on a page plays `swap.mp3` once, including a swap onto an occupied slot. Reordering in the pool, returning a piece to the pool, and a rejected drop stay silent. Turning a page, or opening the book from either cover, plays one of `page1.mp3`–`page6.mp3` at random. Those clips are decoded ahead of time and started after their quiet lead-in, so the rustle lines up with the turn. Closing onto either cover plays `close.mp3`.

## Book navigation

- Left and Right arrows turn spreads. They are ignored while a text field is focused, while the dossier entrance is playing, or while the password dialog is open.
- Left arrow or **Page précédente** on the first spread closes onto the front cover. Right arrow on that cover opens the book again at the spread that was left.
- Right arrow or **Page suivante** on the last spread closes onto the back cover (`#book_cover.book_cover--back`, the cover image mirrored). Left arrow or a click on that cover opens the last spread.
- **Fermer le livre** closes onto the front cover and keeps the current spread.

## Password reveal

- On a full correct book the same pause runs again: lock, `valid.mp3` after one second, then about 1.5 seconds later the password half. Other spreads show their letter immediately; the **current spread** fades both pages, then shows **one** centered letter.
- Modal shows the full 10-character half for this role.
- Navigate the 10 spreads to read each letter.

## Catalog JSON

Edit `data/catalog.json` (loaded before `createInstance`):

- `species.alien1` … `species.alien10` — `names` (array of labels; the seed picks one, and that is what Troncadelle types), `description` (shown on both sides), and optional `sex` (`"female"` or `"male"`; omitted species can take either)
- `guests.female` and `guests.male` — Latin names. A female-only species draws from `female`, a male-only species from `male`, and the others from both lists. Ten names are drawn per seed, with no repeat (what Ravabulle types). `alien4` is female; `alien8` is male.

`SHOW_PLAIN_LABELS` in `js/aliens-and-hats-core.js` is temporary. While it is `true`, Ravabulle’s species tag and Troncadelle’s name tag show those Latin words instead of the symbol codes. Set it to `false` when the hand-drawn symbols are ready. Symbol strings are still generated.

Symbol codes stay seed-generated. They are not stored in the catalog. Reload the puzzle after edits.

## Layout JSON

Edit `data/book-layout.json`:

- `alien_species_size.pool` — px; `.book` — `%` of portrait body per `alien1`…`alien10`
- `hat_size.pool` — grab-box hat `widthPx`, `heightPx` per `hat01`…`hat16` (`0` = auto)
- `rav_alien_on_page` — B&W alien frame width (`widthPct` on `.alien_fixed_bw`)
- `rav_hat_on_alien` — head layer (`widthPct`, `marginBottomPct`) + placed hat `widthPx`/`heightPx` (`default` and per `hatNN` under each alien)
- `tron_hat_on_page` — Tron **empty** page: B&W hat layer (`widthPct` default **80**, `marginBottomPct`). When a colored alien is placed, hat layer uses **`rav_hat_on_alien`** for that **placed alien species** + page **`hat_id`** (same pairing as Rav); alien uses `alien_species_size.book`. Removing the alien restores `tron_hat_on_page`.

Reload puzzle after edits.
