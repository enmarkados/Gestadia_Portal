import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { SERVICIOS } from "../../../shared/servicios.js";
import { useApp } from "./AppContext.jsx";
import { checkoutUrl, countryKey, demoOnly } from "./api.js";
import { paisesOrdenados } from "../../../shared/paises-canje.js";
import Icon from "./Icon.jsx";
import { openExternal } from "./native.js";
export default function Services() {
  const { data, mode } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState(
    params.get("servicio") || "canje-carnet",
  );
  const [profile, setProfile] = useState({
    ...data.profile,
  });
  const service = SERVICIOS[selected] || SERVICIOS["canje-carnet"];
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    try {
      if (demoOnly()) {
        navigate("/checkout-demo", {
          state: { service: service.slug, profile },
        });
        return;
      }
      await openExternal(checkoutUrl(service.slug, profile));
    } catch {
      setError(
        "No se pudo abrir el checkout. Revisa la configuración de la app.",
      );
    }
  }
  return (
    <section>
      <p className="eyebrow">GESTIÓN 100% ONLINE</p>
      <h1>Trámites y Gestiones DGT</h1>
      <p className="muted">
        Elige tu servicio y revisa los datos de tu próxima gestión.
      </p>
      <div className="stack">
        {["canje-carnet", "transferencia", "duplicado-carnet"].map((slug) => {
          const s = SERVICIOS[slug];
          return (
            <button
              className={`card service ${selected === slug ? "selected" : ""}`}
              key={slug}
              aria-pressed={selected === slug}
              onClick={() => setSelected(slug)}
            >
              <span className="service-title">{s.nombre}</span>
              <span className="price">{s.precio} €</span>
              <span className="helper">{s.descripcion}</span>
              <span className="service-detail">
                Gestión completa <Icon name="check" size={16} />
              </span>
            </button>
          );
        })}
      </div>
      <form className="card form-card" onSubmit={submit}>
        <h2>Continuar con {service.nombre.toLowerCase()}</h2>
        <p className="helper">Datos opcionales para preparar tu gestión.</p>
        <ProfileFields profile={profile} setProfile={setProfile} />
        {service.requierePais && (
          <label>
            País del permiso
            <select
              value={countryKey(profile.paisCanje)}
              onChange={(e) =>
                setProfile((old) => ({
                  ...old,
                  paisCanje: e.target.value,
                }))
              }
            >
              <option value="">Selecciona el país</option>
              {Object.entries(paisesOrdenados()).map(([group, countries]) => (
                <optgroup
                  key={group}
                  label={
                    group === "ue"
                      ? "Unión Europea y EEE"
                      : "Países del catálogo de canje"
                  }
                >
                  {countries.map((country) => (
                    <option value={country.clave} key={country.clave}>
                      {country.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        )}
        {mode === "demo" && (
          <p className="notice">
            {demoOnly()
              ? "Demostración: no se realiza ningún pago ni se contrata un servicio."
              : "El checkout es real. La demostración no efectúa ningún pago."}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn primary" type="submit">
          {demoOnly() ? "Continuar con el ejemplo" : "Continuar en la web"}{" "}
          <Icon name="arrow" size={18} />
        </button>
      </form>
    </section>
  );
}
export function ProfileFields({ profile, setProfile, required = false }) {
  const fields = [
    ["nombre", "Nombre", "text", "given-name"],
    ["apellidos", "Apellidos", "text", "family-name"],
    ["email", "Email", "email", "email"],
    ["telefono", "Teléfono", "tel", "tel"],
    ["numDocumento", "Número de documento", "text", "off"],
  ];
  return (
    <div className="fields">
      {fields.map(([key, label, type, autoComplete]) => (
        <label key={key}>
          {label}
          <input
            name={key}
            type={type}
            autoComplete={autoComplete}
            value={profile[key] || ""}
            required={required && key === "nombre"}
            readOnly={required && key === "email"}
            onChange={(e) =>
              setProfile((old) => ({
                ...old,
                [key]: e.target.value,
              }))
            }
          />
        </label>
      ))}
      <label>
        Tipo de documento
        <select
          value={profile.tipoDocumento || "DNI"}
          onChange={(e) =>
            setProfile((old) => ({
              ...old,
              tipoDocumento: e.target.value,
            }))
          }
        >
          <option>DNI</option>
          <option>NIE</option>
          <option>Pasaporte</option>
        </select>
      </label>
    </div>
  );
}
