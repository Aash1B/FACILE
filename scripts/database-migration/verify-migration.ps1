param([string]$EnvironmentFile)
. (Join-Path $PSScriptRoot 'Common.ps1')
Write-Host 'Verification is read-only. Counts below must match exactly.'
& (Join-Path $PSScriptRoot 'inspect-destinations.ps1') -EnvironmentFile $EnvironmentFile
Write-Host 'Run backup-local-databases.ps1 again to capture current local counts for comparison; it does not alter local data.'
