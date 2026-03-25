# YouMeanToBe — Project Status

> Last updated: 2026-03-25
> Plane project: You Mean To Be (`160f99ff-c130-4caf-83c8-14361163ba7b`)
> Target: ymtb.uplatepal.com live by 2026-04-19 → youmeantobe.com upgrade at Phase 1 end
> Phase 1 Cycle: `ef2f68b0-169b-4005-8d85-eeaec6da6f5f` (2026-03-22 → 2026-04-19)

---

## Phase 1 — Foundation: COMPLETE ✅

| # | Issue | Status | Plane ID | Notes |
|---|-------|--------|----------|-------|
| 1 | [INFRA] Next.js 14 scaffold + Tailwind | Done | `b539bac0` | |
| 2 | [INFRA] Docker Compose stack | Done | `10d29611` | |
| 3 | [INFRA] Nginx on port 7239 + Cloudflare | Done | `d0776dab` | Manual CF binding remains |
| 4 | [AUTH] better-auth email + Google OAuth | Done | `60c9b148` | |
| 5 | [CONTENT] MDX blog: 2 posts live | Done | `b5da2848` | |
| 6 | [SIM] Solar system — R3F + drei | Done | `c00af32b` | |
| 7 | [SIM] Galaxy — GLSL + Bloom | Done | `a1d0566c` | |
| 9 | [DEPLOY] smoke test | Done | `3bd08124` | |

---

## Phase 2 — Sim-First Order (CEO approved: A→B→C→D)

**Rule: Content plan must be verified by CEO before building each sim.**

| # | Sim | Tech | Plane ID | Status | Content Plan |
|---|-----|------|----------|--------|--------------|
| 10 | A: Physics — pendulum, gravity, waves | D3 + matter.js | `0ccf6645` | **Done ✅** | CEO verified 2026-03-23 |
| 11 | B: Mathematics — function grapher, fractals | D3 | `0ee4eccb` | Todo | CEO verification needed |
| 12 | C: Nutrition — macro charts, meal builder | D3 | `ece1232c` | Todo | CEO verification needed |
| 13 | D: Earth ecosystem — biomes, food chain | R3F + D3 | `02b4f755` | Todo | CEO verification needed |

**Remaining Phase 1 tech debt (non-blocking):**
- Cloudflare: bind ymtb.uplatepal.com → :7239 (manual dashboard step)
- Google OAuth: real credentials in .env
- SEO: sitemap.xml + og:image

## Execution Order (critical path)

```
#1 Scaffold  ──┬──→ #2 Docker Compose ──→ #3 Tunnel ──→ #8 Live
               ├──→ #4 Auth
               ├──→ #5 MDX Blog
               └──→ #6 Solar System ──→ #7 Galaxy
```

## Current Sprint Focus

**Next up:** CEO verify Math content plan → Math sim (issue #11)

## Decisions Made

- [x] **Domain:** `ymtb.uplatepal.com` (Phase 1), upgrade to `youmeantobe.com` at Phase 1 end
- [x] **Tunnel:** Existing MiseOS Cloudflare Tunnel — port 7239 for Nginx, port 7139 for Next.js local dev
- [x] **Postgres:** Separate instance, exposed on port 5433 via Tailscale for laptop management
- [x] **Port mapping:** Nginx=7239 (external), Next.js=7139 (local dev), Postgres=5433 (Tailscale)

## Session Log

| Date | What happened | What's next |
|------|---------------|-------------|
| 2026-03-22 | Plan created, 8 issues synced to Plane. CEO decisions: domain=youmeantobe.com (not bought yet), existing tunnel on 8081, separate Postgres on 5433 via Tailscale. Cycles enabled, Phase 1 cycle created. | Start #1 scaffold |
| 2026-03-22 | Built #1 scaffold — Next.js 14 App Router + TypeScript + Tailwind, 820 packages, npm build + test pass. Restored all docs. | Start #2 Docker Compose |
| 2026-03-22 | Built #2 Docker Compose — 4 services (app, postgres, redis, nginx), multi-stage Dockerfile, nginx config, .env.example. Config validates. Docker build running. | Start #4 auth + #6 Solar |
| 2026-03-22 | Built #5 MDX blog + #6 Solar System. Blog: next-mdx-remote, 2 posts live, listing + post pages. Solar: R3F + drei, 8 planets, click-to-info overlay. Build + test pass. | Start #7 Galaxy |
| 2026-03-22 | Built #7 Galaxy GLSL + #4 better-auth. Galaxy: custom GLSL shaders, AdditiveBlending, Bloom, spiral arms, interactive sliders. Auth: better-auth v1, Kysely/Postgres, sign-in/up pages, Google OAuth. All 11 pages build successfully. | Start #3 tunnel + #8 smoke test |
| 2026-03-22 | Pushed commits f18e8fb + 7e1e627 to origin/main. Updated #3 Nginx in Plane → Done. Code: nginx/default.conf + docker-compose nginx service on port 7239. Remaining: Cloudflare tunnel manual binding (dashboard task). Build verified: 11 routes, 0 errors. | #8 smoke test — needs Cloudflare + .env |
| 2026-03-23 | Phase 1 complete! Fixed Docker naming bug (nginx proxy → ymtb-app), added /api/health route. Created .env with secure secrets. Docker Compose up: all 4 containers healthy. Smoke test: 9/9 routes HTTP 200. Plane #9 → Done. Commits da95d53 + c2c2ec9 pushed. | **Phase 1 done** — ready for Phase 2 planning |
| 2026-03-23 | CEO decision: sim-first (A→B→C→D), content plan must be verified before building each sim. Created Phase 2 Plane issues: Physics (0ccf6645), Math (0ee4eccb), Nutrition (ece1232c), Earth (02b4f755). Resources saved: Three.js Journey, Stemkoski, varun.ca, twigl.app. Galaxy scene: uniform rotation is fine but could upgrade to differential per lesson 30. | **Next: present Physics content plan for CEO verification** |
| 2026-03-23 | Phase 2A Physics complete. QA'd existing implementation on branch sim/physics-simulation. Found Docker image was 17h old (pre-physics). Rebuilt and redeployed. All 7 routes return HTTP 200. Plane #10 → Done. Build passes, tests pass (2/2). Docker fully live. | **Next: CEO verify Math content plan → Math sim** |
| 2026-03-25 | Eng agent session: QA'd Physics on branch — found 3 missing AC items (D3 period chart, phase space plot, energy bar). Added all 3. Merged sim/physics-simulation → main. Deployed Docker. All 9 routes 200. Physics sim now fully meets AC. Plane #10 already marked Done. | **Blocked: CEO verify Math content plan → Math sim #11** |
| 2026-03-25 | Galaxy performance fix: NormalBlending (was AdditiveBlending), remove mipmapBlur, default 20K→8K particles, cap DPR at 1.5, clamp point size at 40px, GPU tier detection, antialias off, enable damping. Build passes. Pushed to main. Plane env vars fixed in bashrc (moved before interactive guard). Plane CLI verified working. | **CEO verify Math content plan → Math sim #11** |
