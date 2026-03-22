# YouMeanToBe — Project Planning Document
> Universal Life Growing Platform · v0.1 · 2026

---

## 1. Vision & Goals

YouMeanToBe is a universal life-growing platform — part interactive education, part community blog, part kid-safe media space. It sits between Substack (writing), Khan Academy (education), and a science museum (immersive simulation), with a fresh, healthy aesthetic rooted in self-growth.

### Core pillars

- **Simulations** — cosmos, solar system, galaxy, physics, math, economics, nutrition, Earth ecosystem
- **Open blogging** — free-first, formal yet human, tutorial writing that doubles as personal brand
- **Kid zone** — curated YouTube content, time control, PIN lockout, age-appropriate filtering
- **Healthy lifestyle** — nutrition tracking, lifestyle education, science-backed wellness
- **Community** — Substack-like feeds, later expandable to courses and 1-on-1 coaching

### Non-goals (MVP)

- Paid courses — phase 3+
- Mobile app — web-first, responsive
- Social features (comments, likes) — phase 2+
- Video CDN / own streaming — YouTube API with filtering only

---

## 2. Platform Architecture

### Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR, routing, MDX blog |
| 3D Simulations | React Three Fiber + @react-three/drei | Galaxy, cosmos, physics viz |
| 2D Data Viz | D3.js | Nutrition charts, economic graphs, math curves |
| Auth | better-auth | Sessions, OAuth — runs inside Next.js, no extra container |
| Database | PostgreSQL 17 | All persistent data — users, posts, playlists, profiles |
| Cache / Sessions | Redis 7 (Alpine) | Session store, rate limiting, cache |
| Reverse Proxy | Nginx (Alpine) | Route traffic, static asset serving |
| Tunnel | Cloudflare Tunnel | Public HTTPS, no port forwarding needed |
| Deployment | Docker Compose (self-hosted) | Isolated from MiseOS k3s cluster |

### Infrastructure context

Runs on home server (Xeon 2686v4, 32 GB RAM) alongside MiseOS k3s cluster. Completely isolated in its own Docker Compose stack with a separate bridge network. Exposed via Cloudflare Tunnel — new hostname on existing tunnel pointing to Nginx port `8081`.

> **Resource budget:** 2 CPU cores, 4 GB RAM total. Postgres exposed on port `5433` via Tailscale for laptop management.

### Docker Compose services

| Service | Image | RAM | CPU | Notes |
|---|---|---|---|---|
| app | custom Next.js build | 512 MB | 1.5 | SSR + API routes + better-auth |
| postgres | postgres:17-alpine | 512 MB | 0.5 | Port 5433 via Tailscale only |
| redis | redis:7-alpine | 128 MB | 0.25 | Sessions + cache |
| nginx | nginx:alpine | 64 MB | 0.25 | Port 8081 → Cloudflare |

```yaml
# docker-compose.yml (skeleton)
networks:
  ymtb_net:
    driver: bridge

services:
  app:
    build: ./app
    container_name: ymtb_app
    restart: unless-stopped
    networks: [ymtb_net]
    deploy:
      resources:
        limits: { cpus: '1.5', memory: 512M }

  postgres:
    image: postgres:17-alpine
    container_name: ymtb_postgres
    restart: unless-stopped
    networks: [ymtb_net]
    ports:
      - "127.0.0.1:5433:5432"   # Tailscale-only, never public
    volumes:
      - ymtb_pgdata:/var/lib/postgresql/data
    deploy:
      resources:
        limits: { cpus: '0.5', memory: 512M }

  redis:
    image: redis:7-alpine
    container_name: ymtb_redis
    restart: unless-stopped
    networks: [ymtb_net]
    deploy:
      resources:
        limits: { cpus: '0.25', memory: 128M }

  nginx:
    image: nginx:alpine
    container_name: ymtb_nginx
    restart: unless-stopped
    networks: [ymtb_net]
    ports:
      - "8081:80"
    deploy:
      resources:
        limits: { cpus: '0.25', memory: 64M }

volumes:
  ymtb_pgdata:
```

> **Static assets**: Three.js / D3 bundles served through Cloudflare CDN cache. Set `Cache-Control: public, max-age=31536000, immutable` on `/public/**`.

---

## 3. Simulation Domains

Each domain is a self-contained page with an interactive Three.js or D3 scene, supporting inline blog posts and educational overlays. Built one per milestone.

| Domain | Tech | Key interaction | Phase |
|---|---|---|---|
| Solar system | R3F + drei | Orbit controls, planet info on click | 1 |
| Galaxy / cosmos | R3F + ShaderMaterial GLSL | Spiral arms, star density slider, bloom | 1 |
| Earth ecosystem | R3F + D3 | Biome zones, food chain flow | 2 |
| Physics | D3 + matter.js | Gravity, waves, pendulum sim | 2 |
| Mathematics | D3 | Function grapher, fractal explorer | 2 |
| Nutrition | D3 | Macro/micro charts, meal builder | 2 |
| Economics | D3 | Supply/demand curves, compound interest | 3 |
| Kid slides | R3F + CSS | Story-driven, minimal controls | 3 |

### Three.js approach

```
PointsMaterial (beginner)  →  ShaderMaterial + GLSL (cinematic)
```

Key techniques for galaxy scene:
- `uTime` uniform — animation tick
- `vColor` varying — inner/outer color gradient per star
- `gl_PointSize` — distance-based particle scaling
- `distance(gl_PointCoord, vec2(0.5))` — discard square corners → circles
- `THREE.AdditiveBlending` + `@react-three/postprocessing` Bloom — the wow factor

Reference repos:
- `hnrq/threejs-journey` — lessons 18 (galaxy generator) + 30 (animated galaxy)
- `the-halfbloodprince/GalaxyM1199` — live demo with dat.gui controls

---

## 4. Kid Zone

### Requirements

- YouTube Data API v3 — server-side allowlist of channels and playlists
- Session timer — 15 / 30 / 60 min, visible countdown, auto-lock on expiry
- PIN lockout — parent 4-digit PIN to extend time or change settings
- No search — browsing within approved playlists only
- Content categories — educational (science, nature, math), relaxation, stories

### Data model

| Table | Key fields |
|---|---|
| `kid_profiles` | id, parent_user_id, name, age, pin_hash, daily_limit_minutes |
| `allowed_playlists` | id, youtube_playlist_id, category, label, active |
| `watch_sessions` | id, kid_profile_id, started_at, ended_at, minutes_watched |

> **YouTube API quota**: 10K units/day free. Cache playlist responses in Redis (TTL 1 hr) to stay well within limits.

---

## 5. Content & Blogging

MDX-powered blog co-located in the Next.js app. Each post can embed live simulation components inline.

### Content types

- **Tutorial posts** — engineering, WebGL, Three.js, D3 deep-dives (portfolio signal)
- **Science explainers** — tied to simulation domains
- **Healthy lifestyle** — nutrition, movement, sleep science
- **Personal growth** — reflections, learning logs

### MDX + simulation embedding

```mdx
## How spiral galaxies form

The density wave model explains why spiral arms persist...

<GalaxyScene height={400} arms={3} autoRotate />

Notice how stars near the core rotate faster than outer stars...
```

This is the core differentiator vs plain Substack — interactive science embedded in the article body.

---

## 6. Auth Strategy

Using **better-auth** — npm library running inside Next.js. No separate auth container, no vendor dependency. Backed by Postgres.

| Feature | Approach |
|---|---|
| Email + password | Built-in, bcrypt hashed |
| OAuth (Google, GitHub) | better-auth providers |
| Session management | JWT stored in Redis |
| Kid profile PIN | bcrypt hashed, separate from user auth |
| Rate limiting | Redis-backed, per-IP on login endpoints |

---

## 7. Execution Milestones

### Phase 1 — Foundation (Weeks 1–4)

**Goal**: live site, first wow demo, blog works.

- [ ] Next.js 14 app router scaffold + Tailwind
- [ ] Docker Compose: Next.js + Postgres 17 + Redis + Nginx
- [ ] Cloudflare Tunnel routing to port 8081
- [ ] better-auth: email/password + Google OAuth
- [ ] MDX blog: first 2 posts live
- [ ] Solar system scene (R3F + drei) — orbit controls, planet labels
- [ ] Galaxy scene (R3F + ShaderMaterial) — spiral arms, bloom
- [ ] youmeantobe.io live

> **Deliverable**: A live site with two jaw-dropping Three.js demos and two blog posts. Enough to share and get signal.

---

### Phase 2 — Platform (Weeks 5–12)

**Goal**: all core simulation domains, user accounts, kid zone MVP.

- [ ] User profiles (bio, avatar, saved posts)
- [ ] Earth ecosystem + Physics + Math + Nutrition simulations
- [ ] D3 chart components reusable across blog posts
- [ ] Kid zone v1: YouTube API allowlist, session timer, PIN
- [ ] Simulation pages with embedded blog context
- [ ] SEO: sitemap, og:image, structured data
- [ ] Cloudflare CDN cache rules for static assets

---

### Phase 3 — Community (Weeks 13–24)

**Goal**: community features, monetization-ready, coaching infrastructure.

- [ ] Newsletter / subscription feed (Resend or Postmark)
- [ ] Economics simulation + Kid slides
- [ ] Course infrastructure (content gating, progress tracking)
- [ ] Coaching booking (Cal.com embed or custom)
- [ ] Community posts / micro-blogging per domain
- [ ] Analytics: Plausible (self-hosted)

---

## 8. Tech Debt Watch

| Risk | Mitigation |
|---|---|
| Three.js bundle size | `dynamic import()` per simulation, never in root bundle |
| Home server uptime | Cloudflare caches static assets — site partially works offline |
| YouTube API quota (10K units/day) | Cache playlist responses in Redis (TTL 1 hr) |
| Postgres on same host as app | Daily `pg_dump` to Backblaze B2 or similar offsite |
| better-auth session sprawl | Redis TTL on sessions + weekly cleanup job |

---

## 9. Dual Value — Project + Portfolio

| What you build | Portfolio signal |
|---|---|
| Galaxy / cosmos simulation | Three.js + GLSL shader depth — rare at senior level |
| MDX blog with embedded scenes | Full-stack content platform, not a CRUD app |
| Self-hosted Docker stack | DevOps, infrastructure ownership |
| Kid zone with YouTube filtering | Product thinking, safety-first design |
| better-auth integration | Auth architecture without vendor lock-in |
| D3 charts in blog posts | Data viz, science communication |

Open-source simulation components individually on GitHub — each one is a standalone demo linkable from `craftthecode.dev`.

---

## 10. Open Questions

- [ ] Domain confirmed as `youmeantobe.io`?
- [ ] Cloudflare Tunnel: new tunnel or new hostname on existing MiseOS tunnel?
- [ ] Postgres 17: separate instance or share with MiseOS on same host?
- [ ] Phase 3 coaching: Cal.com embed or custom booking page?
- [ ] Newsletter: Resend vs self-hosted Listmonk?
- [ ] Analytics: Plausible cloud vs self-hosted on same Docker stack?