import { useEffect, useState } from 'react';
import PortalLayout from '../../components/portal/PortalLayout.jsx';
import { getNotificaciones, markNotificacionLeida } from '../../lib/api.js';
import styles from './Notificaciones.module.css';

const fmtHora = (d) => new Date(d).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// New page (Task 8). GET /api/notificaciones returns each notificacion row
// as-is (backend/src/routes/portal.js — { id, titulo, cuerpo, leida,
// createdAt, ... }). Unlike unir/public/app.js's vistaNotificaciones()
// (sibling repo, read-only), which marks every unread notification as read
// automatically on page load, this page shows an explicit "Marcar como
// leída" button per the task brief — a deliberate UX choice so a client
// glancing at the list without reading it doesn't silently lose the
// unread badge.
export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState(null); // null = loading
  const [loadError, setLoadError] = useState('');
  const [markingId, setMarkingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getNotificaciones()
      .then((data) => { if (!cancelled) setNotificaciones(data); })
      .catch((err) => { if (!cancelled) setLoadError(err.message || 'No se pudieron cargar las notificaciones'); });
    return () => { cancelled = true; };
  }, []);

  async function handleMarkRead(id) {
    setMarkingId(id);
    try {
      await markNotificacionLeida(id);
      setNotificaciones((list) => list.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    } catch {
      // best-effort; leave the item as unread if the request fails
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <PortalLayout title="Notificaciones" subtitle="Novedades sobre tus trámites en curso.">
      {loadError && <p className={styles.error} role="alert">{loadError}</p>}
      {!loadError && notificaciones === null && <p className={styles.loading}>Cargando…</p>}

      {notificaciones && notificaciones.length === 0 && (
        <div className={styles.emptyCard}><p>Nada por aquí todavía.</p></div>
      )}

      {notificaciones && notificaciones.length > 0 && (
        <div className={styles.list}>
          {notificaciones.map((n) => (
            <div key={n.id} className={n.leida ? styles.item : `${styles.item} ${styles.itemNew}`}>
              <div className={styles.itemBody}>
                <strong className={styles.itemTitle}>{n.titulo}</strong>
                <p className={styles.itemText}>{n.cuerpo}</p>
                <div className={styles.itemWhen}>{fmtHora(n.createdAt)}</div>
              </div>
              {!n.leida && (
                <button
                  type="button"
                  className={styles.markBtn}
                  onClick={() => handleMarkRead(n.id)}
                  disabled={markingId === n.id}
                >
                  {markingId === n.id ? 'Marcando…' : 'Marcar como leída'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
