#!/usr/bin/env pwsh
Write-Host "Setting local git hooks path to .githooks"
git config core.hooksPath .githooks
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to set core.hooksPath"
  exit 1
}
Write-Host "Hooks installed. Pre-push will prompt for confirmation on push."
