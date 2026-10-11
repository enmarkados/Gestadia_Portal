import React, { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { request } from "./api.js";
import Icon from "./Icon.jsx";
import { accessState, navigationState } from "./navigation.js";
export default function Expedientes() {
  const { data, mode } = useApp();
  const location = useLocation();
  return (
    <section className="workspace-page">
      <h1>Mis trámites</h1>
      <p className="muted">
        Consulta el estado de tu gestión y la documentación pendiente.
      </p>
      {!data.expedientes.length ? (
        <div className="card empty">
          <Icon name="clipboard" size={38} />
          <h2>
            {mode === "visitante"
              ? "Accede a tus trámites"
              : "Aún no tienes trámites activos"}
          </h2>
          <p>
            {mode === "visitante"
              ? "Entra con tu cuenta Gestadia para ver tus expedientes."
              : "LidIA puede ayudarte a preparar tu consulta."}
          </p>
          <Link
            className="btn primary"
            to={mode === "visitante" ? "/acceso" : "/servicios"}
            state={mode === "visitante" ? accessState(location) : null}
          >
            {mode === "visitante" ? "Entrar al portal" : "Ver servicios"}
          </Link>
        </div>
      ) : (
        <div className="stack">
          {data.expedientes.map((e) => (
            <article className="card expediente" key={e.id}>
              <p className="eyebrow">{e.nPedido}</p>
              <h2>{e.titulo}</h2>
              <progress
                max="100"
                value={e.progreso || 0}
                aria-label="Avance del trámite"
              />
              <p className="status-line">
                Estado: <strong>{e.estadoLabel || "En trámite"}</strong>
              </p>
              <Link
                className="btn dark-btn"
                to={`/tramites/${encodeURIComponent(e.id)}`}
                state={navigationState(location)}
              >
                Ver trámite y documentos
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
export function ExpedienteDetalle() {
  const { id } = useParams();
  const location = useLocation();
  const [params] = useSearchParams();
  const selectedDocument = params.get("documento");
  const { mode, data } = useApp();
  const [profile, setProfile] = useState(data.profile || {});
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(null);
  const [revision, setRevision] = useState(0);
  const documentPresentation = {
    residencia: {
      label: "1. Residencia legal (DNI/TIE)",
      description: "DNI, tarjeta de residencia o resguardo",
    },
    permiso_extranjero: {
      label: `2. Permiso original ${detail?.paisCanje || ""}`.trim(),
      description: "Fotografía legible por ambas caras",
    },
    psicotecnico: {
      label: "3. Examen psicotécnico",
      description: "Certificado de centro autorizado",
    },
  };
  useEffect(() => {
    if (!detail || !selectedDocument) return;
    if (!detail.checklist.some((doc) => doc.clave === selectedDocument)) return;
    const card = document.getElementById(`documento-${selectedDocument}`);
    card?.scrollIntoView?.({ block: "center" });
    card?.querySelector("input")?.focus({ preventScroll: true });
  }, [detail?.id, selectedDocument]);
  useEffect(() => {
    let active = true;
    setDetail(null);
    setError("");
    if (mode === "real")
      request(`/api/expedientes/${encodeURIComponent(id)}`)
        .then((value) => {
          if (active) setDetail(value);
        })
        .catch((err) => {
          if (active) setError(err.message);
        });
    return () => {
      active = false;
    };
  }, [id, mode, revision]);
  async function upload(clave, file) {
    if (!file) return;
    setError("");
    setNotice("");
    if (
      !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        file.type,
      ) ||
      file.size > 10 * 1024 * 1024
    ) {
      setError("Selecciona una imagen JPG, PNG, WEBP o PDF de hasta 10 MB.");
      return;
    }
    setBusy(clave);
    try {
      const form = new FormData();
      form.append("clave", clave);
      form.append("fichero", file);
      await request(`/api/expedientes/${encodeURIComponent(id)}/documentos`, {
        method: "POST",
        body: form,
      });
      setNotice("Documento recibido. Pendiente de revisión por tu gestor.");
      setRevision((value) => value + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }
  if (mode === "visitante")
    return (
      <section className="workspace-page">
        <h1>Tu trámite</h1>
        <Link
          className="btn primary"
          to="/acceso"
          state={accessState(location)}
        >
          Entrar al portal
        </Link>
      </section>
    );
  return (
    <section className="validation-page">
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!detail ? (
        <p role="status">
          {error ? "No se pudo cargar el expediente." : "Cargando tu trámite…"}
        </p>
      ) : (
        <form
          className="validation-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <p className="validation-description">
            Validación antes de la presentación del trámite.
          </p>
          <h2>1. Datos Personales y Filiación DGT</h2>
          <div className="validation-fields">
            <label>
              <span>Nombre</span>
              <input
                aria-label="Nombre"
                placeholder="Nombre"
                autoComplete="given-name"
                value={profile.nombre || ""}
                required
                onChange={(event) =>
                  setProfile({ ...profile, nombre: event.target.value })
                }
              />
            </label>
            <label>
              <span>Apellidos</span>
              <input
                aria-label="Apellidos"
                placeholder="Apellidos"
                autoComplete="family-name"
                value={profile.apellidos || ""}
                required
                onChange={(event) =>
                  setProfile({ ...profile, apellidos: event.target.value })
                }
              />
            </label>
            <div className="validation-document-fields">
              <label>
                <span>Número de documento</span>
                <input
                  aria-label="Número de documento"
                  placeholder={profile.tipoDocumento || "DNI/NIE"}
                  value={profile.numDocumento || ""}
                  onChange={(event) =>
                    setProfile({ ...profile, numDocumento: event.target.value })
                  }
                />
              </label>
              <label>
                <span>País del permiso</span>
                <input
                  aria-label="País del permiso"
                  value={detail.paisCanje || ""}
                  readOnly
                />
              </label>
            </div>
            <label>
              <span>Email</span>
              <input
                aria-label="Email"
                type="email"
                autoComplete="email"
                value={profile.email || ""}
                readOnly
              />
            </label>
            <label>
              <span>Teléfono</span>
              <input
                aria-label="Teléfono"
                type="tel"
                placeholder="Teléfono"
                autoComplete="tel"
                value={profile.telefono || ""}
                onChange={(event) =>
                  setProfile({ ...profile, telefono: event.target.value })
                }
              />
            </label>
          </div>
          <h2>2. Documentación Obligatoria (máx. 10 MB)</h2>
          {notice && (
            <p className="success" role="status">
              {notice}
            </p>
          )}
          <div className="stack validation-documents">
            {(detail.checklist || []).map((doc) => (
              <div
                className={`card document ${selectedDocument === doc.clave ? "selected-document" : ""}`}
                id={`documento-${doc.clave}`}
                key={doc.clave}
              >
                <div>
                  <strong>
                    {documentPresentation[doc.clave]?.label || doc.label}
                  </strong>
                  <p className={doc.subido ? "success-text" : "helper"}>
                    {doc.subido
                      ? "Recibido · Pendiente de revisión"
                      : documentPresentation[doc.clave]?.description ||
                        "Pendiente de aportar"}
                  </p>
                  {detail.documentos
                    ?.filter((item) => item.clave === doc.clave)
                    .map((item) => (
                      <p className="filename" key={item.id}>
                        {item.nombre}
                      </p>
                    ))}
                </div>
                <label className="btn dark-btn upload-label">
                  {busy === doc.clave
                    ? "Subiendo…"
                    : doc.subido
                      ? "Cambiar"
                      : "Subir"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    disabled={busy !== null}
                    aria-label={`Subir ${doc.label}`}
                    onChange={(event) => {
                      upload(doc.clave, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
          {detail.eventos?.length > 0 && (
            <>
              <h2>Historial de tu trámite</h2>
              <div className="stack">
                {detail.eventos.map((event, i) => (
                  <div className="card" key={event.id || i}>
                    <p>{event.nota || event.estado}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </form>
      )}
    </section>
  );
}
