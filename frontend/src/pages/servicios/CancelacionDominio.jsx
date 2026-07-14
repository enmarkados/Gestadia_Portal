import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ServiceLayout from '../../components/ServiceLayout.jsx';
import LeadForm from './LeadForm.jsx';
import { SERVICIOS } from '@shared/servicios.js';
import styles from './CancelacionDominio.module.css';

const S = SERVICIOS['cancelacion-dominio'];

// Migrated from preview-cancelacion-dominio.html (style lines 7-73, body
// from line 75). See Transferencia.jsx for the full recipe notes shared by
// all 8 trámite pages.
export default function CancelacionDominio() {
  return (
    <div className={styles.page}>
      <Header />

      <ServiceLayout
        title="Cancelación de Reserva de Dominio"
        eyebrow="Vehículo"
        subtitle="Cuando financias un vehículo, el banco o la financiera inscribe una reserva de dominio en el Registro de Bienes Muebles. Una vez liquidado el préstamo, esa carga debe cancelarse para que el coche sea realmente tuyo. Gestionamos la cancelación de forma completamente online."
        sidebar={
          <LeadForm
            servicio="Cancelación Reserva de Dominio"
            precio={`${S.precio} €`}
            includes={S.includes}
            tramite="Cancelación de Reserva de Dominio"
          />
        }
      >
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Tiempo estimado</div>
            <div className={styles.infoItemVal}>5 – 10 días hábiles</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Modalidad</div>
            <div className={styles.infoItemVal}>100% online · Sin cita previa</div>
          </div>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Tasas</div>
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
            <div className={styles.docItem}><div className={styles.docDot} />Carta de cancelación o certificado de pago de la entidad financiera</div>
            <div className={styles.docItem}><div className={styles.docDot} />Permiso de circulación del vehículo</div>
            <div className={styles.docItem}><div className={styles.docDot} />Tarjeta ITV</div>
            <div className={styles.docsNote}>Una vez realizado el pago podrás subir los documentos desde tu panel o enviarlos por WhatsApp. Si necesitamos documentación original, la recogeremos en tu domicilio a través de nuestro servicio de mensajería sin coste adicional.</div>
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
              <div className={styles.stepText}><strong>Nosotros lo tramitamos</strong>Nuestro equipo jurídico gestiona la cancelación ante el Registro de Bienes Muebles.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>4</div>
              <div className={styles.stepText}><strong>Vehículo libre de cargas</strong>Recibes la confirmación. Ya puedes venderlo o darlo de baja sin restricciones.</div>
            </div>
          </div>
        </div>
      </ServiceLayout>

      <Footer />
    </div>
  );
}
