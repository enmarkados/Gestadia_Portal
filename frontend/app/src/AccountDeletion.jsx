import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Sheet from "./Sheet.jsx";
export default function AccountDeletion() {
  const app = useApp();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function erase() {
    setBusy(true);
    try {
      await app.requestDeletion();
      setConfirm(false);
      navigate("/acceso", {
        replace: true,
        state: { deletionRequested: true },
      });
    } catch {
      setError(
        "No se pudo registrar la solicitud. Vuelve a iniciar sesión y reintenta con conexión.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (app.mode !== "real") return null;
  return (
    <div className="account-deletion">
      <h3>Eliminar cuenta</h3>
      <p className="helper">
        Solicita el borrado de tu cuenta. Se retirará el acceso y los avisos; la
        eliminación de datos queda pendiente de revisión y obligaciones de
        conservación. Debes haber iniciado sesión en los últimos 10 minutos.
      </p>
      <button
        className="btn danger-btn"
        onClick={() => {
          setError("");
          setConfirm(true);
        }}
      >
        Solicitar borrado de cuenta
      </button>
      {confirm && (
        <Sheet
          title="¿Solicitar borrado de tu cuenta?"
          onClose={() => setConfirm(false)}
          closeLabel="Cancelar borrado"
        >
          <p>
            Se registrará tu solicitud y se cerrarán tus sesiones. El equipo
            revisará los datos sujetos a conservación antes de completar la
            eliminación.
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="stack">
            <button className="btn danger-btn" disabled={busy} onClick={erase}>
              Confirmar solicitud de borrado
            </button>
            <button className="btn secondary" onClick={() => setConfirm(false)}>
              Conservar mi cuenta
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
