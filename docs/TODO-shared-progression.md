# TODO — Shared progression (hosted web + session document)

**Status:** Not started — planning only.  
**Goal:** Replace USB-local-only delivery with **browser-hosted** puzzles (e.g. GitHub Pages) and **shared progression** via a single **session document** per pair (Supabase or Firebase).  
**Product rule (v2):** **Each player must enter the password themselves** before the pair can advance; one player’s correct submission does **not** unlock the partner.

**Variation rule (v2):** Each **new game** is unique where puzzles support it — content is **randomised at initialisation** from authored pools, but **both players in the same session share identical instance data** (same aliens, hats, names, and validation targets for that run).

Related docs: [`CADENIGME-PRODUCT.md`](CADENIGME-PRODUCT.md), [`CADENIGME2-DESIGN.md`](CADENIGME2-DESIGN.md) (session constraints there still describe the **current** offline model — update them when this ships).

---

## Out of scope for this track (explicit)

- [ ] Real-time in-puzzle sync (e.g. “pull lever on A → door opens on B”) — optional later; not required for password-gated chapter progression.
- [ ] Hiding puzzle passwords from determined players (client-side check is acceptable for v1 of hosted mode unless we add Edge Functions).
- [ ] USB packaging and `file://` offline play (deprecated for v2 once hosted path is live).

---

## Recommended stack (light)

| Layer | Choice | Notes |
|-------|--------|--------|
| Static hosting | **GitHub Pages** (or Cloudflare Pages / Netlify) | Serves `CADENIGME2` built HTML/CSS/JS/assets over **HTTPS**. |
| Shared state | **Supabase** (preferred) or **Firebase** | One row/doc per game session; anon key in client + strict RLS/rules. |
| Realtime | **Optional** | Subscribe to session updates so partner’s password entry updates UI without manual refresh. Polling is acceptable MVP. |
| Secrets | **Supabase Edge Function** (optional phase 2) | Verify passwords server-side if we outgrow client checks. |

**Decision pending:** Supabase vs Firebase — pick one before implementation (Supabase: SQL + RLS; Firebase: familiar RTDB/Firestore). Architecture below is provider-agnostic (`sessions` document).

---

## Player experience (target)

1. **Lobby** — Player A creates a game → receives a **room code** (or shareable link with embedded room id). Player B joins with the same code.
2. **Roles** — Each player picks or is assigned **Ravabulle** vs **Troncadelle** (or opens a fixed link for their role). Room id is carried in URL query (`?room=…`) or path (`/play/{roomId}/rav/01`).
3. **Play puzzle #N** — Asymmetric HTML for that chapter (no shared in-puzzle state unless a future puzzle requires it).
4. **End of chapter — password gate** — Each player enters the **same** chapter password (lowercase letters-only per product rules) on **their** device (dedicated gate page or end-of-puzzle UI).
5. **Advance** — Next chapter links (or hub) become available for **both** only when **Ravabulle and Troncadelle** have each submitted the correct password for chapter **N**.
6. **Voice co-op** unchanged — remote play, no screen sharing; session coordinates **progress** and **shared puzzle instances**, not live in-puzzle actions (unless a future puzzle needs them).

### Per-game randomisation (shared instance)

- [ ] On **create game**, generate puzzle instance(s) **once** and persist on the session row (or generate via Edge Function with service role).
- [ ] **Joining player** only **reads** instance data — never re-rolls RNG locally.
- [ ] Both Ravabulle and Troncadelle pages for chapter `N` load `instances["NN"]` (or `seed` + `generator_version`) from the same session before building the DOM.
- [ ] Document **generator version** in session when using seeds — deploys that change the algorithm must bump version or old sessions break.
- [ ] Puzzles without randomisation: omit instance or store `null` / static id.

### Aliens & hats (and similar puzzles)

- **Instance (v2)** defines 10 guests (`alien`, `variant`, `hat_id`, `name`, `tag_rav`, `tag_tron`, `tag_art`, `letter_rav`, `letter_tron`), `rav_page_order`, `tron_page_order`, `password_half_rav`, `password_half_tron` — see [`CADENIGME2-DESIGN.md`](CADENIGME2-DESIGN.md) and [`CADENIGME2/AliensAndHats/ALIENS-AND-HATS-IMPLEMENTATION.md`](../CADENIGME2/AliensAndHats/ALIENS-AND-HATS-IMPLEMENTATION.md).
- **In-puzzle** completion (10 slots, local validation, password **half** reveal) stays **local-only** on the device; validation logic reads the **shared instance** (fetched at page load).
- **Chapter password** (full word for next chapter) may be **computed from the instance** or generated alongside it; each player submits at the gate — **two submissions** required to advance.

---

## Session document (schema draft)

Single document per room, e.g. table `game_sessions` with primary key `id` (UUID) and optional short `join_code` (unique, human-friendly).

```json
{
  "id": "uuid-v4",
  "join_code": "K7M2P9",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",
  "schema_version": 1,
  "players": {
    "ravabulle": { "joined_at": "ISO-8601|null" },
    "troncadelle": { "joined_at": "ISO-8601|null" }
  },
  "chapters": {
    "01": {
      "rav_password_ok": false,
      "tron_password_ok": false,
      "rav_submitted_at": null,
      "tron_submitted_at": null
    },
    "02": { }
  },
  "max_chapter_available": 1,
  "generator_version": 1,
  "instances": {
    "01": {
      "puzzle_id": "aliens_and_hats",
      "seed": "optional-if-not-storing-full-blob",
      "guests": [
        {
          "guest_id": 0,
          "name": "zorblax",
          "alien": "alien3",
          "alien_variant": 2,
          "hat_id": "hat07",
          "tag_art": "tag02",
          "tag_rav": "◈◇△",
          "tag_tron": "⟦⟩╬",
          "letter_rav": "q",
          "letter_tron": "m"
        }
      ],
      "rav_page_order": [3, 0, 7, 1, 9, 2, 8, 4, 6, 5],
      "tron_page_order": [1, 8, 0, 5, 3, 9, 2, 7, 4, 6],
      "password_half_rav": "…10 chars…",
      "password_half_tron": "…10 chars…"
    }
  }
}
```

`instances` is illustrative — exact fields live in per-puzzle specs. **`chapter_password`** in client-visible JSON is a tradeoff (Phase 2: store hash server-side only).

### Rules

- **`max_chapter_available`:** Highest chapter number **both** players may open (integer, starts at `1`).
- **After chapter `N`:** When `rav_password_ok && tron_password_ok` for key `"N"`, set `max_chapter_available = N + 1` (cap at last chapter).
- **Idempotent writes:** Re-submitting the same correct password does not break state; wrong password does not flip flags (optional: rate-limit / soft feedback only on client).
- **Join tracking:** `players.*.joined_at` for UX (“partner connected”) — not required for unlock logic.

### Indexing / keys

- Lookup by `join_code` for join flow; store internal `id` in URLs.
- Do not use sequential integer room ids (guessable).

---

## Security & RLS (must-have before public deploy)

- [ ] **Row-level security:** Clients may only read/write the session row matching their `room` id (and join flow may create one new row).
- [ ] **Join code** entropy: at least 6–8 alphanumeric, case-insensitive normalization.
- [ ] **Session payload hygiene:** Store **puzzle instances** (shared truth for the run) in the session — required for matching Rav/Tron data. Do **not** store in-game **password halves** or notebook-only secrets. Prefer **hashed chapter passwords** or server-only verification if the instance would otherwise expose the gate answer in plain JSON.
- [ ] **TTL / cleanup:** Cron or Supabase scheduled job to delete sessions older than e.g. 30–90 days (GDPR-ish hygiene, cost).
- [ ] **Anon key** in repo: public by design; never put service role key in static site.
- [ ] Document that **client password checks are bypassable** — acceptable for co-op gift; note in player rules.

---

## Site structure (implementation checklist)

- [ ] **`/index.html`** — Create game / join game / explain roles.
- [ ] **`/hub.html?room=…`** (or lobby section) — Shows current `max_chapter_available`, links to `rav/#NN` and `tron/#NN`, per-player status (“you’ve entered password”, “waiting for partner”).
- [ ] **`/gate.html?room=…&chapter=NN&role=rav|tron`** — Password input; on success, patch session chapter flags for that role.
- [ ] **`/rav/#NN.html`**, **`/tron/#NN.html`** — Puzzles; link to gate when chapter complete (or embed gate).
- [ ] **`/assets/js/session-client.js`** — Thin wrapper: `getSession`, `subscribeSession`, `submitChapterPassword(role, chapter, password)`, `getChapterInstance(chapter)`.
- [ ] **`/assets/js/puzzles/aliens-and-hats-generator.js`** — Deterministic builder: pools → instance JSON; used only on create (or server); unit-test two runs with same seed → identical output.
- [ ] **Build/deploy** — Copy or build `CADENIGME2` puzzle folders into `docs/` or `gh-pages` branch; single deploy pipeline.

---

## Password verification (phased)

### Phase 1 — Client-side (fastest)

- [ ] Password list per chapter in JS module **not** committed to public repo if avoidable — or accept visibility for MVP.
- [ ] On submit: if correct, call Supabase `update` for `{ chapters.N.{role}_password_ok: true }`; then recompute `max_chapter_available` (client or DB trigger).

### Phase 2 — Server-side (optional)

- [ ] Supabase Edge Function `verify_chapter_password(room, chapter, role, password)` — returns ok/error; updates row with service role.
- [ ] Static site only holds anon key; answers live in function env/secrets.

---

## Supabase implementation tasks

- [ ] Create Supabase project (prod + optional staging).
- [ ] Table `game_sessions` + indexes on `join_code`.
- [ ] RLS policies: insert for create; select/update for holders of `id` or valid `join_code` (design policy carefully — prefer secret `id` in URL over code-only writes).
- [ ] Enable Realtime on `game_sessions` (optional).
- [ ] SQL trigger or app logic: when both flags true for chapter N, bump `max_chapter_available`.
- [ ] Environment: `SUPABASE_URL`, `SUPABASE_ANON_KEY` injected at build or config.js (gitignored template `config.example.js`).

## Firebase alternative (if chosen instead)

- [ ] Firestore collection `sessions/{id}` with same JSON shape.
- [ ] Security rules mirroring RLS.
- [ ] `onSnapshot` for hub UI.

---

## Frontend behaviour details

- [ ] **Hub guards:** If `chapter > max_chapter_available`, redirect to hub with message (client-side; document for players).
- [ ] **Gate guards:** If this role already has `*_password_ok` for chapter, show “already validated” and link to hub/next.
- [ ] **Waiting state:** If local player submitted but partner has not, show clear “waiting for Troncadelle/Ravabulle” (realtime or poll every 5–10s).
- [ ] **Accessibility:** Gate form — labelled input, `autocomplete="off"`, error announcements (`aria-live`), keyboard submit.
- [ ] **French** `lang` and copy consistent with notebooks.

---

## Documentation updates (when implementing)

- [ ] Revise **Session constraints** in [`CADENIGME2-DESIGN.md`](CADENIGME2-DESIGN.md): hosted HTTPS, session doc for **chapter** progression; clarify what remains local-only per puzzle.
- [ ] Update [`CADENIGME-PRODUCT.md`](CADENIGME-PRODUCT.md): USB optional/legacy; GitHub Pages URL; two password entries to advance.
- [ ] Player-facing rules (future docx/page): how to create/join room; each must type password; no screen share.

---

## Testing plan

- [ ] Two browsers / two profiles: create room, join, complete gate on one side only → next chapter **not** available on either hub.
- [ ] Second player submits → both see chapter N+1.
- [ ] Wrong password → no flag change; no leak of correct password in network tab beyond client bundle.
- [ ] Refresh / reopen tab with same room URL → state restored from session.
- [ ] Realtime (if enabled): second submit updates first player’s hub without refresh.
- [ ] Create two games → **different** Aliens & hats layouts; same game, Rav vs Tron → **identical** guest/hat/name mapping when comparing instance (or equivalent playthrough).
- [ ] Second player joining cannot regenerate instance (attempted double-create leaves first instance unchanged).

---

## Open questions

- [ ] Exact URL scheme (`join_code` in URL vs UUID only)?
- [ ] Can the same role join twice from two devices (overwrite vs reject)?
- [ ] Chapter numbering alignment with v2 puzzle index (`01` … `09`)?
- [ ] Single combined password per chapter vs Rav/Tron different passwords (product says same word — store one check per role but same expected string)?
- [ ] Rate limiting abusive joins (Supabase captcha / edge function)?
- [ ] Generate all chapter instances at game create vs lazily when chapter unlocks?
- [ ] Name/symbol pools: JSON in repo vs DB table for easier content edits?

---

## Suggested implementation order

1. Supabase project + table + RLS + manual row edit in dashboard (prove schema).
2. Minimal lobby + hub + gate (one fake chapter, hardcoded password).
3. Session client module + waiting UI + optional Realtime.
4. **Aliens & hats generator** + persist `instances["01"]` on create game; Rav/Tron pages render from instance.
5. Wire local book validation + password halves; chapter gate uses instance-derived password.
6. Deploy GitHub Pages + config; docs update; playtest remote pair (two games = different layouts).
