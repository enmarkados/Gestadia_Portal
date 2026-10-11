import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { authFlowState } from "./navigation.js";
import { useApp } from "./AppContext.jsx";
import { platform } from "./api.js";
import { socialClient, takeSocialResult } from "./social-auth.js";
export default function SocialAccess({ purpose = "login", onDone = () => {} }) {
  const app = useApp();
  const location = useLocation();
  const [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const available =
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
    <div className="card social-access" data-platform={platform()}>
      <h3>{purpose === "link" ? "Vincula tu cuenta" : "Accede con Apple o Google"}</h3>
      <p>{purpose === "link" ? "Vincula Apple o Google para entrar con esos proveedores a esta misma cuenta Gestadia. Tus trámites y conversaciones se conservan." : "Usa el mismo correo que en tu cuenta Gestadia. Si coincide con el correo verificado del proveedor, accederás directamente."}</p>
      {["apple", "google"]
        .filter((provider) => available[provider])
        .map((provider) => (
          <button
            key={provider}
            type="button"
            className={`provider-button provider-button-${provider}`}
            aria-label={`Continuar con ${provider === "apple" ? "Apple" : "Google"}`}
            disabled={busy}
            onClick={() => run(() => socialClient.start(provider, purpose))}
          >
            {provider === "apple" ? (
              <img src="/brand/social/apple-continue-es.png" width="220" height="48" alt="" aria-hidden="true" />
            ) : (
              <>
                <img src="/brand/social/google-g.svg" width="20" height="20" alt="" aria-hidden="true" />
                <span>Continuar con Google</span>
              </>
            )}
          </button>
        ))}
      {["account_required", "existing_account_required"].includes(result?.status) && <div className="social-account-required" role="status">
        <p>{result.emailAvailable ? "No encontramos una cuenta Gestadia con el correo verificado de este proveedor." : "Necesitamos que el proveedor comparta un correo verificado para identificar tu cuenta Gestadia."}</p>
        <p>La cuenta Gestadia se crea al contratar un servicio. Si ya tienes una, prueba con el correo que usas en el portal.</p>
        <Link className="btn secondary" to="/registro" state={authFlowState(location)} onClick={() => socialClient.cancel().catch(() => {})}>Tu cuenta Gestadia</Link>
      </div>}
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
          className="btn secondary"
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
