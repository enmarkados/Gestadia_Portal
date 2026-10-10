import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigationState } from "./navigation.js";
import { useApp } from "./AppContext.jsx";
import { conversationsEnabled } from "./conversationApi.js";
import Sheet from "./Sheet.jsx";
export default function Contact({ onClose }) {
  const { mode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Sheet title="Atención Gestadia" onClose={onClose}>
      {mode === "real" && conversationsEnabled() ? (
        <>
          <p>Consulta con el equipo desde la conversación de atención.</p>
          <button
            className="btn dark-btn"
            onClick={() => {
              onClose();
              navigate("/mensajes/gestor", {
                state: navigationState(location),
              });
            }}
          >
            Abrir conversación de atención
          </button>
        </>
      ) : (
        <>
          <p>Contacta con el equipo de Gestadia para consultar tu trámite.</p>
          <a className="btn primary" href="tel:+34910600314">
            Llamar a Gestadia
          </a>
          <a className="text-btn" href="mailto:info@gestadia.com">
            Escribir a Gestadia
          </a>
        </>
      )}
    </Sheet>
  );
}
