# Last Gate AI

**A self-hosted project intelligence dashboard for solo developers and small software portfolios.**

Last Gate AI is a web application, not an npm library. Run it on a machine you control, open it in a browser, and keep repositories, tasks, delivery signals, and project health in one persistent local dashboard.

![Last Gate AI portfolio dashboard](public/screenshots/portfolio-dashboard.png)

## What it does

- Portfolio command center for lifecycle, velocity, effort, and attention signals
- GitHub repository import and activity sync
- Guided stack, architecture, summary, security, headroom, and deployment analysis
- Kanban boards, roadmaps, tasks, notes, and calendar views
- Offline summary behavior when no AI credential is configured
- Local SQLite persistence with built-in backup and restore commands

## Installation

### Requirements

- Node.js 20.19+, 22.12+, or 24+
- npm (included with Node.js)
- A GitHub personal access token only if you want repository import or sync

Prisma knowledge is not required. The setup command generates the client and applies all database migrations.

```bash
git clone https://github.com/cbrown323/last-gate-ai.git
cd last-gate-ai
cp .env.example .env.local
npm install
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To include one removable starter application, run `npm run setup -- --seed` instead.

The standard local database is `data/last-gate.db`. It and its SQLite sidecar files are ignored by Git.

## Configuration

`.env.local` is the local secret store. See [`.env.example`](.env.example) for every supported setting and whether it is required or optional.

The dashboard works without external credentials. GitHub import requires `GITHUB_TOKEN`; live AI summaries require either `AI_GATEWAY_API_KEY` or `OPENAI_API_KEY`. With no AI key, Last Gate AI keeps using its offline summary behavior.

In local development, **Settings → API keys** can write credentials to `.env.local`. Values are sent only to a server Route Handler, stored in the local file, and returned to the browser only as masked previews. Modules that read tokens are explicitly server-only.

### Local key-entry security

`ALLOW_ENV_KEY_UI=true` enables the Settings credential-writing route in a production process. This is intended only for a trusted, locally accessible self-hosted instance. Do not expose the application publicly with this capability enabled: anyone who can reach an unauthenticated instance could replace its configured keys. Leave it `false` for public or shared deployments and manage secrets through the host environment instead.

Restart the server after editing `.env.local` outside the Settings UI.

## Updating

Back up the database before updating, then install the new code and deploy migrations:

```bash
npm run db:backup
git pull --ff-only
npm install
npm run setup
npm run build
```

See [Upgrading](docs/UPGRADING.md) for rollback guidance and version-specific precautions.

## Backup and restore

Create a safe online SQLite backup:

```bash
npm run db:backup
# or choose a path
npm run db:backup -- /secure/path/last-gate.db
```

Stop the application before restoring. Restore requires an explicit `--force` flag and retains the previous database beside the live file:

```bash
npm run db:restore -- backups/last-gate-2026-08-26T20-00-00-000Z.db --force
```

See [Backup and restore](docs/BACKUP.md) for verification, retention, and off-machine storage recommendations.

## Production

Build and run a single self-hosted process from the repository root:

```bash
npm run setup
npm run build
npm start
```

Persist both `.env.local` (or equivalent host environment variables) and the database path. SQLite is appropriate for a single application instance; do not run multiple writers against one database file over a network filesystem.

## Troubleshooting

### Setup reports an unsupported Node.js version

Install Node.js 20.19+, 22.12+, or 24+, then rerun `npm install` and `npm run setup`. Prisma has stricter minimum versions than Next.js, so older Node 20 or 22 releases are not supported.

### The database is missing or the dashboard resets

Run `npm run setup` from the repository root and confirm `DATABASE_URL="file:./data/last-gate.db"` in `.env.local`. Relative database paths are resolved from the repository root. Make sure `data/` is on persistent storage in a container or service.

### A migration fails

Do not delete the database. Save the full error, create a filesystem copy if possible, and consult [Upgrading](docs/UPGRADING.md). Restore the pre-update backup if you need to return to the previous version.

### GitHub import is unavailable

Set `GITHUB_TOKEN` in `.env.local` or Settings. A classic token needs `repo` scope; a fine-grained token needs Metadata and Contents read access for the repositories being imported.

### AI features say offline

This is expected when no AI key is set. Core portfolio, task, notes, calendar, GitHub, stack, and architecture features remain usable. Add one supported AI key for live summaries.

### Settings cannot save keys

The key-writing UI is enabled automatically during local development. In production it is disabled unless `ALLOW_ENV_KEY_UI=true`; prefer host-managed environment variables for any shared or public instance.

## Development and release checks

```bash
npm run lint
npm run build
```

The release process is documented in [Releasing](docs/RELEASING.md).

## Stack

- Next.js App Router, React, and TypeScript
- shadcn/ui and Tailwind CSS
- Prisma with SQLite
- Vercel AI SDK for optional AI summaries
- GitHub API integration through Octokit

## License

Licensed under the [Apache License 2.0](LICENSE).
