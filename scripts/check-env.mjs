import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const packageJson = JSON.parse(readFileSync(join(projectRoot, "package.json"), "utf8"));
const checks = [];
const failures = [];

function parseVersion(version) {
  if (!version) return null;

  const match = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.\d+)?$/.exec(String(version).trim());
  if (!match) return null;

  return [Number(match[1]), Number(match[2] ?? "0"), Number(match[3] ?? "0")];
}

function compareVersions(left, right) {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) return 0;
  for (let i = 0; i < 3; i += 1) {
    const x = a[i];
    const y = b[i];
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

function satisfies(version, range) {
  const minMatch = /^>=(.+)$/.exec(range);
  if (minMatch) return compareVersions(version, minMatch[1]) >= 0;
  return true;
}

function runCommand(label, command, fallbackHint = "") {
  try {
    const output = execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
    checks.push(`OK ${label}: ${output}`);
    return output;
  } catch {
    failures.push(`FAIL ${label}: command not found or not executable.${fallbackHint ? ` ${fallbackHint}` : ""}`);
    return null;
  }
}

const nodeVersion = process.version;
const requiredNodeRange = packageJson.engines?.node || ">=20.10.0";
const requiredNpmRange = packageJson.engines?.npm || ">=10";
const nvmRc = readFileSync(join(projectRoot, ".nvmrc"), "utf8").trim();

if (!satisfies(nodeVersion, requiredNodeRange)) {
  failures.push(`FAIL Node version unsupported: current ${nodeVersion}, requires ${packageJson.engines?.node || ">=20.10.0"}`);
} else {
  checks.push(`OK Node version: ${nodeVersion} (required ${requiredNodeRange})`);
}

if (nvmRc) {
  const nvmMajor = parseVersion(nvmRc)?.[0];
  const nodeMajor = parseVersion(nodeVersion)?.[0];
  if (nvmMajor && nodeMajor && nvmMajor === nodeMajor) {
    checks.push(`OK .nvmrc major matches Node: ${nvmRc}`);
  } else if (nvmMajor && nodeMajor) {
    checks.push(`WARN .nvmrc recommends ${nvmRc}, current ${nodeVersion}`);
  }
}

const npmVersion = runCommand("npm", "npm --version", "Please install/update npm and add it to PATH.");
if (npmVersion) {
  if (satisfies(npmVersion, requiredNpmRange)) {
    checks.push(`OK npm version: ${npmVersion} (required ${requiredNpmRange})`);
  } else {
    failures.push(`FAIL npm version unsupported: current ${npmVersion}, requires ${requiredNpmRange}`);
  }
}

if (existsSync(join(projectRoot, "node_modules"))) {
  checks.push("OK node_modules exists");
} else {
  checks.push("WARN node_modules is missing. Run npm ci / npm install before first run.");
}

if (existsSync(join(projectRoot, "package.json"))) checks.push("OK package.json exists");
else failures.push("FAIL package.json missing");

if (existsSync(join(projectRoot, "tsconfig.json"))) checks.push("OK tsconfig.json exists");
else failures.push("FAIL tsconfig.json missing");

if (existsSync(join(projectRoot, "vite.config.ts"))) checks.push("OK vite.config.ts exists");
else failures.push("FAIL vite.config.ts missing");

if (existsSync(join(projectRoot, "src", "data", "meta.json"))) checks.push("OK src/data/meta.json exists");
else failures.push("FAIL src/data/meta.json missing");

if (existsSync(join(projectRoot, "android", "gradlew.bat")) || existsSync(join(projectRoot, "android", "gradlew"))) {
  checks.push("OK Android gradle wrapper exists");
} else {
  checks.push("WARN Android gradle wrapper missing, run capacitor sync/open flow first");
}

console.log("Environment check:");
for (const item of checks) console.log(item);
for (const item of failures) console.log(item);

if (failures.length > 0) {
  console.error("Environment checks failed. Please fix issues and rerun.");
  process.exit(1);
}

console.log("Environment is ready.");
