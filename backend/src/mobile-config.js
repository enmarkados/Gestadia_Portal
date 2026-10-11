export function readMobileConfig(env = process.env) {
  return {
    enabled: env.MOBILE_FEATURES_ENABLED === "true",
    encryptionKey: env.MOBILE_ENCRYPTION_KEY || "",
    google: {
      webClientId: env.GOOGLE_WEB_CLIENT_ID || "",
      iosClientId: env.GOOGLE_IOS_CLIENT_ID || "",
    },
    apple: {
      clientId: "com.gestadia.app",
      serviceId: env.APPLE_SERVICE_ID || "",
      teamId: env.APPLE_TEAM_ID || "",
      keyId: env.APPLE_AUTH_KEY_ID || "",
      privateKeyFile: env.APPLE_AUTH_KEY_FILE || "",
      callbackUrl: env.APPLE_CALLBACK_URL || "",
      returnUrl: "gestadia://auth/apple",
    },
    push: {
      enabled: env.MOBILE_PUSH_ENABLED === "true",
      apnsEnvironment:
        env.APNS_ENVIRONMENT === "production" ? "production" : "development",
      apnsTeamId: env.APPLE_TEAM_ID || "",
      apnsKeyId: env.APNS_KEY_ID || "",
      apnsKeyFile: env.APNS_KEY_FILE || "",
      firebaseCredentialFile: env.FIREBASE_CREDENTIAL_FILE || "",
    },
  };
}
export const mobileConfig = readMobileConfig();

export function validateMobileConfig(config, env = process.env) {
  if (!config.enabled) return [];
  const errors = [];
  if (
    !env.JWT_SECRET ||
    env.JWT_SECRET.length < 32 ||
    env.JWT_SECRET === "dev-secret-cambiar"
  )
    errors.push("JWT_SECRET");
  if (Buffer.from(config.encryptionKey, "base64").length !== 32)
    errors.push("MOBILE_ENCRYPTION_KEY");
  for (const [name, value] of Object.entries(config.google))
    if (!value.endsWith(".apps.googleusercontent.com"))
      errors.push(`GOOGLE_${name}`);
  const apple = config.apple;
  if (
    !apple.serviceId ||
    !/^[A-Z0-9]{10}$/.test(apple.teamId) ||
    !/^[A-Z0-9]{10}$/.test(apple.keyId) ||
    !apple.privateKeyFile
  )
    errors.push("APPLE_AUTH");
  try {
    const url = new URL(apple.callbackUrl);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/api/auth/social/apple/callback" ||
      url.search ||
      url.hash
    )
      throw Error();
  } catch {
    errors.push("APPLE_CALLBACK_URL");
  }
  if (
    config.push.enabled &&
    (!config.push.apnsKeyId ||
      !config.push.apnsKeyFile ||
      !config.push.firebaseCredentialFile)
  )
    errors.push("PUSH_CREDENTIALS");
  return errors;
}
