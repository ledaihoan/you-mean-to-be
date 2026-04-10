# YouMeanToBe — Project Status

> Last updated: 2026-03-30
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

## Phase 2 — Sim-First Order (CEO approved: E→D→F, 2026-03-26)

**Rule: Content plan must be verified by CEO before building each sim.**

| # | Sim | Tech | Plane ID | Status | Content Plan |
|---|-----|------|----------|--------|--------------|
| 10 | A: Physics — pendulum, gravity, waves | D3 + SVG + Canvas | `0ccf6645` | **Done ✅** | CEO verified 2026-03-23 |
| 11 | B: Mathematics — function grapher, fractals | D3 + Canvas | `0ee4eccb` | **Done ✅** | CEO verified 2026-03-25 |
| 12 | C: Nutrition — macro charts, meal builder | D3 | `ece1232c` | **Done ✅** | CEO verified 2026-03-26 |
| 14 | E: Atomic World — empty space, electric self | D3 + Canvas | `914f4f0e` | **Done ✅** | CEO verified 2026-03-26 |
| 13 | D: Earth ecosystem — biomes, food chain | R3F + D3 | `02b4f755` | **Done ✅** | CEO verified 2026-03-26 |
| 15 | F: Brain & Consciousness — prediction machine | D3 + Canvas | `3a19e921` | **Done ✅** | CEO verified 2026-03-26 |

**Phase 2 Theme Arc:**
A→B→C→E→D→F = "Understanding Nature from Cosmos to Consciousness"
- Physics: forces and motion | Math: patterns and structure | Nutrition: energy and metabolism
- **Atomic: why matter feels solid** | Earth: why life exists | Brain: why you exist

**Phase 2 COMPLETE (2026-04-03).** 6 sims in ~2 weeks (~3.5 sims total since 03-23). ~4200 LOC total. 18 blog posts. 4 age collections. 8 simulations. Key lesson: QA on branch before merging catches missing AC early.

**Phase 2 retro (2026-03-26):** 3 sims in 4 days (~1 sim/day). ~2000 LOC simulation code. 9 blog posts shipped. Key lesson: QA on branch before merging catches missing AC early.

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

## Phase 3 — Community (planned, not started)

| # | Issue | Priority | Plane ID | Status |
|---|-------|----------|----------|--------|
| 16 | User profiles (bio, avatar, saved posts) | high | — | [ ] |
| 17 | Community posts / reactions | medium | — | [ ] |
| 18 | SEO (sitemap.xml, og:image, robots.txt) | medium | — | [ ] |

**Depends on:** #16 (user profiles unblocks community + auth context)

## Current Sprint Focus

**Phase 3 starting.** #16 User Profiles first (unblocks #17 + #18). Check existing auth schema first, then design page.

**Last session (2026-04-03):** Phase 2 complete — all 6 sims + collections deployed.

## Decisions Made

- [x] **Domain:** `ymtb.uplatepal.com` (Phase 1), upgrade to `youmeantobe.com` at Phase 1 end
- [x] **Tunnel:** Existing MiseOS Cloudflare Tunnel — port 7239 for Nginx, port 7139 for Next.js local dev
- [x] **Postgres:** Separate instance, exposed on port 5433 via Tailscale for laptop management
- [x] **Port mapping:** Nginx=7239 (external), Next.js=7139 (local dev), Postgres=5433 (Tailscale)
- [x] **Platform model:** Free sims + blog → Paid courses (deep dives + coaching + project-based)
- [x] **Phase 2 sim order:** E→D→F (Atomic → Earth → Brain, per CEO 2026-03-26)
- [x] **Phase 3 priority:** User profiles + community (after Phase 2 sims complete)

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
| 2026-03-25 | CEO session: Accepted Physics (#10) — all AC met. Verified Math content plan (#11) — updated Plane issue with expanded plan. Theme: "The Math Behind Nature's Design." 3 blog posts: Fibonacci/Golden Ratio, Fractals in biology, Fourier transform in the brain. 3 demos: function grapher, Fibonacci spiral explorer, Mandelbrot zoomer. Plane #11 → Todo. Eng unblocked. | **Eng: build Math sim #11** |
| 2026-03-26 | Phase 2B Math complete. Built MathScene.tsx (628 lines, 4 demos): Function Grapher (sine/cos/poly/exp, canvas+D3 axes), Fibonacci Spiral (animated golden spiral, φ convergence), Mandelbrot (click-to-zoom, HSL color gradient), Fourier Waveform (harmonic stacker, animated). 3 blog posts: Fibonacci-Nature (φ in sunflowers), Fractals-Lungs (fractal dimension in biology), Fourier-Brain (cochlear frequency analysis). Homepage updated with Math card. Build passes. Tests pass (2/2). Merged to main. Docker deployed. 9/9 routes 200. Plane #11 → Done. | **CEO verify Nutrition content plan → #12** |
| 2026-03-26 | CEO session: Accepted Math #11 ✅. Verified Nutrition #12 — expanded from 1 post/sim to 3 posts/3 demos. Theme: "What You Are Is What You Ate." Posts: Slow Fire (metabolism/ATP), Hormone Orchestra (leptin/ghrelin/insulin), Soil to Cell (autotrophy/heterotrophy + energy transfer). Verified Earth #13 — theme expanded to "Why Life Exists." Posts: Goldilocks Accident (rare Earth conditions), Carbon Chain (why carbon won), Energy Gradient (why life is a process not a thing). Created Phase 2E #14 Atomic World — empty space, electric self (why touch feels solid), four forces. Created Phase 2F #15 Brain — prediction machine (free energy), narrative self (DMN), time perception. All content plans in Plane with full AC. Phase 2 arc: A→B→C→D→E→F = "Understanding Nature: Cosmos to Consciousness." Eng unblocked on Nutrition #12. | **Eng: build Nutrition sim #12** |
| 2026-03-26 | Phase 2C Nutrition complete. Built NutritionScene.tsx (700+ lines, 3 demos): Macro Calculator (BMR/TDEE with Mifflin-St Jeor, D3 pie+bar charts), Meal Builder (28-food database, D3 stacked bar+pie charts), Energy Pyramid (trophic levels with D3 pyramid+Sankey). 3 blog posts (700+ words each): metabolism-fire (ATP/mitochondria), hunger-hormones (leptin/ghrelin/insulin/cortisol), soil-to-cell (autotrophy/heterotrophy/10% rule). Homepage updated with Nutrition sim card. Build passes (24/24 pages). Tests pass (2/2). Pushed to main. Docker rebuilt and redeployed. 9/9 routes 200. Plane #12 → Done. | **CEO: verify Earth #13 content plan → Earth sim** |
| 2026-03-26 | Retro + roadmap session. 12/15 Plane issues done. Velocity: ~1 sim/day. New decisions: platform = free sims+blog + paid courses (deep dives + coaching + projects); Phase 2 sim order changed to E→D→F; Phase 3 priority = user profiles + community. Updated cycle-status.md + engineering-backlog.md with new roadmap. | **Eng: build Atomic World #14 (next)** |
| 2026-03-29 | Phase 2E Atomic World complete. Built AtomicScene.tsx (~800 LOC, 3 demos): Scale Journey (7 scales, D3 log chart), Force Field (Canvas+D3 field lines, click charges), Solidity Explainer (Pauli exclusion, D3 mechanoreceptor chart). 3 blog posts (empty-space, electric-self, four-forces). Homepage updated with Atomic card. Build: 25 routes 0 errors. Tests: 2/2 pass. Docker: 11/11 routes 200. Plane #14 → Done. | **Next: Earth #13 or CEO verify next priorities** |
| 2026-03-30 | Phase 2D Earth ecosystem complete. Built EarthScene.tsx (~750 LOC, 3 demos): Biome Explorer (R3F 3D globe, 8 biomes, click-to-info, climate slider), Food Chain Web (D3 directed graph, 10 species, species removal cascade), Ecosystem Balance (D3 Lotka-Volterra predator-prey, 6 param sliders, real-time animation). 3 blog posts (goldilocks-accident 700 words, carbon-chain-life 700 words, energy-gradient-life 700 words). Homepage updated with Earth card. Build: 25 routes 0 errors. Tests: 2/2 pass. Docker: 11/11 routes 200. Plane #13 → Done. | **Next: Brain #15** |
| 2026-04-03 | Collections feature complete: Age-based content organization (Explorers/Discoverers/Investigators/Deep Divers), AgeGroupCard + ArticleCard + DifficultyBadge components, /collections + /collections/[ageGroup] routes with category filters. All 17 posts tagged with ageGroup/category/difficulty frontmatter. Homepage redesigned. Fix: intro-to-glsl-shaders.mdx missing coverColor. Build: 37 routes 0 errors. Committed to feature/collections-age-groups. | **Next: Brain #15** |
| 2026-04-03 | Phase 2F Brain & Consciousness complete. Built BrainScene.tsx (~910 LOC, 3 demos): Prediction Engine (hidden pattern challenge, D3 line chart accuracy tracker), Self Constructor (brain cross-section with 5 labeled regions, mental state slider), Time Perception Lab (interval estimation with 3 conditions, D3 box plot). 3 blog posts (brain-predicts-reality 700 words, self-as-story 700 words, time-flows-doesnt 700 words). Homepage updated: sim strip expanded to 8 sims, article count to 20. Build: 41 routes 0 errors. Tests: 2/2 pass. Plane #15 → Done. All Phase 2 sims complete (A→B→C→E→D→F). | **Phase 2 complete — prepare PRs for review** |
| 2026-04-09 | Eng session: reviewed state — 15/15 Plane issues Done, build passes 41 routes 0 errors. Feature branches (brain, collections) already merged to main. Clean working tree. Updated cycle-status.md: Phase 3 section already present. better-auth stores user name/email/image in sessions table (extends PostgreSQL). Next: design + build #16 User Profiles (bio, avatar, saved posts). | Build #16 User Profiles |
