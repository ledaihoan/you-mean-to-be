# Engineering Backlog — YouMeanToBe

> Summary index. Full acceptance criteria live in Plane issue descriptions.
> `plane issues get -p 160f99ff-c130-4caf-83c8-14361163ba7b <ID>` for detail.

---

## Phase 1 — Foundation: COMPLETE ✅

| # | Issue | Priority | Plane ID | Status |
|---|-------|----------|----------|--------|
| 1 | [INFRA] Next.js 14 scaffold + Tailwind | urgent | `b539bac0` | [x] |
| 2 | [INFRA] Docker Compose stack | urgent | `10d29611` | [x] |
| 3 | [INFRA] Nginx on port 7239 + Cloudflare | medium | `d0776dab` | [x] |
| 4 | [AUTH] better-auth email + Google OAuth | high | `60c9b148` | [x] |
| 5 | [CONTENT] MDX blog: 2 posts live | high | `b5da2848` | [x] |
| 6 | [SIM] Solar system — R3F + drei | high | `c00af32b` | [x] |
| 7 | [SIM] Galaxy — GLSL + Bloom | high | `a1d0566c` | [x] |
| 8 | [DEPLOY] ymtb.uplatepal.com live — smoke test | urgent | `3bd08124` | [x] |

---

## Phase 2 — Sim-First (A→B→C→D, CEO verified)

**Rule: CEO must verify content plan before building each sim.**

| # | Sim | Tech | Plane ID | Status | CEO Verified |
|---|-----|------|----------|--------|--------------|
| 10 | A: Physics — pendulum, gravity, waves | D3 + SVG + Canvas | `0ccf6645` | [x] | ✅ 2026-03-23 |
| 11 | B: Mathematics — function grapher, fractals | D3 + Canvas | `0ee4eccb` | [x] | ✅ 2026-03-25 |
| 12 | C: Nutrition — macro charts, meal builder | D3 | `ece1232c` | [ ] | ⏳ needs CEO |
| 13 | D: Earth ecosystem — biomes, food chain | R3F + D3 | `02b4f755` | [ ] | ⏳ needs CEO |

## How to Work an Issue

1. Read this index → find top unblocked item
2. `plane issues get -p 160f99ff-c130-4caf-83c8-14361163ba7b <ID>` → read full AC
3. Build against AC
4. Update status here + in Plane
5. Log in `cycle-status.md`
