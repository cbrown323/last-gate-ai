# Release checklist

Use this checklist before publishing a Last Gate AI release.

## Code and metadata

- [ ] `package.json` has the intended version and supported Node.js range.
- [ ] All schema changes have committed migrations under `prisma/migrations/`.
- [ ] `.env.example` lists every supported variable without real credentials.
- [ ] Upgrade, backup, restore, and troubleshooting documentation matches the commands.
- [ ] The working tree contains no database, `.env`, backup, token, or generated secret file.

## Clean-install gate

Validate in a disposable clone, without copying an existing database or `.env.local`:

```bash
git clone https://github.com/cbrown323/last-gate-ai.git
cd last-gate-ai
cp .env.example .env.local
npm install
npm run setup
npm run dev
```

- [ ] Empty dashboard loads without errors.
- [ ] Settings saves a test credential and shows only a masked preview.
- [ ] Created application data survives a server restart.
- [ ] GitHub repository import works with a valid token.
- [ ] Core features and offline summaries work without an AI key.
- [ ] `npm run db:backup` creates a valid backup.
- [ ] A restore into the disposable checkout reproduces the saved data.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `npm audit --audit-level=high` reports no vulnerabilities.
- [ ] `git status --short` shows no database, token, backup, or `.env` file.

## Release

1. Commit the reviewed release changes.
2. Create an annotated tag from that exact commit:

   ```bash
   git tag -a v0.1.0 -m "Last Gate AI v0.1.0"
   ```

3. Verify the tag points to the reviewed commit:

   ```bash
   git show --stat v0.1.0
   ```

4. Push the commit and tag only after the clean-install gate passes.
5. Publish release notes covering user-visible changes, migrations, backup requirements, and known limitations.
