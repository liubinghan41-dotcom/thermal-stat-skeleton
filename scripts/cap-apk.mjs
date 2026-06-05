import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");

function run(label, command, args, options = {}) {
  const child = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    ...options,
  });

  if (child.error) {
    throw child.error;
  }
  if (child.status !== 0) {
    throw new Error(`${label} failed with exit code ${child.status}`);
  }
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
Android APK packaging helper

Usage:
  npm run cap:apk
`);
  process.exit(0);
}

run("Build web app", "npm", ["run", "build"], { cwd: projectRoot });
run("Capacitor sync", "npx", ["cap", "sync", "android"], { cwd: projectRoot });

const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
run("Assemble debug APK", gradlew, ["assembleDebug"], { cwd: join(projectRoot, "android"), shell: true });

console.log("APK generated at android/app/build/outputs/apk/debug/app-debug.apk");
