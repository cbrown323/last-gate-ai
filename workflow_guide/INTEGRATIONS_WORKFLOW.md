# Integrations workflow — connect GitHub, Vercel, Railway & AI

Last Gate AI pulls intelligence from your repos and deployment platforms. This workflow replaces scattered manual setup with a **guided, repeatable path** — in the app and for agents.

---

## User journey (in-app)

```
Dashboard
    │
    ├─► "Connect your integrations" banner (if GitHub not configured)
    │
    └─► Settings → Connect your stack wizard
            │
            Step 1: GitHub      ──► repo sync, stack scan, deployment file detection
            Step 2: AI          ──► summaries, security, headroom (optional)
            Step 3: Vercel      ──► deployment tracking (optional)
            Step 4: Railway     ──► deployment tracking (optional)
            │
            └─► Verify each step → Register application → Sync / Scan / Detect
```

### Where to start

1. **Settings** (`/settings`) — full wizard with progress bar, setup steps, external links, and **Verify** buttons.
2. **Dashboard** — amber banner nudges new users until GitHub is configured.
3. **Demo preview** — still available with zero keys for dry-run exploration.

### Security model (Phase 1)

| What | Where | Why |
|------|--------|-----|
| API tokens | `.env.local` only | Never sent to browser or stored in DB |
| Verify | Server-side API routes | Tests connectivity without exposing secrets |
| Repo access | `GITHUB_TOKEN` server-side | Octokit calls from Route Handlers only |

---

## Setup order

### 1. GitHub (recommended first)

Unlocks: repo sync, stack scanner, architecture mapper, deployment config detection.

```bash
# .env.local
GITHUB_TOKEN=ghp_...
```

1. Create PAT: [GitHub tokens](https://github.com/settings/tokens) — `repo` read scope (or fine-grained equivalent).
2. Restart `npm run dev`.
3. Settings → GitHub step → **Verify**.
4. Applications → Add application → paste `https://github.com/owner/repo`.
5. App detail → Overview → **Sync now**.

### 2. AI (optional)

Unlocks: live AI summaries, security agent, headroom agent. Offline templates work without keys.

```bash
# Pick ONE:
AI_GATEWAY_API_KEY=...   # recommended — Vercel AI Gateway
# OPENAI_API_KEY=...
```

Settings → AI step → **Verify** → any app → AI Summary → Generate.

### 3. Vercel (optional)

Unlocks: token verification today; future deployment status sync.

```bash
VERCEL_TOKEN=...
```

Also recommended for the repo itself:

```bash
vercel login
vercel link
vercel env pull   # sync platform env vars locally
```

Last Gate auto-detects `vercel.json` when you **Detect from repo** on the Deployments tab.

### 4. Railway (optional)

```bash
RAILWAY_TOKEN=...
```

Last Gate auto-detects `railway.toml` on the Deployments tab.

### 5. Wire an application

| Action | Tab | Requires |
|--------|-----|----------|
| Sync git stats | Overview | GitHub |
| Scan stack | Stack | GitHub |
| Map architecture | Architecture | GitHub |
| Detect platforms | Deployments | GitHub |
| AI summary | AI Summary | AI key (optional) |

---

## Agent / developer workflow

When bootstrapping a Last Gate-linked repo (or helping a user connect services), follow this order:

```
1. cp .env.example .env.local
2. Configure GITHUB_TOKEN → verify via Settings or POST /api/integrations/verify
3. Configure AI key (optional)
4. Configure VERCEL_TOKEN / RAILWAY_TOKEN (optional)
5. npx prisma migrate dev && npm run dev
6. Register application with repo URL
7. POST /api/github/sync { applicationId }
8. POST /api/stack/scan { applicationId }
9. POST /api/deployments { applicationId, detect: true }
```

### API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/integrations/status` | All providers + progress |
| POST | `/api/integrations/verify` | `{ "provider": "github" \| "ai" \| "vercel" \| "railway" }` |

### Code map

```
types/integrations.ts           — provider + status types
lib/integrations/providers.ts   — setup steps, docs links, env var names
lib/integrations/status.ts      — configured / overview helpers
lib/integrations/verify.ts      — live API pings per provider
components/settings/integrations-wizard.tsx
app/api/integrations/*
```

---

## Roadmap (Phase 2+)

| Phase | Capability |
|-------|------------|
| **1 (now)** | Guided wizard, env-based tokens, verify buttons, repo file detection |
| **2** | GitHub OAuth App — pick repos in UI, no manual PAT |
| **3** | Vercel Marketplace link — auto-pull project URL + deployment webhooks |
| **4** | Railway OAuth — live deployment status per service |
| **5** | Per-application integration links in DB (platform project ID ↔ application ID) |
| **6** | One-click "Bootstrap project" — `vercel link` + env pull orchestration from Settings |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Verify fails for GitHub | Check token scopes; restart dev server after `.env.local` change |
| Sync says invalid URL | Use `https://github.com/owner/repo` format |
| Stack scan empty | Ensure `GITHUB_TOKEN` has repo contents read |
| Deployments detect nothing | Confirm config file exists on default branch |
| AI shows Offline | Set `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY`; restart dev server |

---

## Related docs

- [`AI_PROJECT_STATE.md`](AI_PROJECT_STATE.md) — env var reference
- [Vercel bootstrap skill](https://vercel.com/docs/cli) — `vercel link`, `vercel env pull`, Marketplace integrations
- [`README.md`](../README.md) — getting started
