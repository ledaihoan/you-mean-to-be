# YouMeanToBe — Claude Code Configuration

## Project

**YouMeanToBe** is a universal life-growing platform — interactive education, community blog, and kid-safe media space. Sits between Substack (writing), Khan Academy (education), and a science museum (immersive simulation).

**Pillars:** Simulations · Open blogging · Kid zone · Healthy lifestyle · Community

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind |
| 3D Simulations | React Three Fiber + @react-three/drei + GLSL shaders |
| 2D Data Viz | D3.js |
| Auth | better-auth (runs inside Next.js, no extra container) |
| Database | PostgreSQL 17 (port 5433 via Tailscale) |
| Cache / Sessions | Redis 7 Alpine |
| Reverse Proxy | Nginx Alpine (port 8081 → Cloudflare Tunnel) |
| Deployment | Docker Compose (self-hosted, isolated from MiseOS k3s) |

**Infrastructure:** Home server (Xeon 2686v4, 32 GB RAM). Budget: 2 CPU cores, 4 GB RAM total. Cloudflare Tunnel for public HTTPS.

**Test command:** `npm run test` (Jest / testing-library — set up in Phase 1)

**Build command:** `npm run build`

**Dev command:** `npm run dev`

**Docker:** `docker compose up -d` / `docker compose logs -f app`

---

## Plane Integration

```
Workspace:   miseos
Project:     You Mean To Be
Project ID:  160f99ff-c130-4caf-83c8-14361163ba7b

CLI:         plane <command>
Env:         PLANE_BASE_URL=https://api.plane.so
             PLANE_API_KEY=plane_api_acec43c5339e4512a78fdaa0beed319f
             PLANE_WORKSPACE=miseos
```

**Plane project shorthand (use in all commands):** `YMTB_PROJECT=160f99ff-c130-4caf-83c8-14361163ba7b`

---

## Development Phases

### Phase 1 — Foundation (current)
- [ ] Next.js 14 scaffold + Tailwind
- [ ] Docker Compose: Next.js + Postgres 17 + Redis + Nginx
- [ ] Cloudflare Tunnel → port 8081
- [ ] better-auth: email/password + Google OAuth
- [ ] MDX blog: 2 posts live
- [ ] Solar system scene (R3F + drei)
- [ ] Galaxy scene (R3F + ShaderMaterial GLSL)
- [ ] youmeantobe.io live

### Phase 2 — Platform (weeks 5–12)
- User profiles, Earth/Physics/Math/Nutrition simulations, D3 charts, Kid zone v1, SEO

### Phase 3 — Community (weeks 13–24)
- Newsletter, Economics sim, courses, coaching, community posts, analytics

---

## Simulation Architecture

**Approach:** `PointsMaterial (beginner) → ShaderMaterial + GLSL (cinematic)`

Key GLSL techniques:
- `uTime` uniform for animation
- `vColor` varying for star color gradients
- `gl_PointSize` for distance scaling
- `distance(gl_PointCoord, vec2(0.5))` to discard square corners
- `THREE.AdditiveBlending` + `@react-three/postprocessing` Bloom

---

## Kid Zone

- YouTube Data API v3, server-side channel allowlist
- Session timer (15/30/60 min), PIN lockout
- Redis cache for YouTube responses (TTL 1hr, stays within 10K units/day quota)

---

## Docker Services

| Service | RAM | CPU | Notes |
|---|---|---|---|
| app (Next.js) | 512 MB | 1.5 | Port internal only |
| postgres | 512 MB | 0.5 | Port 5433 (Tailscale only) |
| redis | 128 MB | 0.25 | Internal |
| nginx | 64 MB | 0.25 | Port 8081 → Cloudflare |

---

## Skills Available

### Owner Skills (project-specific, run these first)

| Skill | When to use |
|---|---|
| `/owner` | Start of session — research project state, sync plan → Plane, identify priorities |
| `/loop` | Main dev cycle: pick issue → plan → build → ship → update Plane → repeat |

### Planning Skills (from gstack)

| Skill | When to use | Relevance |
|---|---|---|
| `/office-hours` | Problem reframing before implementation, design docs | HIGH — use before each major feature |
| `/plan-eng-review` | Architecture and test planning | HIGH — required before building |
| `/plan-ceo-review` | Scope and product validation | MEDIUM — use for Phase boundary decisions |

### Execution Skills (from gstack)

| Skill | When to use | Relevance |
|---|---|---|
| `/review` | Code quality audit | HIGH — run before /ship |
| `/investigate` | Root-cause debugging | HIGH — use instead of guessing |
| `/ship` | PR creation + test + version + CHANGELOG | HIGH — use to ship features |

### Testing Skills (from gstack)

| Skill | When to use | Relevance |
|---|---|---|
| `/qa` | Browser testing (after UI features ship) | MEDIUM — Phase 1 end |

### Safety Skills (from gstack)

| Skill | When to use | Relevance |
|---|---|---|
| `/careful` | Before destructive DB ops, Docker restarts | LOW (use manually) |
| `/freeze` | Lock edits to specific scope | LOW (use manually) |
| `/guard` | Combined careful + freeze | LOW (use manually) |

### Reflection Skills (from gstack)

| Skill | When to use | Relevance |
|---|---|---|
| `/retro` | Weekly retrospective | HIGH — end of each phase sprint |

### Deployment Skills (from gstack)

| Skill | When to use | Relevance |
|---|---|---|
| `/land-and-deploy` | Merge + production verify | MEDIUM — self-hosted, custom deploy |

### Not Yet Relevant

- `/codex` — requires OpenAI API key
- `/benchmark` — Phase 2+
- `/design-consultation` — useful once design system started
- `/canary` — post-deploy monitoring, Phase 2+
- `/browse` — browser automation, Phase 1 end

---

## The Loop Process

```
/owner          → research state, sync plan → Plane
    ↓
/office-hours   → frame the next feature (design doc)
    ↓
/plan-eng-review → architecture + test plan
    ↓
  BUILD          → implement
    ↓
/review         → code quality check
    ↓
/ship           → tests + PR + version + CHANGELOG + Plane update
    ↓
/retro          → weekly metrics (end of sprint)
    ↓
  LOOP ↑
```

---

## Plane Workflow Convention

- **Backlog** → issues not yet started
- **In Progress** → actively building
- **Done** → shipped to branch + PR opened

When creating Plane issues from the plan:
- Use Phase labels (Phase 1, Phase 2, Phase 3)
- Priority: urgent (blocks launch), high (Phase 1), medium (Phase 2), low (Phase 3+)
- Name format: `[AREA] Short description` e.g. `[INFRA] Docker Compose stack setup`

---

## Key Decisions

- **No separate auth container** — better-auth runs inside Next.js
- **No own streaming** — YouTube API with server-side allowlist only
- **No paid courses MVP** — Phase 3+
- **Static assets** — Cloudflare CDN cache, `Cache-Control: public, max-age=31536000, immutable` on `/public/**`
- **Three.js** — always `dynamic import()` per simulation, never in root bundle
- **Postgres** — daily `pg_dump` to Backblaze B2 for backup

---

## Open Questions

- [ ] Domain confirmed as `youmeantobe.io`?
- [ ] Cloudflare Tunnel: new tunnel or new hostname on existing MiseOS tunnel?
- [ ] Postgres 17: share with MiseOS or separate instance?
- [ ] Phase 3 coaching: Cal.com embed or custom booking?
- [ ] Newsletter: Resend vs self-hosted Listmonk?
- [ ] Analytics: Plausible cloud vs self-hosted?
