# Database backup and restore

Last Gate AI stores persistent application data in SQLite. The standard path is `data/last-gate.db`; `DATABASE_URL` can point to another local SQLite file.

## Create a backup

```bash
npm run db:backup
```

The default destination is `backups/last-gate-<timestamp>.db`. The command uses SQLite's online backup API, so it creates a consistent copy even when the app is running.

Choose an explicit destination when copying to mounted or encrypted storage:

```bash
npm run db:backup -- /secure/backups/last-gate.db
```

The command refuses to overwrite either the live database or an existing backup file.

## Restore a backup

1. Stop every Last Gate AI process using the database.
2. Keep a separate copy of the backup you plan to restore.
3. Run:

   ```bash
   npm run db:restore -- backups/<backup-file>.db --force
   ```

4. Run `npm run db:deploy` to apply any migrations required by the current code.
5. Start the app and verify applications, tasks, notes, and settings-dependent integrations.

Before replacement, the command runs SQLite `quick_check`. It then preserves the current database as `last-gate.db.before-restore-<timestamp>` and installs the validated backup. The `--force` flag prevents accidental restores from a mistyped command.

## Retention recommendations

- Keep at least one recent backup outside the repository and outside the host running Last Gate AI.
- Back up before every application upgrade or migration.
- Periodically test a restore on a disposable checkout.
- Protect backups as private data; they can contain repository metadata, project notes, and work records.
- `.env.local` is not stored in the database. Back it up separately in a secure secret manager, never in Git.
