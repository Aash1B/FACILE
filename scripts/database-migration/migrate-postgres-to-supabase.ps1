param([Parameter(Mandatory)][string]$Backup, [string]$EnvironmentFile, [switch]$DataOnly, [switch]$Yes, [switch]$DryRun)
. (Join-Path $PSScriptRoot 'Common.ps1')
Import-MigrationEnvironment $(if ($EnvironmentFile) { $EnvironmentFile } else { Join-Path $PSScriptRoot '..\..\migration.env' })
if (-not (Test-Path -LiteralPath $Backup) -or (Get-Item $Backup).Length -le 0) { throw 'Backup is missing or empty.' }
$mode = $(if ($DataOnly) { 'data-only' } else { 'schema-and-data' })
if ($DryRun) { Write-Host "Dry run: would restore $mode without owner, privileges, clean, or create flags."; exit 0 }
Confirm-HostedWrite -Target 'Supabase PostgreSQL' -Yes:$Yes
Assert-Command docker
$cliUrl = Get-CliPostgresUrl
$pgUser = Get-MigrationValue @('SUPABASE_DATABASE_USERNAME', 'DATABASE_USERNAME')
$env:PGPASSWORD = Get-MigrationValue @('SUPABASE_DATABASE_PASSWORD', 'DATABASE_PASSWORD')
try {
    $resolved = (Resolve-Path -LiteralPath $Backup).Path
    $args = @('run','--rm','-e','PGPASSWORD','-v',"${resolved}:/backup.dump:ro",'postgres:17','pg_restore','--exit-on-error','--no-owner','--no-privileges')
    if ($DataOnly) { $args += '--data-only' }
    $args += @('--dbname', $cliUrl, '--username', $pgUser, '/backup.dump')
    & docker @args
    if ($LASTEXITCODE -ne 0) { throw "pg_restore failed with exit code $LASTEXITCODE" }
} finally { Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue }
