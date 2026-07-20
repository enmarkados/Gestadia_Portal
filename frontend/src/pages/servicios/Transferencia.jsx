import { Link } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ServiceLayout from '../../components/ServiceLayout.jsx';
import ContratarCard from './ContratarCard.jsx';
import { SERVICIOS } from '@shared/servicios.js';
import styles from './Transferencia.module.css';

const S = SERVICIOS['transferencia'];

// Migrated from preview-transferencia.html (style lines 7-73, body from
// line 75). <nav>/<footer> replaced with <Header />/<Footer /> (Task 2);
// breadcrumb + two-column shell replaced with <ServiceLayout> (Task 2),
// which already owns the .breadcrumb/.page-body/.page-left/.page-right/
// .service-eyebrow/.service-title/.service-desc rules that were in this
// page's original <style> block verbatim (identical to ServiceLayout's).
// The checkout-card sidebar is the shared <LeadForm> (see LeadForm.jsx) —
// its tramite string ('Transferencia de Vehículo') matches this page's
// original inline <script> fetch payload and a key SERVICIO_MAP recognizes
// in backend/src/services/zoho.js.
export default function Transferencia() {
  return (
    <div className={styles.page}>
      <Header />

      <ServiceLayout
        title="Transferencia de Vehículo"
        eyebrow="Vehículo"
        subtitle="Cambio de titularidad de coches y motos ante la DGT. Tanto si eres comprador como vendedor, nos encargamos de toda la documentación para que el vehículo quede registrado correctamente a nombre del nuevo propietario. Sin desplazamientos, sin colas, sin cita previa."
        sidebar={
          <ContratarCard
            slug={S.slug}
            servicio="Transferencia de Vehículo"
            precio={`${S.precio} €`}
            includes={S.includes}
          />
        }
      >
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Tiempo estimado</div>
            <div className={styles.infoItemVal}>3 – 7 días hábiles</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Modalidad</div>
            <div className={styles.infoItemVal}>100% online · Sin cita previa</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Tasas DGT</div>
            <div className={styles.infoItemVal}>Incluidas</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Atención</div>
            <div className={styles.infoItemVal}>Especialista personal</div>
          </div>
        </div>

        <div className={styles.contentCols}>
          <div className={styles.docsSection}>
            <div className={styles.docsTitle}>Documentos necesarios</div>
            <div className={styles.docItem}><div className={styles.docDot} />DNI o NIE de comprador y vendedor</div>
            <div className={styles.docItem}><div className={styles.docDot} />Contrato de compraventa firmado por ambas partes</div>
            <div className={styles.docItem}><div className={styles.docDot} />Permiso de circulación original</div>
            <div className={styles.docItem}><div className={styles.docDot} />Tarjeta ITV en vigor</div>
            <div className={styles.docsNote}>Una vez realizado el pago podrás subir los documentos desde tu panel o enviarlos por WhatsApp. Si necesitamos documentación original, la recogeremos en tu domicilio a través de nuestro servicio de mensajería sin coste adicional.</div>
            <div className={styles.docsNote} style={{ marginTop: '10px', background: '#f7f7f7', borderRadius: '8px', padding: '10px 12px', color: '#555', borderLeft: '3px solid var(--red)' }}>
              <strong style={{ color: 'var(--graphite)', display: 'block', marginBottom: '4px' }}>ITP — Impuesto de Transmisiones Patrimoniales</strong>
              La transferencia lleva asociado este impuesto regional. Lo calculamos según el valor fiscal del vehículo y la comunidad autónoma del comprador, te comunicamos el importe exacto y nosotros nos encargamos de liquidarlo ante Hacienda. Se abona aparte del servicio.
            </div>
          </div>

          <div className={styles.stepsSection}>
            <div className={styles.stepsTitle}>¿Cómo funciona?</div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepText}><strong>Rellena tus datos y paga</strong>Formulario rápido + pago seguro con tarjeta.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepText}><strong>Envíanos los documentos</strong>De comprador y vendedor, por la web o por WhatsApp.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>3</div>
              <div className={styles.stepText}><strong>Nosotros lo tramitamos</strong>Nuestro equipo jurídico gestiona el cambio de titularidad ante la DGT.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>4</div>
              <div className={styles.stepText}><strong>Permiso de circulación a nombre del comprador</strong>Te lo enviamos por correo certificado.</div>
            </div>
          </div>
        </div>
      </ServiceLayout>

      <Footer />
    </div>
  );
}
