import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ServiceLayout from '../../components/ServiceLayout.jsx';
import LeadForm from './LeadForm.jsx';
import { SERVICIOS } from '@shared/servicios.js';
import styles from './PermisoInternacional.module.css';

const S = SERVICIOS['permiso-internacional'];

// Migrated from preview-permiso-internacional.html (style lines 7-73, body
// from line 75). See Transferencia.jsx for the full recipe notes shared by
// all 8 trámite pages.
export default function PermisoInternacional() {
  return (
    <div className={styles.page}>
      <Header />

      <ServiceLayout
        title="Permiso Internacional de Conducir"
        eyebrow="Permiso de conducir"
        subtitle="Si vas a conducir fuera de la Unión Europea, necesitas el Permiso Internacional de Conducir (PIC). Es un documento oficial emitido por la DGT que complementa tu carnet español y tiene validez en prácticamente todos los países del mundo durante un año. Lo tramitamos por ti sin que tengas que ir a ninguna oficina."
        sidebar={
          <LeadForm
            servicio="Permiso Internacional"
            precio={`${S.precio} €`}
            includes={S.includes}
            tramite="Permiso Internacional de Conducir"
          />
        }
      >
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Tiempo estimado</div>
            <div className={styles.infoItemVal}>3 – 5 días hábiles</div>
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
            <div className={styles.docItem}><div className={styles.docDot} />DNI o NIE en vigor</div>
            <div className={styles.docItem}><div className={styles.docDot} />Carnet de conducir español en vigor</div>
            <div className={styles.docItem}><div className={styles.docDot} />Foto carnet reciente (fondo blanco)</div>
            <div className={styles.docsNote}>Una vez realizado el pago podrás subir los documentos desde tu panel o enviarlos por WhatsApp. El permiso se envía a tu domicilio por correo certificado.</div>
          </div>

          <div className={styles.stepsSection}>
            <div className={styles.stepsTitle}>¿Cómo funciona?</div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepText}><strong>Rellena tus datos y paga</strong>Formulario rápido + pago seguro con tarjeta.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepText}><strong>Envíanos los documentos</strong>Por la web o por WhatsApp, como prefieras.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>3</div>
              <div className={styles.stepText}><strong>Nosotros lo tramitamos</strong>Nuestro equipo jurídico gestiona la expedición ante la DGT.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>4</div>
              <div className={styles.stepText}><strong>Recibes el permiso en casa</strong>Listo para llevar en tu próximo viaje.</div>
            </div>
          </div>
        </div>
      </ServiceLayout>

      <Footer />
    </div>
  );
}
