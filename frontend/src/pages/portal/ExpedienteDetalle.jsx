import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PortalLayout from '../../components/portal/PortalLayout.jsx';
import { getExpediente, uploadDocumento } from '../../lib/api.js';
import styles from './ExpedienteDetalle.module.css';

const fmt = (d) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtHora = (d) => new Date(d).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// Labels for eventos[].estado — GET /api/expedientes/:id returns the raw
// eventos rows (backend/src/routes/portal.js), each carrying the internal
// `estado` id, not a display label (only the expediente-level `resumen()`
// includes `estadoLabel`). Mirrors backend/src/catalog.js's ESTADOS list
// and unir/public/app.js's etiquetaEstado() (sibling repo, read-only) —
// duplicated here on the frontend since the catalog isn't exposed to the
// client.
const ESTADO_LABELS = {
  pago_pendiente: 'Pedido creado',
  pagado: 'Pago recibido',
  documentacion_pendiente: 'Falta documentación',
  en_gestion: 'En gestión',
  presentado: 'Presentado en la administración',
  completado: 'Completado',
  incidencia: 'Incidencia',
};

// New page (Task 8). Functional inspiration from unir/public/app.js's
// vistaExpediente() (sibling repo, read-only): checklist upload buttons,
// event timeline, payment summary — rebuilt as real JSX with React state
// instead of innerHTML re-renders.
export default function ExpedienteDetalle() {
  const { id } = useParams();
  const [expediente, setExpediente] = useState(null); // null = loading
  const [loadError, setLoadError] = useState('');
  const [uploadingClave, setUploadingClave] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const load = useCallback(() => {
    return getExpediente(id)
      .then((data) => setExpediente(data))
      .catch((err) => setLoadError(err.message || 'No se pudo cargar el expediente'));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFileChange(clave, file) {
    if (!file) return;
    setUploadingClave(clave);
    setUploadError('');
    try {
      await uploadDocumento(id, clave, file);
      await load();
    } catch (err) {
      setUploadError(err.message || 'No se pudo subir el documento');
    } finally {
      setUploadingClave(null);
    }
  }

  if (loadError) {
    return (
      <PortalLayout title="Mis servicios">
        <p className={styles.error} role="alert">{loadError}</p>
        <Link to="/portal/mis-servicios" className={styles.backLink}>← Mis servicios</Link>
      </PortalLayout>
    );
  }

  if (!expediente) {
    return (
      <PortalLayout title="Mis servicios">
        <p className={styles.loading}>Cargando…</p>
      </PortalLayout>
    );
  }

  const alerta = expediente.estado === 'documentacion_pendiente' || expediente.estado === 'incidencia';

  return (
    <PortalLayout>
      <Link to="/portal/mis-servicios" className={styles.backLink}>← Mis servicios</Link>

      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{expediente.titulo}</h1>
          <div className={styles.meta}>{expediente.nPedido}</div>
        </div>
        <span className={alerta ? `${styles.badge} ${styles.badgeAlert}` : styles.badge}>{expediente.estadoLabel}</span>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressBar} style={{ width: `${expediente.progreso}%` }} />
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Documentación</h2>
        <p className={styles.cardSub}>Sube fotos o PDF (máx. 10 MB). Tu gestor los revisará.</p>

        {expediente.checklist.map((c) => (
          <div key={c.clave} className={styles.docRow}>
            <span>{c.label}</span>
            {c.subido ? (
              <span className={styles.docOk}>✓ Recibido</span>
            ) : (
              <label className={styles.uploadBtn}>
                {uploadingClave === c.clave ? 'Subiendo…' : 'Subir'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  disabled={uploadingClave === c.clave}
                  onChange={(e) => handleFileChange(c.clave, e.target.files[0])}
                />
              </label>
            )}
          </div>
        ))}

        {uploadError && <p className={styles.error} role="alert">{uploadError}</p>}
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Historial</h2>
        <ul className={styles.timeline}>
          {expediente.eventos.map((ev) => (
            <li key={ev.id} className={styles.timelineItem}>
              <strong>{ESTADO_LABELS[ev.estado] || ev.estado}</strong>
              {ev.nota && <div className={styles.timelineNota}>{ev.nota}</div>}
              <div className={styles.timelineWhen}>{fmtHora(ev.createdAt)}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Pago</h2>
        <p className={styles.payText}>
          {Number(expediente.importe).toFixed(2)} € · {expediente.fechaPago ? `pagado el ${fmt(expediente.fechaPago)}` : 'pendiente'}
          {expediente.finDesistimiento && (
            <>
              <br />
              <span className={styles.muted}>Derecho de desistimiento hasta el {fmt(expediente.finDesistimiento)} (salvo servicio ya ejecutado).</span>
            </>
          )}
        </p>
      </div>
    </PortalLayout>
  );
}
