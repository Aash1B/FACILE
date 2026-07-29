# FACILE database migration scripts

These PowerShell scripts back up local Docker PostgreSQL/MongoDB, inspect hosted destinations, migrate only after an explicit `MIGRATE` prompt, and perform read-only verification. They never use `--clean`, `--create`, `--drop`, `dropDatabase`, or schema/table deletion.

Use the ignored repository-root `migration.env`. Existing hosted names are supported:

```text
DATABASE_URL=jdbc:postgresql://HOST:5432/postgres?sslmode=require
DATABASE_USERNAME=
DATABASE_PASSWORD=
MONGODB_URI=mongodb+srv://USER:ENCODED_PASSWORD@HOST/orderdb?retryWrites=true&w=majority
```

The preferred names are `SUPABASE_DATABASE_URL`, `SUPABASE_DATABASE_USERNAME`, `SUPABASE_DATABASE_PASSWORD`, and `MONGODB_ATLAS_URI`. Optional local overrides are `LOCAL_POSTGRES_DATABASE`, `LOCAL_POSTGRES_USERNAME`, `LOCAL_POSTGRES_CONTAINER`, and `LOCAL_MONGODB_CONTAINER`; defaults match `docker-compose.yml`.

Run in order:

```powershell
.\scripts\database-migration\backup-local-databases.ps1
.\scripts\database-migration\inspect-destinations.ps1
```

If either destination has application rows/documents, stop and make a merge plan. Only for an empty compatible destination:

```powershell
.\scripts\database-migration\migrate-postgres-to-supabase.ps1 -Backup .\database-backups\TIMESTAMP\facile-postgres-before-supabase.dump -DryRun
.\scripts\database-migration\migrate-mongo-to-atlas.ps1 -Backup .\database-backups\TIMESTAMP\orderdb-before-atlas.archive.gz -DryRun
```

Remove `-DryRun` only after reviewing inspection output. Docker Desktop must be running. The scripts use the `postgres:17` and `mongo:7` images so standalone client installations are not required.
