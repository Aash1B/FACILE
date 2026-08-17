param([string]$EnvironmentFile, [switch]$MongoOnly)
. (Join-Path $PSScriptRoot 'Common.ps1')
Import-MigrationEnvironment $(if ($EnvironmentFile) { $EnvironmentFile } else { Join-Path $PSScriptRoot '..\..\migration.env' })
Assert-Command docker
docker info --format '{{.ServerVersion}}' | Out-Null

if (-not $MongoOnly) {
    $jdbcUrl = Get-MigrationValue @('SUPABASE_DATABASE_URL')
    if ($jdbcUrl -notmatch '^jdbc:postgresql://') {
        throw 'SUPABASE_DATABASE_URL must start with jdbc:postgresql://'
    }
    $cliUrl = $jdbcUrl.Substring(5)
    $pgUser = Get-MigrationValue @('SUPABASE_DATABASE_USERNAME')
    $env:PGPASSWORD = Get-MigrationValue @('SUPABASE_DATABASE_PASSWORD')
    try {
        Write-Host 'Supabase application tables and exact row counts:'
        docker run --rm -e PGPASSWORD postgres:17 psql $cliUrl -U $pgUser -v ON_ERROR_STOP=1 -Atc @'
select format('%I.%I=%s', schemaname, relname,
  (xpath('/row/c/text()', query_to_xml(format('select count(*) c from %I.%I',schemaname,relname),false,true,'')))[1]::text)
from pg_stat_user_tables order by 1;
'@
    } finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
}

$env:MONGODB_ATLAS_URI = Get-MigrationValue @('MONGODB_ATLAS_URI')
Write-Host 'Atlas collections and document counts:'
$mongoScript = New-TemporaryMigrationScript -Content @'
db = connect(process.env.MONGODB_ATLAS_URI);
const targetDb = db.getSiblingDB("orderdb");
print("database=" + targetDb.getName());
Promise.resolve(targetDb.getCollectionNames()).then(async function (collections) {
    collections.sort();
    if (collections.length === 0) {
        print("orderdb is empty");
        return;
    }
    for (const name of collections) {
        print(name + "=" + (await targetDb.getCollection(name).countDocuments({})));
        const indexes = await targetDb.getCollection(name).getIndexes();
        indexes.forEach(function (index) {
            print("index " + name + "." + index.name + "=" + JSON.stringify(index.key));
        });
    }
});
'@
try {
    docker run --rm -e MONGODB_ATLAS_URI -v "${mongoScript}:/tmp/facile-mongo-inspect.js:ro" mongo:7 mongosh --nodb --quiet --file /tmp/facile-mongo-inspect.js
    if ($LASTEXITCODE -ne 0) { throw "MongoDB Atlas inspection failed with exit code $LASTEXITCODE" }
} finally {
    Remove-Item -LiteralPath $mongoScript -Force -ErrorAction SilentlyContinue
    Remove-Item Env:MONGODB_ATLAS_URI -ErrorAction SilentlyContinue
}
