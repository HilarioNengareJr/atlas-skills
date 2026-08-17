# Atlas Skills

Nine skills that form one engineering pipeline. Each one owns a narrow slice of the work and a narrow set of files, and refuses to touch the rest. That refusal is the point: the boundaries are what stop two skills fighting over the same file, and they are written into every `SKILL.md` under `skills/`.

This README is the map. It says what each skill owns, where every artifact gets written, and where one skill stops and sends you to another.

## The pipeline

The spine runs left to right. The tail after `/develop` is not fixed: it is gated by the workflow tier (see below).

```
/scope    →    /architect    →    /develop    →    [ tier gated tail ]    →    /sync
what to        decide it,         build it                                     close the loop
build          write the spec

                                  tail, by tier:
                                  /check verify  →  /test  →  /check review  →  /document

/audit          writes the AGENTS.md context every later skill reads
/debug          enters any time something breaks
```

`/audit` is the context bootstrapper, and where it belongs depends on the project. On an existing codebase, run it before anything else so the rest of the pipeline has something true to read. On a new project it is **not** the first step: it runs after `/architect` has picked the stack and you have scaffolded, because before that there is nothing real to write down. It is not a once per project job either. You can point it at a single area later (`/audit src/auth`) or run it again to fill gaps in an `AGENTS.md` that already exists.

`/sync` runs last, around merge, and reconciles that durable knowledge against what the repo now shows. `/debug` is not a stage at all, it is what you reach for when a test fails or `/check verify` finds a failure.

## Who owns what

Owns means this skill is the only one that may create or edit that artifact's content. It does not mean sole writer: a few skills make narrow surgical edits to files they do not own, and those are in the `Also touches` column.

| Skill | Owns | Also touches | Never |
|---|---|---|---|
| `/scope` | `docs/scope/`, the living feature scope | nothing | specs, code, `AGENTS.md`, and it never picks a tool, library, or provider |
| `/architect` | `docs/specs/`, spec content plus its evidence in `rationale.md` | the matching scope feature, updating it to the ready to build shape once a spec is confirmed | code, `AGENTS.md`, `CLAUDE.md`, and it never advances a feature linked spec's status |
| `/develop` | app code, plus CSS and tokens for UI | the scope (feature status, milestone boxes, code pointer), and one spec `**Status**:` line | spec content, deliberating a decision, restructuring root `AGENTS.md`, moving a spec out of `Assumed` |
| `/test` | test files, and `test-preferences.json` at the project root | nothing | application code, `AGENTS.md`, `CLAUDE.md` |
| `/check` | `docs/reviews/`, findings from `review` mode | nothing; `verify` mode writes no durable files at all | editing code, in either mode |
| `/debug` | the minimal code fix for a proven root cause | may write a failing then passing test inline when that is the fastest proof | features, unrelated refactors, rewriting the spec |
| `/document` | PR text, `CHANGELOG.md`, `docs/releases/`, `docs/postmortems/` | nothing | code, tests, specs |
| `/audit` | root and nested `AGENTS.md`, and the `CLAUDE.md` pointers | nothing | specs, scope, and any maintenance after a change |
| `/sync` | maintaining existing `AGENTS.md` files, creating a nested one for an area net new in this change, spec `**Status**:` lines, scope reconciliation | adds a pointer to `design.md` when a change establishes one | creating or restructuring root `AGENTS.md`, editing spec content, adding or reordering scope features, overwriting curated prose |

## Where things get written

The same map, looked up by file instead of by skill.

| Path | Written by |
|---|---|
| `AGENTS.md` (root) | `/audit` creates and restructures, `/sync` maintains |
| `<area>/AGENTS.md` | `/audit`, or `/sync` when the area is net new in this change |
| `CLAUDE.md` | `/audit`. It is only a pointer to `AGENTS.md`, never content |
| `docs/scope/` | `/scope` owns it, `/develop` and `/sync` advance statuses inside it |
| `docs/specs/` | `/architect` owns content, `/develop` and `/sync` touch the `**Status**:` line only |
| `docs/reviews/` | `/check review` |
| `docs/releases/` | `/document` |
| `docs/postmortems/` | `/document` |
| `CHANGELOG.md` | `/document` |
| `test-preferences.json` | `/test` |
| test files | `/test` |
| app code | `/develop`, and `/debug` for a minimal root cause fix |

`AGENTS.md` is the canonical context file and it is tool agnostic. `CLAUDE.md` is only a pointer to it.

## Workflow tier

One rigor dial per feature. It decides what runs after `/develop` and which stage is allowed to mark a feature `done`.

| Tier | What runs after `/develop` | What closes `done` |
|---|---|---|
| `Prototype` | nothing, you rely on `/develop`'s own build time self check | `/develop` |
| `Alpha` | `/check verify` | `/check verify` |
| `Beta` | `/check verify`, then `/test` | `/test` |
| `GA` | `/check verify`, `/test`, then a fresh model `/check review` and `/document` | `/test` |

Set one project default on the scope header's `**Workflow:**` line. Override a single feature with a tag beside its heading, like `· GA`. No tag means it inherits the default. The tier also pushes design time: a higher tier makes a feature more likely to need a spec, and the spec's cross model decision critic runs automatically at `Beta` and `GA`.

## Status lifecycles

Two of them, and they advance separately.

**Feature status**, in `docs/scope/`:

`planned` → `in-progress` → `done`

`/scope` writes the initial status. New features start `planned`. Brownfield work already in the codebase is enrolled as `existing` or `in-progress`. `/develop` advances the pipeline built work, and `/sync` reconciles it against repo evidence. Two statuses sit outside the flow: `existing` means it predates the workflow, so `/develop` and `/sync` never touch those rows, and `dropped` means `replan` removed it from scope but kept the row for history.

**Spec status**, in `docs/specs/`:

`Proposed` → `In Progress` → `Accepted`

Which skill advances it depends on whether a scope feature links the spec, meaning a `docs/scope/` row whose `spec` cell points at it.

- **Feature linked spec.** The status mirrors the feature. `/architect` creates it as `Proposed` and owns its content, but never advances the status. `/develop` moves it to `In Progress` when the feature goes `in-progress`, then to `Accepted` once the feature is built and verified. A spec is not `Accepted` until its feature ships.
- **Standalone decision spec.** A foundational, stack, or cross cutting standard that no scope row links. The status tracks the decision, not a build: `Proposed` when written, `Accepted` the moment you ratify it on confirmation. `/develop` never touches it.

A spec written for work that already shipped is born `Accepted`.

`/sync` reconciles the `**Status**:` line to match the feature, and nothing else.

**Assumed is the exception.** When you choose to build before a decision is made, `/develop` may create a spec in `Status: Assumed`, recording only the assumption itself: the decision owed, what you built on, who authorized it, the code area, and requirement seeds. That spec never leaves `Assumed` during the build. Only `/architect` can ratify it. It does not block the feature reaching `done`, it just stays visible as decision debt until someone clears it.

## Repo conventions

Every skill is a directory under `skills/` with a `SKILL.md` plus whatever supporting files it needs. The supporting directories vary by skill: `agent-modes/`, `agents/`, `approaches/`, `flow/`, `internal/`, `modes/`, `patterns/`, `templates/`, `ui/`.

Two things are consistent across all nine:

- **The same output style block.** Every `SKILL.md` carries a byte identical `OUTPUT-STYLE` block. It asks for plain language, the reader addressed as `you`, and no dash or hyphen used as punctuation. Literal values that other skills match on, like `in-progress` or `release-note`, keep their hyphens.
- **`agents/openai.yaml`.** Every skill ships one, so the pipeline is not tied to a single agent tool.
