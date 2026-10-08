import { writeFileSync, copyFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  readReleaseInputs,
  publicConfigScript,
  verifyCapabilities,
} from "./mobile-preflight.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) throw Error(`${command} no completó la compilación`);
}
try {
  const platform = process.argv[2];
  const { config, signing } = readReleaseInputs(platform);
  const response = await fetch(
    `${config.apiBaseUrl.replace(/\/$/, "")}/api/mobile/capabilities`,
    { signal: AbortSignal.timeout(10000), redirect: "error" },
  );
  if (!response.ok) throw Error("Backend móvil no disponible");
  verifyCapabilities(config, await response.json());
  run("npm", ["run", "build:app"], resolve(root, "frontend"));
  writeFileSync(
    resolve(root, "frontend/dist-app/app-config.js"),
    publicConfigScript(config),
  );
  if (platform === "android")
    copyFileSync(
      signing.firebaseFile,
      resolve(root, "frontend/android/app/google-services.json"),
    );
  run("npx", ["cap", "sync", platform], resolve(root, "frontend"));
  if (process.argv.includes("--build")) {
    if (platform === "android")
      run("./gradlew", ["bundleRelease"], resolve(root, "frontend/android"));
    else {
      mkdirSync(resolve(root, ".superpowers/releases"), { recursive: true });
      run("xcodebuild", [
        "-project",
        "frontend/ios/App/App.xcodeproj",
        "-scheme",
        "App",
        "-configuration",
        "Release",
        "-destination",
        "generic/platform=iOS",
        "-archivePath",
        ".superpowers/releases/Gestadia.xcarchive",
        `DEVELOPMENT_TEAM=${signing.teamId}`,
        `GOOGLE_IOS_REVERSED_CLIENT_ID=${config.social.google.iosClientId.split(".").reverse().join(".")}`,
        "archive",
      ]);
    }
  }
  console.log(
    "Configuración release preparada. Verifica firma, perfiles y pruebas reales antes de distribuir.",
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
