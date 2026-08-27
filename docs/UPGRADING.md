# Upgrading Last Gate AI

Use this process for routine self-hosted updates. Database migrations are forward-only, so make a backup before changing application versions.

## Standard update

1. Stop the production application if it is running.
2. Create and retain a database backup:

   ```bash
   npm run db:backup
   ```

3. Record the current revision so it is easy to identify the previous application version:

   ```bash
   git rev-parse HEAD
   ```

4. Update the checkout and dependencies:

   ```bash
   git pull --ff-only
   npm install
   ```

5. Generate Prisma Client and apply committed migrations:

   ```bash
   npm run setup
   ```

6. Verify the release, then start it:

   ```bash
   npm run lint
   npm run build
   npm start
   ```

`npm run setup` uses `prisma migrate deploy`, which applies committed migrations without creating development migrations or resetting data.

## Rollback

Application code can be checked out at the recorded revision, but a database changed by a migration must be restored from its pre-update backup. Stop the application, restore the backup, check out the matching code revision, run `npm install`, and rebuild.

```bash
npm run db:restore -- backups/<pre-update-backup>.db --force
git checkout <recorded-revision>
npm install
npm run build
npm start
```

The restore command preserves the replaced database as `data/last-gate.db.before-restore-<timestamp>`. Keep it until the rollback is confirmed.

## Database location changes

The v0.1 convention is `data/last-gate.db`, configured by `DATABASE_URL="file:./data/last-gate.db"`. If an older checkout used `dev.db`, stop the app, copy that database to `data/last-gate.db`, update `.env.local`, and run `npm run setup`. Do not merge two database files; choose the one containing the data you intend to keep.
