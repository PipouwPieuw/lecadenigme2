# CADENIGME — agent instructions

All Cursor agents working in this repository must follow the rules in **`.cursor/rules/`**. Those rules are authoritative; this file is a short index.

## What you are building

**CADENIGME** is a **two-player asymmetric co-op** puzzle experience (voice communication, like *We Were Here*). Each player has a **USB key** (numbered HTML archives) and a **physical notebook** with unique clues. Together they solve a **linear chain** of puzzles (CADENIGME1: #01–#08 digital, #09 video → three-digit padlock). **CADENIGME2** keeps the same **two-player co-op model** but uses **new puzzles** and targets **better gameplay and UX**.

Full product context, player mapping, puzzle index, and repo layout: **[`docs/CADENIGME-PRODUCT.md`](docs/CADENIGME-PRODUCT.md)**. V2 puzzle design drafts: **[`docs/CADENIGME2-DESIGN.md`](docs/CADENIGME2-DESIGN.md)**. V2 puzzle ideas pool: **[`docs/CADENIGME2-PUZZLE-IDEAS.md`](docs/CADENIGME2-PUZZLE-IDEAS.md)**. Aliens & Hats implementer guide: **[`CADENIGME2/AliensAndHats/ALIENS-AND-HATS-IMPLEMENTATION.md`](CADENIGME2/AliensAndHats/ALIENS-AND-HATS-IMPLEMENTATION.md)**. Planned hosted progression (Supabase session): **[`docs/TODO-shared-progression.md`](docs/TODO-shared-progression.md)** (not implemented).

## Workspace

| Path | Policy |
|------|--------|
| `CADENIGME1/` | **Read-only.** Legacy DEV/PROD puzzles and assets. Reference only — never modify. |
| `CADENIGME2/` | **Active development.** All edits and new files go here. |

## Principles

1. **Best practices only** — robust, maintainable front-end code; no hacks or “temporary” fixes left in place.
2. **Accessibility** — valid HTML, French `lang`, semantic landmarks, keyboard support, correct ARIA names/states/live regions, meaningful `alt` text.
3. **Comments** — never delete or strip existing comments without explicit user approval.
4. **Style** — align with legacy CADENIGME puzzles (tabs, snake_case ids, `data-*` state, `assets/`, single-page HTML) while fixing known legacy issues (duplicate jQuery, missing doctype/lang, non-interactive click targets).
5. **Co-op design** — each HTML page serves **one** player; essential information must not be duplicated in the DOM in a way that removes the need for voice play (see `03-interactive-puzzles.mdc`).
6. **No regressions** — after any change, the affected puzzle or component must still behave as designed (interactions, feedback, solutions). Verify in the browser when possible; do not ship “probably fine” refactors (see `00-project-governance.mdc`).

## Rule files

| File | Scope |
|------|--------|
| `00-project-governance.mdc` | Always — boundaries, quality bar, comments |
| `04-cadenigme-product.mdc` | Always — short product summary + doc links |
| `01-accessibility.mdc` | `CADENIGME2` HTML/CSS/JS |
| `02-html-css-js-style.mdc` | Structure, naming, scripts |
| `03-interactive-puzzles.mdc` | Buttons, DnD, audio, cooperative UI |

## Reference (read-only)

| Resource | Content |
|----------|---------|
| [`docs/CADENIGME-PRODUCT.md`](docs/CADENIGME-PRODUCT.md) | Product model, progression, puzzle/Dev/Prod map |
| `CADENIGME1/cadenigme_regles_informations.docx` | Player-facing rules (French), archive password format |
| `CADENIGME1/cadenigme_roadmap.docx` | Puzzle design, notebook content, solutions (**spoilers**) |
| `CADENIGME1/DEV/#NN/…` | Per-mechanic source HTML |
| `CADENIGME1/PROD/Ravabulle|Troncadelle/#NN/` | Shipped per-player bundles |

Lead front-end quality for `CADENIGME2` is the default expectation for every agent task.
