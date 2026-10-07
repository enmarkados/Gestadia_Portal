import React from "react";
import { Link, useLocation } from "react-router-dom";
import { SERVICIOS } from "../../../shared/servicios.js";
import { PAISES } from "../../../shared/paises-canje.js";
import { countryKey } from "./api.js";
import { backNavigation } from "./navigation.js";

export default function DemoCheckout() {
  const location = useLocation();
  const { state } = location;
  const back = backNavigation(location, "/servicios");
  const service = SERVICIOS[state?.service] || SERVICIOS["canje-carnet"];
  const profile = state?.profile || {};
  return (
    <section>
      <p className="eyebrow">TU PRÓXIMA GESTIÓN</p>
      <h1>Revisa tu servicio</h1>
      <div className="card form-card">
        <h2>{service.nombre}</h2>
        <p className="price">{service.precio} €</p>
        <p>{service.descripcion}</p>
        {profile.nombre && (
          <p>
            <strong>Nombre:</strong> {profile.nombre} {profile.apellidos}
          </p>
        )}
        {profile.email && (
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
        )}
        {profile.paisCanje && (
          <p>
            <strong>País del permiso:</strong>{" "}
            {PAISES[countryKey(profile.paisCanje)]?.nombre}
          </p>
        )}
        <p className="notice">
          Has llegado al final de este recorrido de ejemplo. No se contrata
          ningún servicio ni se realiza un pago.
        </p>
        <Link className="btn primary" to="/">
          Volver a la app
        </Link>
        <Link className="text-btn" to={back.to} state={back.state} replace>
          Revisar otros servicios
        </Link>
      </div>
    </section>
  );
}
