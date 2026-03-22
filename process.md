# YouMeanToBe — Multi-Role Collaboration Process

> How CEO and Engineering collaborate across sessions using local summaries + Plane as source of truth.

---

## Collaboration Model

```
 CEO Session                          Engineering Session
 ┌─────────────┐                      ┌─────────────────┐
 │ loop-ceo.md │                      │ loop-eng.md     │
 └──────┬──────┘                      └────────┬────────┘
        │                                      │
        ▼                                      ▼
 Read cycle-status.md ◄──────────────► Read cycle-status.md
 Read engineering-backlog.md           Read engineering-backlog.md
        │                                      │
        ▼                                      ▼
 Accept / Reject work                  Pick top unblocked issue
 Make decisions on blockers            plane issues get <ID> → full AC
 Reprioritize backlog                  Build against AC
 Sync Plane states                     Ship + update local + Plane
 Set next sprint focus                 Report blockers
        │                                      │
        ▼                                      ▼
 Update cycle-status.md               Update cycle-status.md
 Update Plane                          Update Plane
 └──────────────────────────────────────────────┘
                    ▼
              Plane = remote truth
         Local files = summary index
```

---

## Roles

| Role | Responsibility | Loop prompt | When |
|------|---------------|-------------|------|
| **CEO** | Review, accept/reject, decide, prioritize | `loop-ceo.md` | Before eng session |
| **Engineering** | Pick, plan, build, ship, report | `loop-eng.md` | After CEO sets focus |

### Handoff Protocol

1. **CEO → Eng:** CEO updates `cycle-status.md` with sprint focus + decisions. Eng reads it.
2. **Eng → CEO:** Eng updates `cycle-status.md` session log with what was built + blockers. CEO reads it.
3. **Both sync Plane** so the remote board always reflects reality.

---

## Files — Local Summary Index

| File | What it is | Detail lives in |
|------|-----------|-----------------|
| `cycle-status.md` | Milestone tracker, decisions, session log | — (this IS the log) |
| `engineering-backlog.md` | Issue queue with deps + status checkboxes | Plane issue descriptions (full AC) |
| `loop-ceo.md` | CEO session startup prompt | — |
| `loop-eng.md` | Eng session startup prompt | — |
| `process.md` | This file — collaboration rules | — |
| `init_plan.md` | Original plan (read-only) | — |
| `CLAUDE.md` | Tech stack, architecture | — |

**Principle:** Local files are quick-reference summaries. Plane holds the detailed acceptance criteria per issue. Use `plane issues get -p <PROJECT> <ID>` to read full detail.

---

## Plane Remote

| Field | Value |
|-------|-------|
| Workspace | `miseos` |
| Project | You Mean To Be |
| Project ID | `160f99ff-c130-4caf-83c8-14361163ba7b` |
| CLI | `plane` |

### Env

```bash
export PLANE_API_KEY=plane_api_acec43c5339e4512a78fdaa0beed319f
export PLANE_WORKSPACE=miseos
export PLANE_BASE_URL=https://api.plane.so
```

### States

| State | ID | Who moves here |
|-------|----|----------------|
| Backlog | `0c1d70ed-2dab-432a-9c58-11d18cf01cb9` | CEO (park) |
| Todo | `d2d4a79c-7690-4d84-9f8a-ba97d80757ee` | CEO (planned) |
| In Progress | `a510ff2a-eb4e-49aa-b36c-37c8238f00e9` | Eng (picked up) |
| Done | `ff23964f-ab61-463e-aa6f-c2dcc65ace06` | Eng (shipped) → CEO (accepted) |
| Cancelled | `b037f044-ab2f-4901-a5cf-c83df31ded61` | CEO (descoped) |

### Cycle

| Cycle | ID | Dates |
|-------|----|-------|
| Phase 1 — Foundation | `ef2f68b0-169b-4005-8d85-eeaec6da6f5f` | 2026-03-22 → 2026-04-19 |

### Issues

| # | Issue | Priority | Plane ID |
|---|-------|----------|----------|
| 1 | [INFRA] Next.js 14 scaffold + Tailwind | urgent | `b539bac0-fafc-4417-af9b-2d365b8522ca` |
| 2 | [INFRA] Docker Compose stack | urgent | `10d29611-197c-445c-8a8f-8f80ae6cc3ce` |
| 3 | [INFRA] Nginx on port 8081 | medium | `d0776dab-97d6-4d8c-a84f-4e5ece8912a9` |
| 4 | [AUTH] better-auth email + Google OAuth | high | `60c9b148-dc43-4de7-ab06-2cad18ec4f95` |
| 5 | [CONTENT] MDX blog: 2 posts live | high | `b5da2848-e8c7-47ff-9dbd-54db90dcebd8` |
| 6 | [SIM] Solar system — R3F + drei | high | `c00af32b-0248-47bb-9670-c7e89d929021` |
| 7 | [SIM] Galaxy — GLSL + Bloom | high | `a1d0566c-1e84-4cf8-80a6-49a1539d3167` |
| 8 | [DEPLOY] Stack live on localhost:8081 | urgent | `3bd08124-a64b-47b2-9816-74db6d1a6428` |

### CLI Cheatsheet

```bash
P=160f99ff-c130-4caf-83c8-14361163ba7b

# List issues
plane issues list -p $P

# Read full acceptance criteria
plane issues get -p $P <ISSUE_ID>

# Move to In Progress (eng picks up)
plane issues update -p $P <ID> --state a510ff2a-eb4e-49aa-b36c-37c8238f00e9

# Move to Done (eng ships)
plane issues update -p $P <ID> --state ff23964f-ab61-463e-aa6f-c2dcc65ace06

# Move back to In Progress (CEO rejects)
plane issues update -p $P <ID> --state a510ff2a-eb4e-49aa-b36c-37c8238f00e9

# Create new issue
plane issues create -p $P --name "[AREA] Title" --priority high

# Change priority
plane issues update -p $P <ID> --priority medium
```

---

## Rules

### Sync: Local ↔ Plane

1. **Plane is truth** for issue state, priority, and acceptance criteria.
2. **Local is summary** — quick orientation, session log, decisions.
3. Every state change updates **both** local status + Plane.

### Issue Convention

- Name: `[AREA] Short description`
- Areas: `INFRA`, `AUTH`, `CONTENT`, `SIM`, `DEPLOY`, `FIX`, `REFACTOR`
- Priority: `urgent` (blocks launch), `high` (Phase 1), `medium` (not blocking), `low` (Phase 2+)

### Git

- Commit format: `[AREA] description`
- No secrets in git — `.env` + `.env.example`
- `npm run build` must pass before commit

### CEO Rules

- Review before reprioritizing
- Make decisions promptly — blockers stall eng
- Accept or reject explicitly, never leave items in limbo
- Add session log entry every loop

### Engineering Rules

- Read `cycle-status.md` first — CEO may have changed focus
- `plane issues get` for full AC before building
- Only work on top unblocked item unless CEO overrides
- If blocked, write blocker to `cycle-status.md` and stop
- Never skip AC — flag if something can't be done

---

## Progress Tracking

**Quick glance:** `plane issues list -p 160f99ff-c130-4caf-83c8-14361163ba7b`

**Session context:** Read `cycle-status.md` → Milestone Tracker + Session Log

**Full AC per issue:** `plane issues get -p 160f99ff-c130-4caf-83c8-14361163ba7b <ID>`

### Phase 1 Completion Gate

- All 8 issues in `Done` state in Plane
- Issue #8 smoke test passes
- CEO acceptance in `cycle-status.md` session log

---

## Self-Improvement Protocol

Each role reflects and improves the process at the end of every session.

### What to improve

| Area | Examples |
|------|---------|
| **Handoff clarity** | Eng report too vague → CEO adds reporting template. CEO focus too broad → Eng asks for specifics. |
| **Plane AC quality** | Eng couldn't build from AC → update issue description with more detail or examples. |
| **Process friction** | Too many steps → simplify. Missing step → add it. Wrong order → reorder. |
| **Local file usefulness** | Backlog stale → update. Deps wrong → fix. Missing context → add. |
| **Loop prompts** | Prompt missing a step → add it. Prompt has dead weight → trim it. |

### Rules

1. **Fix it now, not later.** If you see a problem, update the file in the same session.
2. **Both roles can edit any file.** CEO can improve `loop-eng.md`. Eng can improve `process.md`.
3. **Small, frequent improvements** beat big rewrites. One fix per loop compounds fast.
4. **Session log is the feedback channel.** Note what worked, what didn't, what changed.
5. **Plane stays canonical.** If AC or priority changes, update Plane first, then local summary.
