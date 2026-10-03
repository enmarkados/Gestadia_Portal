import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { request } from "./api.js";
import Icon from "./Icon.jsx";
export default function Expedientes({ onContact }) {
  const { data, mode } = useApp();
  return (
    <section>
      <p className="eyebrow">TU GESTORÍA, CONTIGO</p>
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
            to={mode === "visitante" ? "/cuenta" : "/servicios"}
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
                className="btn primary"
                to={`/tramites/${encodeURIComponent(e.id)}`}
              >
                Ver trámite y documentos
              </Link>
              <button className="text-btn" onClick={onContact}>
                Hablar con un gestor
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
export function ExpedienteDetalle() {
  const { id } = useParams();
  const { mode, data, setData } = useApp();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setDetail(null);
    setError("");
    if (mode === "demo") {
      const value = data.expedientes.find((e) => e.id === id);
      if (value) setDetail(value);
      else setError("No se encuentra este trámite de demostración.");
    } else if (mode === "real")
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
      if (mode === "demo") {
        const updated = {
          ...detail,
          checklist: detail.checklist.map((doc) =>
            doc.clave === clave
              ? {
                  ...doc,
                  subido: true,
                }
              : doc,
          ),
          documentos: [
            ...detail.documentos.filter((doc) => doc.clave !== clave),
            {
              id: `demo-${clave}`,
              clave,
              nombre: file.name,
            },
          ],
        };
        setDetail(updated);
        setData((old) => ({
          ...old,
          expedientes: old.expedientes.map((e) => (e.id === id ? updated : e)),
        }));
        setNotice(
          "Archivo seleccionado para el ejemplo. Su contenido no se ha enviado ni guardado.",
        );
      } else {
        const form = new FormData();
        form.append("clave", clave);
        form.append("fichero", file);
        await request(`/api/expedientes/${encodeURIComponent(id)}/documentos`, {
          method: "POST",
          body: form,
        });
        setNotice("Documento recibido. Pendiente de revisión por tu gestor.");
        setRevision((value) => value + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }
  if (mode === "visitante")
    return (
      <section>
        <h1>Tu trámite</h1>
        <Link className="btn primary" to="/cuenta">
          Entrar al portal
        </Link>
      </section>
    );
  return (
    <section>
      <Link className="text-btn" to="/tramites">
        ← Mis trámites
      </Link>
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
        <>
          <p className="eyebrow">{detail.nPedido}</p>
          <h1>{detail.titulo}</h1>
          <p className="status-line">
            Estado: <strong>{detail.estadoLabel || "En trámite"}</strong>
          </p>
          {detail.paisCanje && <p>País del permiso: {detail.paisCanje}</p>}
          <h2>Documentación</h2>
          <p className="helper">Imágenes o PDF · Máximo 10 MB por archivo.</p>
          {notice && (
            <p className="success" role="status">
              {notice}
            </p>
          )}
          <div className="stack">
            {(detail.checklist || []).map((doc) => (
              <div className="card document" key={doc.clave}>
                <div>
                  <strong>{doc.label}</strong>
                  <p className={doc.subido ? "success-text" : "helper"}>
                    {doc.subido
                      ? "Recibido · Pendiente de revisión"
                      : "Pendiente de aportar"}
                  </p>
                  {detail.documentos
                    ?.filter((item) => item.clave === doc.clave)
                    .map((item) => (
                      <p className="filename" key={item.id}>
                        {item.nombre}
                      </p>
                    ))}
                </div>
                <label className="btn secondary upload-label">
                  {busy === doc.clave
                    ? "Subiendo…"
                    : doc.subido
                      ? "Añadir otro archivo"
                      : "Subir documento"}
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
          <Link className="btn secondary" to="/cuenta">
            Revisar mis datos
          </Link>
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
        </>
      )}
    </section>
  );
}
