import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
export function validateRelease(config, signing, platform, env = process.env) {
  const errors = [];
  if (!["ios", "android"].includes(platform))
    errors.push("Plataforma no admitida");
  if (config?.appId !== "com.gestadia.app")
    errors.push("Identificador de app incorrecto");
  if (config?.demoOnly !== false || config?.demoEnabled !== false)
    errors.push("La release no puede ser demo");
  let base;
  try {
    base = new URL(config.apiBaseUrl);
    if (
      base.protocol !== "https:" ||
      base.username ||
      base.password ||
      /^(localhost|127\.|10\.|192\.168\.)/.test(base.hostname)
    )
      throw Error();
  } catch {
    errors.push("La API de release necesita un origen HTTPS público");
  }
  if (config?.push?.enabled !== true)
    errors.push("Falta configurar notificaciones");
  for (const field of ["webClientId", "iosClientId"])
    if (
      !config?.social?.google?.[field]?.endsWith(".apps.googleusercontent.com")
    )
      errors.push(`Falta cliente Google ${field}`);
  if (
    config?.social?.apple?.clientId !== "com.gestadia.app" ||
    !config?.social?.apple?.androidServiceId
  )
    errors.push("Falta configuración Apple");
  try {
    const callback = new URL(config.social.apple.redirectUrl);
    if (
      !base ||
      callback.origin !== base.origin ||
      callback.pathname !== "/api/auth/social/apple/callback" ||
      callback.search ||
      callback.hash
    )
      throw Error();
  } catch {
    errors.push("El callback Apple debe ser el HTTPS de la API");
  }
  function inspect(value) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (
        /(secret|password|private.?key|credential|refresh.?token|access.?token|id.?token)/i.test(
          key,
        )
      )
        errors.push("La configuración pública contiene un secreto");
      inspect(child);
    }
  }
  inspect(config);
  if (platform === "ios" && !/^[A-Z0-9]{10}$/.test(signing?.teamId || ""))
    errors.push("Falta equipo Apple de firma");
  if (platform === "android") {
    if (
      !signing?.keystore ||
      !existsSync(signing.keystore) ||
      !signing.alias ||
      !env[signing.storePasswordEnv] ||
      !env[signing.keyPasswordEnv]
    )
      errors.push("Falta keystore/alias/contraseñas de firma Android");
    let firebase;
    try {
      firebase = JSON.parse(readFileSync(signing.firebaseFile, "utf8"));
    } catch {}
    if (
      !firebase?.client?.some(
        (c) =>
          c.client_info?.android_client_info?.package_name === config.appId,
      )
    )
      errors.push("Falta Firebase del paquete de Gestadia");
  }
  return [...new Set(errors)];
}
export function verifyCapabilities(config, capabilities) {
  if (
    capabilities?.mobileEnabled !== true ||
    capabilities?.pushEnabled !== true ||
    capabilities?.appId !== "com.gestadia.app" ||
    capabilities?.google?.webClientId !== config.social.google.webClientId ||
    capabilities?.google?.iosClientId !== config.social.google.iosClientId ||
    capabilities?.apple?.clientId !== config.social.apple.clientId ||
    capabilities?.apple?.serviceId !== config.social.apple.androidServiceId
  )
    throw new Error(
      "Backend móvil no habilitado o clientes sociales distintos",
    );
}
export const publicConfigScript = (config) =>
  `window.GESTADIA_APP_CONFIG = ${JSON.stringify(config)};\n`;
export function verifyPackagedRelease(config, source) {
  if (source !== publicConfigScript(config))
    throw new Error(
      "El binario contiene otra configuración. Ejecuta mobile:release:prepare y cap sync.",
    );
}
export function readReleaseInputs(platform) {
  if (
    !process.env.MOBILE_PUBLIC_CONFIG_FILE ||
    !process.env.MOBILE_SIGNING_CONFIG_FILE
  )
    throw new Error(
      "Configura MOBILE_PUBLIC_CONFIG_FILE y MOBILE_SIGNING_CONFIG_FILE fuera de Git",
    );
  const config = JSON.parse(
    readFileSync(process.env.MOBILE_PUBLIC_CONFIG_FILE, "utf8"),
  );
  const signing = JSON.parse(
    readFileSync(process.env.MOBILE_SIGNING_CONFIG_FILE, "utf8"),
  );
  const errors = validateRelease(config, signing, platform);
  if (errors.length) throw new Error(errors.join("\n"));
  return { config, signing };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    const platform = process.argv[2];
    const { config, signing } = readReleaseInputs(platform);
    if (process.argv.includes("--packaged")) {
      const repo = new URL("../", import.meta.url);
      const path =
        platform === "ios"
          ? "frontend/ios/App/App/public/app-config.js"
          : "frontend/android/app/src/main/assets/public/app-config.js";
      verifyPackagedRelease(config, readFileSync(new URL(path, repo), "utf8"));
      if (
        platform === "ios" &&
        (process.env.DEVELOPMENT_TEAM !== signing.teamId ||
          process.env.GOOGLE_IOS_REVERSED_CLIENT_ID !==
            config.social.google.iosClientId.split(".").reverse().join("."))
      )
        throw new Error(
          "El equipo/cliente Google de Xcode no coincide con la configuración",
        );
    }
    console.log(
      "Preflight válido; queda verificar firma del binario y backend conectado.",
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
