param([Parameter(Mandatory)][string]$Backup, [string]$EnvironmentFile, [switch]$Yes, [switch]$DryRun)
. (Join-Path $PSScriptRoot 'Common.ps1')
Import-MigrationEnvironment $(if ($EnvironmentFile) { $EnvironmentFile } else { Join-Path $PSScriptRoot '..\..\migration.env' })
if (-not (Test-Path -LiteralPath $Backup) -or (Get-Item $Backup).Length -le 0) { throw 'Backup is missing or empty.' }
if ($DryRun) { Write-Host 'Dry run: would restore orderdb.* without --drop.'; exit 0 }
Confirm-HostedWrite -Target 'MongoDB Atlas orderdb' -Yes:$Yes
Assert-Command docker
$atlas = Get-MigrationValue @('MONGODB_ATLAS_URI', 'MONGODB_URI')
if ($atlas -notmatch '/orderdb(?:\?|$)') { throw 'Atlas URI must explicitly select /orderdb.' }
$resolved = (Resolve-Path -LiteralPath $Backup).Path
$env:FACILE_ATLAS_URI = $atlas
try {
    docker run --rm -e FACILE_ATLAS_URI -v "${resolved}:/backup.archive.gz:ro" mongo:7 sh -c 'mongorestore --uri="$FACILE_ATLAS_URI" --archive=/backup.archive.gz --gzip --nsInclude="orderdb.*" --stopOnError'
    if ($LASTEXITCODE -ne 0) { throw "mongorestore failed with exit code $LASTEXITCODE" }
} finally { Remove-Item Env:FACILE_ATLAS_URI -ErrorAction SilentlyContinue }
