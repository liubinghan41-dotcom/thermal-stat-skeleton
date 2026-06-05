param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]] $RemainingArgs
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$nodeScript = Join-Path $root "scripts/package-release.mjs"

if (-not (Test-Path $nodeScript)) {
  throw "Could not find package script: $nodeScript"
}

& node $nodeScript @RemainingArgs
