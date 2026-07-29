param([string]$EnvironmentFile, [string]$OutputRoot)
. (Join-Path $PSScriptRoot 'Common.ps1')
Import-MigrationEnvironment $(if ($EnvironmentFile) { $EnvironmentFile } else { Join-Path $PSScriptRoot '..\..\migration.env' })
Assert-Command docker
docker info --format '{{.ServerVersion}}' | Out-Null

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if (-not $OutputRoot) { $OutputRoot = Join-Path $PSScriptRoot "..\..\database-backups\$stamp" }
New-Item -ItemType Directory -Force -Path $OutputRoot | Out-Null
$pgDump = Join-Path $OutputRoot 'facile-postgres-before-supabase.dump'
$mongoDump = Join-Path $OutputRoot 'orderdb-before-atlas.archive.gz'
$metadata = Join-Path $OutputRoot 'metadata.txt'

$pgContainer = Get-MigrationValue @('LOCAL_POSTGRES_CONTAINER') 'postgres'
$mongoContainer = Get-MigrationValue @('LOCAL_MONGODB_CONTAINER') 'mongo-order'
$pgDb = Get-MigrationValue @('LOCAL_POSTGRES_DATABASE') 'postgres'
$pgUser = Get-MigrationValue @('LOCAL_POSTGRES_USERNAME') 'postgres'

docker exec $pgContainer pg_dump --username=$pgUser --dbname=$pgDb --format=custom --no-owner --no-privileges --file=/tmp/facile.dump
docker cp "${pgContainer}:/tmp/facile.dump" $pgDump
docker exec $pgContainer rm -f /tmp/facile.dump
docker exec $mongoContainer mongodump --db=orderdb --archive=/tmp/orderdb.archive.gz --gzip
docker cp "${mongoContainer}:/tmp/orderdb.archive.gz" $mongoDump
docker exec $mongoContainer rm -f /tmp/orderdb.archive.gz

if ((Get-Item $pgDump).Length -le 0 -or (Get-Item $mongoDump).Length -le 0) { throw 'A backup file is empty.' }
$pgTables = docker exec $pgContainer psql -U $pgUser -d $pgDb -Atc "select schemaname||'.'||relname||'='||n_live_tup from pg_stat_user_tables order by 1"
$mongoCounts = docker exec $mongoContainer mongosh orderdb --quiet --eval 'db.getCollectionNames().then(async names=>{names.sort();for(const n of names)print(n+"="+(await db.getCollection(n).countDocuments({})))})'
@(
    "timestamp=$(Get-Date -Format o)"
    "postgres_database=$pgDb"
    'mongodb_database=orderdb'
    "docker_version=$(docker --version)"
    'postgres_tables_and_estimated_rows:'
    $pgTables
    'mongodb_collections_and_documents:'
    $mongoCounts
) | Set-Content -LiteralPath $metadata
Write-Host "Backups verified: $OutputRoot"
