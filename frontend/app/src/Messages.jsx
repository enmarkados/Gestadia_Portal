import React from "react";
import { Link } from "react-router-dom";
export default function Messages() {
  return (
    <section className="messages-page">
      <h1>Mensajes</h1>
      <p>
        Las conversaciones estarán disponibles cuando se active la conexión con
        el servicio de atención de Gestadia.
      </p>
      <Link className="btn primary" to="/">
        Ir a LidIA
      </Link>
    </section>
  );
}
