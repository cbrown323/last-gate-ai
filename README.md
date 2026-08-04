# Last Gate AI

One dashboard for all your software projects — track tasks, sync GitHub repos, and run health checks without switching tabs.

## Run the app

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Add a `.env.local` file (or use **Settings → API keys** in the app):

```bash
GITHUB_TOKEN=ghp_...                    # required for repo sync
AI_GATEWAY_API_KEY=...                  # optional — live AI summaries
```

Restart the dev server after changing keys.

## How to use it

### 1. Connect integrations

Go to **Settings** and walk through the wizard:

1. **GitHub** — sync repos, scan stack, detect deployments
2. **AI** — optional; powers summaries and analysis agents
3. **Vercel / Railway** — optional deployment tracking

Click **Verify** on each step to confirm it works.

### 2. Add your first application

**Applications → Import from GitHub** or register manually with a repo URL.

Open the app and hit **Sync now** on the Overview tab to pull git stats.

### 3. Use the dashboard

The home page shows your whole portfolio at a glance:

- **Needs attention** — stale repos, missing sync, overdue tasks
- **Work in flight** — jump to any app's board or roadmap
- **Refresh intelligence** — re-analyze all linked repos

### 4. Manage tasks

Each app has a Kanban board (**Backlog → In progress → Done**) with priorities and due dates.

Use the **Board | Roadmap** switcher in the app header. Overdue tasks on the dashboard link straight to the task.

### 5. Run intelligence

On any application, open the **Intelligence** tab:

- **Run full analysis** — stack, architecture, AI summary, security, headroom, and deployments in one go
- Or run each step individually from the sub-tabs

Without an AI key, summaries use an offline template; everything else still works with GitHub connected.
