# Atlas Engineering Workflow Skills

A set of [Agent Skills](https://agentskills.io) that take a change from a vague
idea to shipped, verified, documented code, for any AI coding agent. One skill
per phase. Run only the ones a change needs.

Maintained by **Atlas (Pty) Ltd**.

The state lives in files (a scope, specs, AGENTS.md, tests), not in a chat
session. Work survives across sessions, picks up where it left off, and works
for a whole team.

```
idea → /scope → /audit → /architect → /develop → /check verify → /test → /check review → /document → /sync
```

Run `/debug` anytime something breaks. Run a bare `/scope` to see where things stand.

## The skills

| Skill | What it does |
|---|---|
| `scope` | Turns a product idea into a living, coarse scope and keeps it current as you ship. |
| `audit` | Writes the AGENTS.md context files every other skill reads. |
| `architect` | Makes a load bearing decision and writes it as a build spec in `docs/specs/`. |
| `develop` | Builds a feature, UI or backend, from its spec. Gates to `/architect` if a decision is owed. |
| `check` | Confirms a change before merge. `/check verify` runs the real app; `/check review` reads the code on a second model. |
| `test` | Writes a test suite for the code you just changed. |
| `document` | Writes the PR text, changelog, release note, or postmortem from the real diff. |
| `sync` | Keeps AGENTS.md, the scope, and spec statuses current after a change. |
| `debug` | Finds and fixes the root cause of a bug, then hands a regression test to `/test`. |

## Install

Uses [npx skills](https://github.com/vercel-labs/skills).

```bash
# Claude Code (installs into .claude/skills, then restart Claude Code)
npx skills@latest add HilarioNengareJr/atlas-skills -a claude-code

# Generic .agents/skills, read by Codex and other agents
npx skills@latest add HilarioNengareJr/atlas-skills
```

Works on any Agent Skills client (Claude Code, Cursor, Codex, Gemini CLI, and
[more](https://agentskills.io/clients)).

Each skill's instructions live in its `SKILL.md`, which is what every client
reads. The `agents/openai.yaml` beside it is interface metadata only.

## Where to start

**New product (greenfield):** `/scope` the idea, then `/architect` the stack,
then scaffold the project, then `/audit` to seed AGENTS.md from the real
project, then the feature loop.

**Existing codebase (brownfield):** `/audit` first so every skill understands
your project, then `/scope` the next slice, then the feature loop.

**Any single change:** run only what it needs. A bug goes straight to `/debug`.

## What gets written, and where

| Artifact | Path | Owner |
|---|---|---|
| Scope | `docs/scope/` | scope |
| Specs | `docs/specs/` | architect |
| Context files | AGENTS.md (plus a thin CLAUDE.md pointer) | audit, kept current by sync |
| Design system | `design.md` | develop |
| Review findings | `docs/reviews/` | check |
| Tests | your test dirs | test |
| App code | your source tree | develop |
| Human docs | PR body, CHANGELOG.md, `docs/releases/`, `docs/postmortems/` | document |

## Language support

The skills are stack neutral by design. `/test` ships framework guidance for
JavaScript and TypeScript (Vitest, Jest, Playwright), Python (pytest), Go, and
Rust. PHP is not yet covered.

## Credits

Based on the Engineering Workflow Skills by
[JavaScript Mastery](https://github.com/JavaScript-Mastery-Pro/skills),
which are published under the MIT licence.

Licensing for this pack is not yet settled. It stays private until it is.

Built with the [Agent Skills](https://agentskills.io) open format.
