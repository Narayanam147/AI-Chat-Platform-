# Script to remove sensitive files from git history
# This will completely remove the files containing secrets from all commits

Write-Host "=== Cleaning Git History ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will remove files containing secrets from your git history." -ForegroundColor Yellow
Write-Host "Files to be removed:" -ForegroundColor Yellow
Write-Host "  - LIVE_DEPLOYMENT.md" -ForegroundColor Red
Write-Host "  - DEPLOYMENT_GUIDE.md" -ForegroundColor Red
Write-Host "  - API_KEYS_GUIDE.md" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This will rewrite git history!" -ForegroundColor Red
Write-Host "Make sure you have a backup and inform any collaborators." -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Type 'YES' to continue"
if ($confirm -ne 'YES') {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Step 1: Creating backup branch..." -ForegroundColor Cyan
git branch backup-before-history-clean

Write-Host ""
Write-Host "Step 2: Removing files from git history..." -ForegroundColor Cyan

# Use git filter-repo (recommended) or filter-branch
# First, check if git-filter-repo is available
$filterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if ($filterRepo) {
    Write-Host "Using git-filter-repo (recommended method)..." -ForegroundColor Green
    git filter-repo --invert-paths --path LIVE_DEPLOYMENT.md --path DEPLOYMENT_GUIDE.md --path API_KEYS_GUIDE.md --force
} else {
    Write-Host "git-filter-repo not found. Using git filter-branch (slower)..." -ForegroundColor Yellow
    Write-Host "Consider installing git-filter-repo: pip install git-filter-repo" -ForegroundColor Yellow
    Write-Host ""
    
    git filter-branch --force --index-filter `
        "git rm --cached --ignore-unmatch LIVE_DEPLOYMENT.md DEPLOYMENT_GUIDE.md API_KEYS_GUIDE.md" `
        --prune-empty --tag-name-filter cat -- --all
}

Write-Host ""
Write-Host "Step 3: Cleaning up..." -ForegroundColor Cyan
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host ""
Write-Host "Step 4: Force push to GitHub..." -ForegroundColor Cyan
Write-Host "This will update the remote repository." -ForegroundColor Yellow
Write-Host ""
$pushConfirm = Read-Host "Type 'PUSH' to force push to GitHub"
if ($pushConfirm -eq 'PUSH') {
    git push origin --force --all
    git push origin --force --tags
    Write-Host ""
    Write-Host "✓ Done! Git history has been cleaned." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to GitHub → Settings → Security → Secret scanning alerts" -ForegroundColor White
    Write-Host "2. Close the alerts manually (they should show the secrets are no longer present)" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: It may take a few minutes for GitHub to re-scan the repository." -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Skipped force push. Changes are local only." -ForegroundColor Yellow
    Write-Host "To push later, run: git push origin --force --all" -ForegroundColor White
}

Write-Host ""
Write-Host "Backup branch created: backup-before-history-clean" -ForegroundColor Green
Write-Host "If anything goes wrong, you can restore with:" -ForegroundColor Yellow
Write-Host "  git reset --hard backup-before-history-clean" -ForegroundColor White
