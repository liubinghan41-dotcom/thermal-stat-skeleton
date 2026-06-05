import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(projectRoot, "dist");
const releaseDir = join(projectRoot, "release");
const packageDir = join(releaseDir, "thermal-stat-skeleton-web");
const zipPath = join(releaseDir, "thermal-stat-skeleton-web.zip");
const packageName = "Thermal Stat Skeleton";

function showHelp() {
  console.log(`
Thermal Stat Skeleton Web release packaging.

Usage:
  node scripts/package-release.mjs            # generate release/thermal-stat-skeleton-web + zip
  node scripts/package-release.mjs --help      # show this help
`);
}

function existsOrFail(path, message) {
  if (!existsSync(path)) {
    throw new Error(message);
  }
}

function runCommand(command, args, options = {}) {
  const child = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });

  if (child.error) {
    throw child.error;
  }
  if (child.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")} (exit ${child.status})`);
  }
}

function hasCommand(command) {
  try {
    execSync(process.platform === "win32" ? `where ${command}` : `command -v ${command}`, {
      stdio: "ignore",
      shell: true,
    });
    return true;
  } catch {
    return false;
  }
}

function createServerLauncher() {
  return `@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required to run this package.
  echo Install Node.js first, then run again.
  pause
  exit /b 1
)
set PORT=4173
start "" http://127.0.0.1:%PORT%/
node server.mjs
`;
}

function createServerScript() {
  const host = "127.0.0.1";
  const port = 4173;
  const mimeTypes = JSON.stringify(
    {
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
      ".txt": "text/plain; charset=utf-8",
    },
    null,
    2,
  );

  return `import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const root = process.cwd();
const port = Number(process.env.PORT || ${port});
const host = "${host}";

const mimeTypes = ${mimeTypes};

function resolvePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0]);
  const normalized = normalize(decoded).replace(/^([/\\\\])+/, "");
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
    const mime = mimeTypes[extname(filePath)] || "application/octet-stream";
    response.setHeader("Content-Type", mime);
    createReadStream(filePath).pipe(response);
  } catch {
    response.statusCode = 500;
    response.end("Server error");
  }
});

server.listen(port, host, () => {
  console.log("${packageName} is running at http://${host}:${port}");
});
`;
}

function createReleaseReadme() {
  return `# ${packageName} release

This folder is a standalone production snapshot of the app build.

## Windows

Run:
\`\`\`powershell
cd release\\thermal-stat-skeleton-web
start-windows.cmd
\`\`\`

## Linux / macOS

Run:
\`\`\`bash
cd release/thermal-stat-skeleton-web
node server.mjs
\`\`\`
`;
}

function createZip(outputPath, sourceDir) {
  if (process.platform === "win32") {
    if (!hasCommand("powershell")) {
      throw new Error("PowerShell not found, cannot create zip on Windows.");
    }

    runCommand("powershell", [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${outputPath}' -Force`,
    ]);
    return;
  }

  if (hasCommand("zip")) {
    runCommand("zip", ["-r", outputPath, "."], {
      cwd: sourceDir,
    });
    return;
  }

  if (hasCommand("tar")) {
    runCommand("tar", ["-czf", outputPath, "."], {
      cwd: sourceDir,
    });
    return;
  }

  throw new Error("No zip/tar tool found. Please install zip or tar.");
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    showHelp();
    return;
  }

  existsOrFail(distDir, "dist not found. Run npm run build first.");

  mkdirSync(releaseDir, { recursive: true });
  if (existsSync(packageDir)) {
    rmSync(packageDir, { recursive: true, force: true });
  }
  if (existsSync(zipPath)) {
    rmSync(zipPath, { force: true });
  }

  cpSync(distDir, packageDir, { recursive: true });
  mkdirSync(packageDir, { recursive: true });

  writeFileSync(join(packageDir, "README.md"), createReleaseReadme(), "utf8");
  writeFileSync(join(packageDir, "start-windows.cmd"), createServerLauncher(), "utf8");
  writeFileSync(join(packageDir, "server.mjs"), createServerScript(), "utf8");

  createZip(zipPath, packageDir);

  console.log(`PACKAGED_DIR=${packageDir}`);
  console.log(`PACKAGED_ZIP=${zipPath}`);
  console.log("Packaging complete.");
}

main();
