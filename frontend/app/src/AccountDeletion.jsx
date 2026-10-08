import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Sheet from "./Sheet.jsx";
import Icon from "./Icon.jsx";

export default function AccountDeletion() {
  const app = useApp();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function erase() {
    setBusy(true);
    try {
      if (app.mode === "real") {
        await app.requestDeletion();
        setConfirm(false);
        navigate("/acceso", {
          replace: true,
          state: { deletionRequested: true },
        });
        return;
      }
      app.deleteDemoAccount();
      setReason("");
      setConfirm(false);
      navigate("/acceso", { replace: true, state: { deleted: true } });
    } catch (err) {
      setError(
        app.mode === "real"
          ? "No se pudo registrar la solicitud. Vuelve a iniciar sesión y reintenta con conexión."
          : err.message,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="account-deletion">
      <h3>Eliminar cuenta</h3>
      <p className="helper">
        {app.mode === "real"
          ? "Solicita el borrado de tu cuenta. Se retirará el acceso y los avisos; la eliminación de datos queda pendiente de revisión y obligaciones de conservación. Debes haber iniciado sesión en los últimos 10 minutos."
          : "Elimina del dispositivo el perfil de ejemplo, consultas, mensajes, preferencias y nombres de documentos seleccionados. Se cerrará tu sesión. Esta demo no tiene una cuenta en un servidor."}
      </p>
      {app.mode === "demo" ? (
        <>
          <label>
            Motivo o instrucciones para el equipo{" "}
            <span className="helper">(opcional)</span>
            <textarea
              rows={3}
              maxLength={1000}
              value={reason}
              placeholder="Opcional"
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <p className="helper">
            El motivo no se envía ni se guarda. Si vuelves a explorar la demo,
            comenzarás un ejemplo nuevo.
          </p>
          <button
            className="btn danger-btn"
            onClick={() => {
              setError("");
              setConfirm(true);
            }}
          >
            <Icon name="trash" size={18} />
            Cerrar y borrar cuenta
          </button>
        </>
      ) : app.mode === "real" ? (
        <button
          className="btn danger-btn"
          onClick={() => {
            setError("");
            setConfirm(true);
          }}
        >
          Solicitar borrado de cuenta
        </button>
      ) : (
        <p className="notice">
          {app.mode === "visitante"
            ? "No hay una sesión de ejemplo abierta. Los datos locales ya eliminados no se recuperan al iniciar otro ejemplo."
            : "El borrado de cuentas reales está pendiente de conectar. Esta versión sólo permite borrar el ejemplo local."}
        </p>
      )}
      {confirm && (
        <Sheet
          title={
            app.mode === "real"
              ? "¿Solicitar borrado de tu cuenta?"
              : "¿Borrar tu cuenta de ejemplo?"
          }
          onClose={() => setConfirm(false)}
          closeLabel="Cancelar borrado"
        >
          <p>
            {app.mode === "real"
              ? "Se registrará tu solicitud y se cerrarán tus sesiones. El equipo revisará los datos sujetos a conservación antes de completar la eliminación."
              : "Se eliminarán los datos del recorrido guardados en este dispositivo. No podrás recuperar este ejemplo."}
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="stack">
            <button className="btn danger-btn" disabled={busy} onClick={erase}>
              {app.mode === "real"
                ? "Confirmar solicitud de borrado"
                : "Borrar cuenta de ejemplo"}
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
