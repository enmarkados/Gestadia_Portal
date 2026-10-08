import { PAISES, claveDesdeISO } from "../../../shared/paises-canje.js";
const config = () => globalThis.GESTADIA_APP_CONFIG || {};
export function countryKey(value) {
  const slug = String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
  if (PAISES[slug]) return slug;
  if (claveDesdeISO(value)) return claveDesdeISO(value);
  return (
    Object.values(PAISES).find(
      (p) =>
        p.nombre
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, "-") === slug,
    )?.clave || ""
  );
}
const TOKEN_KEY = "gestadia_app_token";
export const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) =>
  token
    ? sessionStorage.setItem(TOKEN_KEY, token)
    : sessionStorage.removeItem(TOKEN_KEY);
export const demoEnabled = () => config().demoEnabled !== false;
export const demoOnly = () => config().demoOnly === true;
export async function request(path, { auth = true, ...options } = {}) {
  if (demoOnly())
    throw new Error(
      "Esta versión de demostración no realiza conexiones externas.",
    );
  const token = auth ? getToken() : null;
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  let response;
  try {
    response = await fetch(
      `${(config().apiBaseUrl || "").replace(/\/$/, "")}${path}`,
      {
        ...options,
        headers,
      },
    );
  } catch {
    throw new Error(
      "No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.",
    );
  }
  const body = await response.json().catch(() => null);
  if (response.status === 401 && token && getToken() === token) {
    setToken(null);
    window.dispatchEvent(new Event("gestadia-session-expired"));
  }
  if (!response.ok) {
    const error = new Error(
      body?.error ||
        (response.status === 401
          ? "Tu sesión ha caducado. Vuelve a entrar."
          : "No se pudo completar la solicitud. Inténtalo de nuevo."),
    );
    error.code = body?.code;
    error.status = response.status;
    throw error;
  }
  if (!body)
    throw new Error(
      "El servidor no ha devuelto datos válidos. Revisa la conexión con el portal.",
    );
  return body;
}
export function checkoutUrl(slug, profile = {}) {
  const url = new URL(
    "/checkout",
    config().checkoutBaseUrl || "https://gestadia.com",
  );
  url.searchParams.set("servicio", slug);
  url.searchParams.set("procedencia", "lidia");
  for (const key of [
    "nombre",
    "apellidos",
    "email",
    "telefono",
    "numDocumento",
    "tipoDocumento",
    "paisCanje",
  ]) {
    const value =
      key === "paisCanje" ? countryKey(profile[key]) : profile[key]?.trim();
    if (value) url.searchParams.set(key, value);
  }
  return url.href;
}
