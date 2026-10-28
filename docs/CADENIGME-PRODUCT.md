# CADENIGME — product & repository guide (for agents)

This document describes **what CADENIGME is**, how players experience it, and how the **CADENIGME1** reference tree is organized. Use it before changing anything in **CADENIGME2**.

Authoritative French player-facing rules: `CADENIGME1/cadenigme_regles_informations.docx` (read-only).  
Full puzzle design, notebook content, and **spoilers** (passwords, solutions): `CADENIGME1/cadenigme_roadmap.docx` (read-only). Do not paste solution passwords into player-facing copy in CADENIGME2 unless the task explicitly requires it.

---

## What CADENIGME is

**CADENIGME** (“le cadénigme”) is an **asymmetrical two-player cooperative puzzle game** inspired by voice-only co-op games such as *We Were Here*.

Each player has **half of what is needed** to solve each step. They must **talk** (describe, listen, coordinate) — not share screens, photos, or files — or the intended experience breaks. In typical play they are **not in the same room**; the two HTML puzzles are **not linked** (no shared server or sync). See **Session constraints** in [`CADENIGME2-DESIGN.md`](CADENIGME2-DESIGN.md).

**Win condition:** obtain a **three-digit code** that opens a **physical padlock** and reveals a gift. The final code comes from a **YouTube video** (puzzle #09), not from an HTML archive.

**Creator / support:** “Forbillon” (contact details in the rules docx).

---

## Components per player

| Component | Role |
|-----------|------|
| **USB key** (“clé bleue” / “clé rouge”) | Numbered **password-protected ZIP archives** (`#01` … `#08`). Each archive contains one **HTML puzzle** plus an `assets/` folder. |
| **Physical notebook** (“carnet bleu” / “carnet rouge”) | Printed clues: presentation pages, diagrams, and data **unique to that player** for each puzzle chapter. |

**In this repository:** HTML/CSS/JS and shipped assets live under `CADENIGME1/`. **Notebook pages are not in the repo**; their content and layout are specified in `cadenigme_roadmap.docx`.

### Player identities (CADENIGME1)

| Codename | PROD folder | Typical DEV suffix | Notebook / key (per rules docx) |
|----------|-------------|--------------------|----------------------------------|
| **Ravabulle** | `CADENIGME1/PROD/Ravabulle/` | `*R` (e.g. `musiqueR`, `martineR`) | **Blue** carnet & clé |
| **Troncadelle** | `CADENIGME1/PROD/Troncadelle/` | `*T` or unsuffixed partner file (e.g. `galerie`, `levers`) | **Red** carnet & clé |

Each puzzle **N** uses **four complementary pieces**: blue chapter N + red chapter N + archive `#0N` on blue USB + archive `#0N` on red USB.

---

## How a session works

1. **Setup:** headset, microphone, voice call with partner; each player uses **their** USB key and **their** notebook.
2. **Open archives:** unzip each archive; open the **HTML file** in a browser. Only HTML + `assets/` matter; nothing is hidden in `assets/` per the rules docx.
3. **Solve puzzle N** using notebook + partner’s descriptions + local HTML interaction.
4. **Output:** a **single password** (same for both players) used to unlock the **next** archives (`#02`, `#03`, …).
5. After puzzle **#08**, players complete a **URL / physical post-it** step, then watch the **finale video** for the padlock code.

### First archive password

The **first** password is **split**: half at the start of each notebook. Together they unlock archive `#01` (see roadmap docx for the intended combined word). This is the only “bootstrap” step before the usual puzzle → password → next archive loop.

### Password format (archives)

From `cadenigme_regles_informations.docx`:

- **Lowercase letters only** (a–z).
- **No** uppercase, digits, accents, or special characters (including **ù**).
- If a puzzle yields uppercase letters, players still type the password in **lowercase**.

Puzzle **#06** in the shipped design uses a lowercase string that includes letters outside French spelling norms; treat the **roadmap** as source of truth for that answer.

---

## Puzzle sequence (CADENIGME1)

Puzzles are **linear**: solve `#01`, then `#02`, … Archive passwords always unlock the **next** number.

| # | Theme (roadmap) | Ravabulle (HTML / role) | Troncadelle (HTML / role) | Notes |
|---|-----------------|-------------------------|---------------------------|--------|
| 1 | Généalogie / portraits | Simon (`DEV/#01/simon/`) | Galerie (`DEV/#01/galerie/`) | Colors from gallery → Simon → next password |
| 2 | Adages / leviers | Cartes (`DEV/#02/cards/`) | Leviers (`DEV/#02/levers/`) | Phrase matching + lever combos + symbol order |
| 3 | Tableau périodique / mots | Éléments (`DEV/#03/elements/`) | Charabia (`DEV/#03/charabia/`) | Grid assembly + letter paths |
| 4 | Piano / tableau | Piano (`DEV/#04/piano/`) | Pinboard (`DEV/#04/pinboard/`) | Split password halves from keyboard + board |
| 5 | Journaux / Martine | `martineR` | `martineT` | Cross-read journals → Martine covers → bingo |
| 6 | Audio / K7 | `musiqueR` | `musiqueT` | Reorder audio clips → letters |
| 7 | Grille / horloge | Grille (`DEV/#07/grille/`) | Horloge (`DEV/#07/clock/`) | Grid overlay + clock hands |
| 8 | Pandas / URL | URL (`DEV/#08/url/`) | Panda (`DEV/#08/panda/`) | **CADENIGME1 only:** physical panda post-its cut with scissors + URL assembly |
| 9 | Finale | — | — | **Video only** (`youtu.be/VzQJY9dh7qQ` in roadmap); **3-digit padlock** |

PROD bundles each side into `PROD/<Player>/#NN/#NN.html` + `assets/` (content merged from the matching DEV folder).

**Puzzle #09** is not an HTML deliverable in CADENIGME1; it is the published video and physical lock.

---

## Repository layout

```
CADENIGME/
├── AGENTS.md                 # Agent index (read first)
├── docs/
│   ├── CADENIGME-PRODUCT.md  # This file
│   ├── CADENIGME2-DESIGN.md   # V2 puzzle concepts & mechanics (draft)
│   └── TODO-shared-progression.md  # Planned hosted play + session sync (not implemented)
├── .cursor/rules/            # Engineering & a11y rules (CADENIGME2)
├── CADENIGME1/               # READ-ONLY reference (shipped game v1)
│   ├── cadenigme_regles_informations.docx
│   ├── cadenigme_roadmap.docx
│   ├── DEV/#NN/<variant>/    # Source puzzles per mechanic / player
│   └── PROD/<Ravabulle|Troncadelle>/#NN/
└── CADENIGME2/               # Writable sequel / improvements (may be empty)
```

### DEV vs PROD

| Tree | Purpose |
|------|---------|
| **`DEV/#NN/…`** | Development sources: one folder per interactive variant (`galerie.html`, `levers.html`, …). Use when studying behaviour or porting a single mechanic. |
| **`PROD/<Player>/#NN/`** | **Player deliverable** shape: single `#NN.html` + `assets/` as shipped on USB after packaging. |

When implementing CADENIGME2, **reuse patterns and engineering standards from CADENIGME1** (layout, co-op splits, packaging shape) but **do not port v1 puzzle content wholesale** — v2 is a new puzzle set. Never edit CADENIGME1.

### Technical traits (legacy HTML)

Reference puzzles are **single-file HTML** with embedded CSS/JS, often **jQuery** (sometimes duplicated versions — **do not repeat** in CADENIGME2), **snake_case** ids, **`data-*` state**, and `assets/` for media. See `.cursor/rules/02-html-css-js-style.mdc` and `03-interactive-puzzles.mdc`.

---

## CADENIGME2 (sequel)

**CADENIGME2** is the **only writable** codebase for the next edition.

| Aspect | CADENIGME2 intent |
|--------|-------------------|
| **Puzzles** | **Entirely new** storyline and mechanics — not a remaster of `#01`–`#09`. |
| **Product shape** | Same broad model: **Ravabulle (blue)** + **Troncadelle (red)**, voice co-op, notebooks + USB HTML archives, physical end reward (format TBD per design). |
| **Goals** | **Better gameplay and user experience**, plus the engineering bar in `.cursor/rules/` (accessibility, maintainable HTML/JS, no legacy hacks). |
| **CADENIGME1-only ideas** | Do **not** assume v1 conceits carry over (e.g. **cutting panda post-its** in puzzle #08). |

Treat **CADENIGME1** as a **reference for tone, co-op structure, DEV/PROD layout, and interaction patterns**. Puzzle concepts and mechanics for v2 live in **[`CADENIGME2-DESIGN.md`](CADENIGME2-DESIGN.md)** (not in `cadenigme_roadmap.docx`).

---

## Agent checklist

- [ ] Understand **voice-only co-op** — UI text is for **one** player; partner info stays in the other notebook/HTML.
- [ ] Know **which player** a PROD path or DEV suffix refers to before comparing two sides.
- [ ] Read **roadmap docx** for notebook-dependent logic; do not invent clues that exist only on paper.
- [ ] Respect **password rules** for any in-game “archive unlock” metaphor in v2.
- [ ] Meet **accessibility** expectations in CADENIGME2 even though CADENIGME1 predates them.
- [ ] For v2, **do not reuse v1 puzzle solutions** from the roadmap docx unless explicitly porting legacy content.
- [ ] **Verify behaviour** after edits — the current puzzle/component still works as intended; avoid regressions unless the task explicitly changes game rules.
