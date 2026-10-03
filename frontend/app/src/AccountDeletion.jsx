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
  function erase() {
    try {
      app.deleteDemoAccount();
      setReason("");
      setConfirm(false);
      navigate("/acceso", { replace: true, state: { deleted: true } });
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <div className="account-deletion">
      <h3>Eliminar cuenta</h3>
      <p className="helper">
        Elimina del dispositivo el perfil de ejemplo, consultas, mensajes,
        preferencias y nombres de documentos seleccionados. Se cerrará tu
        sesión. Esta demo no tiene una cuenta en un servidor.
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
      ) : (
        <p className="notice">
          {app.mode === "visitante"
            ? "No hay una sesión de ejemplo abierta. Los datos locales ya eliminados no se recuperan al iniciar otro ejemplo."
            : "El borrado de cuentas reales está pendiente de conectar. Esta versión sólo permite borrar el ejemplo local."}
        </p>
      )}
      {confirm && (
        <Sheet
          title="¿Borrar tu cuenta de ejemplo?"
          onClose={() => setConfirm(false)}
          closeLabel="Cancelar borrado"
        >
          <p>
            Se eliminarán los datos del recorrido guardados en este dispositivo.
            No podrás recuperar este ejemplo.
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="stack">
            <button className="btn danger-btn" onClick={erase}>
              Borrar cuenta de ejemplo
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
