# Re-export the live Claude memory store into the repo snapshot (.claude/memory),
# scrubbing user home paths so nothing machine-identifying is committed.
#
# Deterministic: the repo copy becomes an exact, scrubbed mirror of live memory
# (manual edits to .claude/memory/*.md are overwritten — edit live memory instead).
# Files-only: this never runs git. Run by the Stop hook; safe no-op elsewhere.
$ErrorActionPreference = 'Stop'

# Live memory dir for THIS project (no-op if absent, e.g. a clone on another machine).
$live = Join-Path $env:USERPROFILE '.claude\projects\D--documents-KRX-Craft-W-Craft-gcc-20260529\memory'
if (-not (Test-Path $live)) { exit 0 }

# Repo snapshot dir, resolved relative to this script (tools/ -> ../.claude/memory).
$repo = Join-Path (Split-Path $PSScriptRoot -Parent) '.claude\memory'
New-Item -ItemType Directory -Force -Path $repo | Out-Null

function Scrub([string]$t) {
  # Order matters: LOCALAPPDATA/APPDATA live under USERPROFILE, so scrub them first.
  $t = $t -replace [regex]::Escape($env:LOCALAPPDATA), '%LOCALAPPDATA%'
  $t = $t -replace [regex]::Escape($env:APPDATA), '%APPDATA%'
  $t = $t -replace [regex]::Escape($env:USERPROFILE), '%USERPROFILE%'
  return $t
}

# Read/write UTF-8 explicitly via .NET: PowerShell 5.1's Get-Content/Set-Content
# mis-handle UTF-8-without-BOM and corrupt non-ASCII (em-dashes, Korean, etc.).
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$utf8 = [System.Text.Encoding]::UTF8
function ReadText([string]$p) { [System.IO.File]::ReadAllText($p, $utf8) }

# Drop repo .md files that no longer exist in live memory.
Get-ChildItem $repo -Filter *.md -ErrorAction SilentlyContinue | ForEach-Object {
  if (-not (Test-Path (Join-Path $live $_.Name))) { Remove-Item $_.FullName -Force }
}

# Export + scrub every live .md (write only when changed, to avoid needless churn).
Get-ChildItem $live -Filter *.md | ForEach-Object {
  $out = Scrub (ReadText $_.FullName)
  $dest = Join-Path $repo $_.Name
  $cur = if (Test-Path $dest) { ReadText $dest } else { $null }
  if ($cur -ne $out) { [System.IO.File]::WriteAllText($dest, $out, $utf8NoBom) }
}
