import React, { useState, useRef, useLayoutEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { SERVICIOS } from "../../../shared/servicios.js";
import { useApp } from "./AppContext.jsx";
import { checkoutUrl, countryKey } from "./api.js";
import { paisesOrdenados } from "../../../shared/paises-canje.js";
import Icon from "./Icon.jsx";
import { openExternal } from "./native.js";
export default function Services() {
  const { data } = useApp();
  const location = useLocation();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState(
    params.get("servicio") || "canje-carnet",
  );
  const [profile, setProfile] = useState({
    ...(location.state?.serviceDraft || data.profile),
  });
  const service = SERVICIOS[selected] || SERVICIOS["canje-carnet"];
  const [error, setError] = useState("");
  const selectedTitle = useRef(null);
  const [scrollRequest, setScrollRequest] = useState(0);
  useLayoutEffect(() => {
    if (!scrollRequest) return;
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const main = selectedTitle.current?.closest("main");
    if (main && selectedTitle.current)
      main.scrollTo?.({
        top:
          main.scrollTop +
          selectedTitle.current.getBoundingClientRect().top -
          main.getBoundingClientRect().top -
          16,
        behavior: reduced ? "instant" : "smooth",
      });
    selectedTitle.current?.focus({ preventScroll: true });
  }, [selected, scrollRequest]);
  async function submit(e) {
    e.preventDefault();
    try {
      await openExternal(checkoutUrl(service.slug, profile));
    } catch {
      setError(
        "No se pudo abrir el checkout. Revisa la configuración de la app.",
      );
    }
  }
  return (
    <section className="services-page">
      <p className="eyebrow">GESTIÓN 100% ONLINE</p>
      <h1>Trámites y Gestiones DGT</h1>
      <p className="muted">
        Servicio integral con tu gestor asignado y documentación de tu trámite.
      </p>
      <div className="service-benefits">
        <div>
          <Icon name="check" size={18} />
          Gestor asignado
        </div>
        <div>
          <Icon name="check" size={18} />
          Tasas DGT incluidas
        </div>
      </div>
      <div className="stack">
        {["canje-carnet", "transferencia", "duplicado-carnet"].map((slug) => {
          const s = SERVICIOS[slug];
          return (
            <button
              className={`card service ${selected === slug ? "selected" : ""}`}
              key={slug}
              aria-pressed={selected === slug}
              onClick={() => {
                setSelected(slug);
                setScrollRequest((old) => old + 1);
              }}
            >
              <span className="service-title">{s.nombre}</span>
              <span className="price">{s.precio} €</span>
              <span className="service-detail">
                {slug === "duplicado-carnet"
                  ? "Permiso provisional en 24 h"
                  : "Gestión completa · Gestor asignado"}
              </span>
              <span className="helper">{s.descripcion}</span>
            </button>
          );
        })}
      </div>
      <h2 className="selected-service-title" ref={selectedTitle} tabIndex={-1}>
        {service.nombre}
      </h2>
      <form className="card form-card services-form" onSubmit={submit}>
        <h3>Tus datos de tramitación</h3>
        <ProfileFields profile={profile} setProfile={setProfile} compact />
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
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="btn primary" type="submit">
          Continuar en la web <Icon name="external" size={18} />
        </button>
        <p className="helper service-checkout-help">
          Se abrirá gestadia.com/checkout con tus datos y el trámite
          seleccionado ya rellenados.
        </p>
      </form>
    </section>
  );
}
export function ProfileFields({
  profile,
  setProfile,
  required = false,
  compact = false,
}) {
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
          <span className={compact ? "sr-only" : undefined}>{label}</span>
          <input
            name={key}
            type={type}
            autoComplete={autoComplete}
            placeholder={compact ? label : undefined}
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
        <span className={compact ? "sr-only" : undefined}>
          Tipo de documento
        </span>
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
