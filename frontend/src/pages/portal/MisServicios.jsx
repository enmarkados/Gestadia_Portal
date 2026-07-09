import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout from '../../components/portal/PortalLayout.jsx';
import { getExpedientes } from '../../lib/api.js';
import styles from './MisServicios.module.css';

const fmt = (d) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

// New page (Task 8) — GET /api/expedientes returns an array of expediente
// summaries (backend/src/routes/portal.js's `resumen()`), each already
// carrying `estadoLabel` and `progreso` computed server-side. Functional
// inspiration from unir/public/app.js's vistaServicios()/cardExpediente()
// (sibling repo, read-only); rebuilt as real JSX/routes instead of
// innerHTML + hash links.
export default function MisServicios() {
  const [expedientes, setExpedientes] = useState(null); // null = loading
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    getExpedientes()
      .then((data) => { if (!cancelled) setExpedientes(data); })
      .catch((err) => { if (!cancelled) setErrorMsg(err.message || 'No se pudieron cargar tus servicios'); });
    return () => { cancelled = true; };
  }, []);

  return (
    <PortalLayout title="Mis servicios" subtitle="Consulta el estado de cada trámite que has contratado.">
      {errorMsg && <p className={styles.error} role="alert">{errorMsg}</p>}

      {!errorMsg && expedientes === null && <p className={styles.loading}>Cargando…</p>}

      {expedientes && expedientes.length === 0 && (
        <div className={styles.emptyCard}>
          <p>Todavía no has contratado ningún servicio.</p>
          <Link to="/checkout" className={styles.emptyCta}>Contratar un servicio</Link>
        </div>
      )}

      {expedientes && expedientes.length > 0 && (
        <div className={styles.list}>
          {expedientes.map((e) => {
            const alerta = e.estado === 'documentacion_pendiente' || e.estado === 'incidencia';
            return (
              <Link key={e.id} to={`/portal/mis-servicios/${e.id}`} className={styles.card}>
                <div className={styles.cardTop}>
                  <div>
                    <div className={styles.cardTitle}>{e.titulo}</div>
                    <div className={styles.cardMeta}>{e.nPedido} · contratado el {fmt(e.createdAt)}</div>
                  </div>
                  <span className={alerta ? `${styles.badge} ${styles.badgeAlert}` : styles.badge}>{e.estadoLabel}</span>
                </div>
                <div className={styles.progress}>
                  <div className={styles.progressBar} style={{ width: `${e.progreso}%` }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PortalLayout>
  );
}
