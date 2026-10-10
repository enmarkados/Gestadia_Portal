const routes =
  /^(?:\/(?:acceso|registro|cuenta|tramites|mensajes|servicios)?|\/lidia\/conversacion|\/mensajes\/gestor|\/tramites\/[^/?#]+|\/legal\/(?:privacy|terms|support|delete-account))(?:\?[^#]*)?$/;

export function routePath(location) {
  return location.pathname + (location.search || "");
}

function internalPath(path) {
  return typeof path === "string" && routes.test(path);
}

export function navigationState(location, additions = {}) {
  return {
    ...additions,
    from: routePath(location),
    fromState: location.state || null,
  };
}

export function backNavigation(location, fallback = "/") {
  const from = location.state?.from;
  const useOrigin = internalPath(from) && from !== routePath(location);
  const to = useOrigin ? from : fallback;
  const path = to.split("?")[0];
  const label =
    path === "/tramites"
      ? "Volver a Trámites"
      : path.startsWith("/tramites/")
        ? "Volver a tu trámite"
        : path === "/mensajes"
          ? "Volver a Mensajes"
          : path === "/mensajes/gestor"
            ? "Volver a la conversación"
            : path === "/lidia/conversacion"
              ? "Volver a la conversación con LidIA"
              : path === "/servicios"
                ? "Volver a Servicios"
                : path === "/cuenta"
                  ? "Volver a Mi Perfil"
                  : path === "/acceso"
                    ? "Volver al acceso"
                    : path === "/registro"
                      ? "Volver al registro"
                      : "Volver a LidIA";
  return {
    to,
    state: useOrigin ? location.state?.fromState || null : null,
    label,
  };
}

export function accessState(location) {
  return {
    ...navigationState(location),
    returnTo: routePath(location),
    returnState: location.state || null,
  };
}

export function accessDestination(location) {
  const target = location.state?.returnTo;
  if (
    internalPath(target) &&
    !["/acceso", "/registro"].includes(target.split("?")[0])
  )
    return { to: target, state: location.state?.returnState || null };
  return {
    to: ["/cuenta", "/mensajes"].includes(location.pathname)
      ? routePath(location)
      : "/",
    state: location.state || null,
  };
}

export function authFlowState(location) {
  const destination = accessDestination(location);
  return {
    ...location.state,
    returnTo: destination.to,
    returnState: destination.state,
  };
}
