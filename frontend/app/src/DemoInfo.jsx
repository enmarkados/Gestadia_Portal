import React from "react";
import { Link } from "react-router-dom";
export default function DemoInfo() {
  return (
    <section>
      <p className="eyebrow">GESTADIA · PRIMERA VERSIÓN</p>
      <h1>Explora la demostración</h1>
      <div className="card form-card">
        <p>
          Esta versión permite conocer las pantallas y los recorridos de
          Gestadia con datos de ejemplo.
        </p>
        <p>
          Las cuentas, conversaciones, documentos y solicitudes funcionan
          únicamente en este dispositivo. No se envían al gestor ni a una
          plataforma externa y no se realizan pagos.
        </p>
        <p>
          El registro no crea una cuenta real. No se almacenan contraseñas ni el
          contenido de los archivos seleccionados. Usa datos de ejemplo para la
          presentación.
        </p>
        <p>
          Puedes reiniciar el recorrido desde Mi cuenta, eligiendo el perfil de
          cliente o de lead.
        </p>
        <Link className="btn primary" to="/">
          Volver a la app
        </Link>
      </div>
    </section>
  );
}
