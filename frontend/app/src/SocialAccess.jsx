import React, { useEffect, useState } from "react";
import { useApp } from "./AppContext.jsx";
import { demoOnly, platform } from "./api.js";
import { socialClient, takeSocialResult } from "./social-auth.js";
export default function SocialAccess({ purpose = "login", onDone = () => {} }) {
  const app = useApp();
  const [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const available =
    !demoOnly() &&
    ["ios", "android"].includes(platform()) &&
    globalThis.GESTADIA_APP_CONFIG?.social;
  async function receive(value) {
    if (value.token) {
      await app.acceptSession(value.token);
      onDone();
      setResult(null);
    } else if (value.status === "linked") {
      setResult(value);
      onDone();
    } else setResult(value);
  }
  useEffect(() => {
    if (!available) return;
    const handler = (e) => {
      const value = takeSocialResult() || e?.detail;
      if (value?.error) setError(value.error);
      else if (value?.result)
        receive(value.result).catch((e) => setError(e.message));
    };
    window.addEventListener("gestadia-social-result", handler);
    handler();
    return () => window.removeEventListener("gestadia-social-result", handler);
  }, [available]);
  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await receive(await action());
    } catch {
      setError(
        "No se pudo completar el acceso. Puedes volver a intentarlo o entrar con tu email y contraseña.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!available) return null;
  return (
    <div className="card social-access">
      <p>
        {purpose === "link"
          ? "Vincular acceso a esta cuenta"
          : "También puedes acceder con"}
      </p>
      {["apple", "google"]
        .filter((provider) => available[provider])
        .map((provider) => (
          <button
            key={provider}
            className="btn secondary"
            disabled={busy}
            onClick={() => run(() => socialClient.start(provider, purpose))}
          >
            {purpose === "link" ? "Vincular" : "Continuar con"}{" "}
            {provider === "apple" ? "Apple" : "Google"}
          </button>
        ))}
      {result?.status === "account_required" && (
        <>
          <p>
            Se creará una cuenta Gestadia nueva, sin trámites asociados.{" "}
            {result.emailAvailable
              ? "Confirma para continuar."
              : "El proveedor no ha facilitado un email verificado. Vuelve a iniciar el acceso compartiendo tu email."}
          </p>
          {result.emailAvailable && (
            <button
              className="btn primary"
              disabled={busy}
              onClick={() => run(() => socialClient.confirm("create"))}
            >
              Confirmar creación de cuenta
            </button>
          )}
        </>
      )}
      {result?.status === "existing_account_required" && (
        <p role="status">
          Accede primero con tu email y contraseña de Gestadia. Después puedes
          vincular Apple o Google desde Mi Perfil.
        </p>
      )}
      {result?.status === "link_required" && (
        <>
          <p>Este proveedor se vinculará a tu cuenta Gestadia actual.</p>
          <button
            className="btn primary"
            disabled={busy}
            onClick={() => run(() => socialClient.confirm("link"))}
          >
            Confirmar vinculación
          </button>
        </>
      )}
      {result?.status === "browser_open" && (
        <p role="status">
          Completa el acceso Apple en el navegador y vuelve a la app.
        </p>
      )}
      {result?.status === "linked" && <p role="status">Acceso vinculado.</p>}
      {result && result.status !== "linked" && (
        <button
          className="text-btn"
          onClick={() => {
            socialClient.cancel().catch(() => {});
            setResult(null);
          }}
        >
          Cancelar
        </button>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
