const origins = new Set(["capacitor://localhost", "https://localhost"]);
export const mobileCors = (enabled) => (req, res, next) => {
  if (!enabled || !req.headers.origin || !origins.has(req.headers.origin)) {
    if (enabled && req.method === "OPTIONS" && req.headers.origin)
      return res.status(403).end();
    return next();
  }
  res.set("Access-Control-Allow-Origin", req.headers.origin);
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
};
