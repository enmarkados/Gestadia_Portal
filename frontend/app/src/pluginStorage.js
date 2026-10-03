const PREFIX = "gestadia_pluginweb_session:";
export function readPluginSession(key) {
  try {
    const value = JSON.parse(sessionStorage.getItem(PREFIX + key));
    return value?.sessionId && value?.sessionToken && value?.visitorId
      ? value
      : null;
  } catch {
    return null;
  }
}
export function storePluginSession(key, value) {
  try {
    if (value) sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
    else sessionStorage.removeItem(PREFIX + key);
  } catch {
    /* sesión disponible en memoria */
  }
}
export function clearPluginSessions() {
  try {
    for (const key of Object.keys(sessionStorage))
      if (key.startsWith(PREFIX)) sessionStorage.removeItem(key);
  } catch {
    /* almacenamiento no disponible */
  }
}
