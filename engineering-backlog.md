# Engineering Backlog — Phase 1 Foundation

> Summary index. Full acceptance criteria live in Plane issue descriptions.
> `plane issues get -p 160f99ff-c130-4caf-83c8-14361163ba7b <ID>` for detail.

---

## Execution Queue (ordered by dependency)

| # | Issue | Priority | Depends on | Plane ID | Status |
|---|-------|----------|------------|----------|--------|
| 1 | [INFRA] Next.js 14 scaffold + Tailwind | urgent | — | `b539bac0` | [x] |
| 2 | [INFRA] Docker Compose stack | urgent | #1 | `10d29611` | [x] |
| 3 | [INFRA] Nginx on port 7239 + Cloudflare | medium | #2 | `d0776dab` | [x] |
| 4 | [AUTH] better-auth email + Google OAuth | high | #1 + #2 | `60c9b148` | [x] |
| 5 | [CONTENT] MDX blog: 2 posts live | high | #1 | `b5da2848` | [x] |
| 6 | [SIM] Solar system — R3F + drei | high | #1 | `c00af32b` | [x] |
| 7 | [SIM] Galaxy — GLSL + Bloom | high | #1, after #6 | `a1d0566c` | [x] |
| 8 | [DEPLOY] Stack live on localhost:8081 | urgent | ALL | `3bd08124` | [ ] |

## Critical Path

```
#1 Scaffold  ──┬──→ #2 Docker ──→ #3 Nginx ──→ #8 Live
               ├──→ #4 Auth (needs #2)
               ├──→ #5 MDX Blog
               └──→ #6 Solar ──→ #7 Galaxy
```

## How to Work an Issue

1. Read this index → find top unblocked item
2. `plane issues get -p 160f99ff-c130-4caf-83c8-14361163ba7b <ID>` → read full AC
3. Build against AC
4. Update status here + in Plane
5. Log in `cycle-status.md`
