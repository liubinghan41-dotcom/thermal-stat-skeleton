$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$dist = Join-Path $root "dist"
$release = Join-Path $root "release"
$packageDir = Join-Path $release "thermal-stat-skeleton-web"
$zip = Join-Path $release "thermal-stat-skeleton-web.zip"

if (-not (Test-Path $dist)) {
  throw "dist directory not found. Run npm run build first."
}

New-Item -ItemType Directory -Force -Path $release | Out-Null

$releaseRoot = (Resolve-Path $release).Path
if (Test-Path $packageDir) {
  $resolvedPackageDir = (Resolve-Path $packageDir).Path
  if (-not $resolvedPackageDir.StartsWith($releaseRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove a package directory outside release."
  }
  Remove-Item -LiteralPath $resolvedPackageDir -Recurse -Force
}

if (Test-Path $zip) {
  $resolvedZip = (Resolve-Path $zip).Path
  if (-not $resolvedZip.StartsWith($releaseRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to remove a zip outside release."
  }
  Remove-Item -LiteralPath $resolvedZip -Force
}

New-Item -ItemType Directory -Force -Path $packageDir | Out-Null
Copy-Item -Path (Join-Path $dist "*") -Destination $packageDir -Recurse -Force

@"
# 热统骨架 release

This package contains the production build of 热统骨架.

## Windows

Double click `start-windows.cmd`, or run:

```powershell
.\start-windows.cmd
```

The script starts a local static server and opens the app in your browser.
"@ | Set-Content -Path (Join-Path $packageDir "README.md") -Encoding UTF8

@"
@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run this local package.
  echo Install Node.js, then run this file again.
  pause
  exit /b 1
)
set PORT=4173
start "" http://127.0.0.1:%PORT%/
node server.mjs
"@ | Set-Content -Path (Join-Path $packageDir "start-windows.cmd") -Encoding ASCII

@'
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] || "/");
  const normalized = normalize(decoded).replace(/^([/\\])+/, "");
  const candidate = join(root, normalized);
  if (!candidate.startsWith(root)) {
    return join(root, "index.html");
  }
  return candidate;
}

const server = createServer(async (request, response) => {
  try {
    let filePath = resolvePath(request.url || "/");
    if (!existsSync(filePath) || (await stat(filePath)).isDirectory()) {
      filePath = join(root, "index.html");
    }

    response.setHeader("Content-Type", mimeTypes[extname(filePath)] || "application/octet-stream");
    createReadStream(filePath).pipe(response);
  } catch {
    response.statusCode = 500;
    response.end("Server error");
  }
});

server.listen(port, host, () => {
  console.log(`热统骨架 is running at http://${host}:${port}/`);
});
'@ | Set-Content -Path (Join-Path $packageDir "server.mjs") -Encoding UTF8

Compress-Archive -Path (Join-Path $packageDir "*") -DestinationPath $zip -Force

Write-Host "PACKAGED_DIR=$packageDir"
Write-Host "PACKAGED_ZIP=$zip"
