# Aliens & Hats — implementation guide (v2)

For product rules and co-op flow, see [`docs/CADENIGME2-DESIGN.md`](../../docs/CADENIGME2-DESIGN.md).

## Run locally

From `CADENIGME2/AliensAndHats/`:

```bash
npx serve .
```

Open:

- `http://localhost:3000/troncadelle.html?seed=42`
- `http://localhost:3000/ravabulle.html?seed=42`

**Both players must use the same `seed`** (until session sync exists) so the instance matches.

## File map

| File | Role |
|------|------|
| `ravabulle.html` / `troncadelle.html` | Thin shells; call `AliensAndHatsCore.init({ role })` |
| `js/puzzle-instance.js` | `createInstance(seed)` → shared blob |
| `js/aliens-and-hats-core.js` | UI, DnD, validation, reveal, sizing |
| `css/aliens-and-hats.css` | Layout (⅓ pool, ⅔ book), portrait stack, tags |
| `data/book-layout.json` | Per-species sizes and hat-on-head offsets |
| `data/names.json` | Guest names (placeholder; wire into generator when loading async) |

## `init({ role, seed?, instance? })`

- `role`: `'ravabulle'` | `'troncadelle'`
- `seed`: optional; same for both players
- `instance`: optional pre-built object (future Supabase)

## Ravabulle vs Troncadelle

| | Ravabulle | Troncadelle |
|---|-----------|-------------|
| Pool | 16 colored hats | 50 colored aliens (10×5 variants) |
| Fixed on page | B&W alien + Rav-script tag | B&W hat + Tron-script tag |
| Empty slot | Hat (colored when placed) | Alien (colored when placed) |
| Validates | `hat_id` per page | `alien` + `alien_variant` per page |
| Page order | `instance.rav_page_order` | `instance.tron_page_order` |
| Password half | `password_half_rav` (10 letters, Rav page order) | `password_half_tron` |

## Book page DOM

Each `.book_page` contains:

- `.page_scene` (inset inside the open-book frame)
  - `.portrait_stack` → `.portrait_body` (reserved alien silhouette) + `.portrait_hat` (absolute, head anchor)
  - `.fixed_tag` — **absolute bottom** (above the blue border), not inside the stack
- `.page_letter` — revealed password glyph (hidden until solve / navigation)

**Both roles** use the same composition: alien body anchored at the bottom of `.portrait_body`, hat anchored on the head via `.portrait_hat` (does not move when the partner piece is placed).

**Ravabulle:** B&W alien in the body; colored hat drops into `.portrait_hat`.

**Troncadelle:** B&W hat fixed in `.portrait_hat`; colored alien drops into the body slot below.

Cover: `#btn_open_book` opens only. When open, `#btn_close_book` in `#book_nav` calls `closeBook()`.

## Instance fields (`guests[]`)

| Field | Use |
|-------|-----|
| `guest_id` | Canonical index 0–9 |
| `name` | Wheel / design (not Latin in DOM) |
| `alien`, `alien_variant`, `hat_id` | Pair identity |
| `tag_art`, `tag_rav`, `tag_tron` | Fixed tags on pages |
| `letter_rav`, `letter_tron` | Password characters for that guest |

Page index `p` (0–9) → guest `instance.guests[page_order[p]]`.

## Piece sizing (grab items)

**Pool (grab box):** `alien_species_size.pool` and `hat_size.pool` — `widthPx` / `heightPx` (`0` = auto). Default pool height **140px** only when both dimensions are auto.

**Book (scales with the page):** `alien_species_size.book` — `widthPct` / `heightPct` relative to **`.portrait_body`** (`0` = auto). Merged with optional `rav_alien_on_page` frame `widthPct`. Applies to Rav B&W aliens and Tron placed aliens.

**Rav placed hats:** `rav_hat_on_alien` — alien-level `widthPct` / `marginBottomPct` = empty head layer. Per `hat01`…`hat16` (or `default`): **`widthPct`** = `.portrait_hat` width (% of `.portrait_body`); **`marginBottomPct`** = head offset (`--ah-hat-offset-y`). The grab piece fills the layer (`widthPct: 100`); optional **`heightPct`** on the hat entry only. Removing the hat restores alien-level layer values.

Px and pct can coexist; **pct is preferred on book**; px on pool.

While dragging, the piece keeps its current pixel box; `.grab_piece--dragging` applies `scale(1.08)`.

## DnD

- Whole `.book_page` accepts drop; item snaps to `.placement_slot`.
- Hit-testing uses `document.elementsFromPoint` (dragged piece stays visible; `pointer-events: none` on drag).
- Invalid drop → restore pre-drag position.
- Drop on occupied slot → swap (slot↔slot or pool↔slot with swap to pool).
- Pool: seeded **shuffle**, then **≥3 columns** (round-robin, count grows if needed for height); even vertical spread, centered in column (no jitter); layout runs after images decode; all pieces clamped in bounds; `#grab_pool { overflow: hidden }`.
- Silent validation when all 10 slots filled.

## Password reveal

- On 10/10 correct: non-visible spreads show letter immediately; **current spread** fades scene → letter.
- Modal shows full 10-character half for this role.
- Navigate spreads to read each letter.

## Layout JSON

Edit `data/book-layout.json`:

- `alien_species_size.pool` — px; `.book` — `%` of portrait body per `alien1`…`alien10`
- `hat_size.pool` — grab-box hat `widthPx`, `heightPx` per `hat01`…`hat16` (`0` = auto)
- `rav_alien_on_page` — B&W alien frame width (`widthPct` on `.alien_fixed_bw`)
- `rav_hat_on_alien` — head layer (`widthPct`, `marginBottomPct`) + placed hat `widthPx`/`heightPx` (`default` and per `hatNN` under each alien)
- `tron_hat_on_page` — Tron **empty** page: B&W hat layer (`widthPct` default **80**, `marginBottomPct`). When a colored alien is placed, hat layer uses **`rav_hat_on_alien`** for that **placed alien species** + page **`hat_id`** (same pairing as Rav); alien uses `alien_species_size.book`. Removing the alien restores `tron_hat_on_page`.

Reload puzzle after edits.
