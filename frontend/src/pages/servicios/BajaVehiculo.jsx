import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ServiceLayout from '../../components/ServiceLayout.jsx';
import LeadForm from './LeadForm.jsx';
import styles from './BajaVehiculo.module.css';

// Migrated from preview-baja-vehiculo.html (style lines 7-73, body from
// line 75). See Transferencia.jsx for the full recipe notes shared by all
// 8 trámite pages.
export default function BajaVehiculo() {
  return (
    <div className={styles.page}>
      <Header />

      <ServiceLayout
        title="Baja de Vehículo"
        eyebrow="Vehículo"
        subtitle="¿Vas a desguazar tu vehículo, venderlo al extranjero o simplemente dejar de usarlo? La baja ante la DGT es obligatoria para dejar de pagar el impuesto de circulación y las multas asociadas. Tramitamos la baja definitiva o temporal sin que tengas que desplazarte."
        sidebar={
          <LeadForm
            servicio="Baja de Vehículo"
            precio="190 €"
            includes={['Tasas DGT incluidas', 'Baja definitiva o temporal', 'Gestión completa', 'Especialista personal asignado']}
            tramite="Baja de Vehículo"
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
            <div className={styles.docItem}><div className={styles.docDot} />DNI, pasaporte o NIE en vigor</div>
            <div className={styles.docItem}><div className={styles.docDot} />Permiso de circulación original</div>
            <div className={styles.docItem}><div className={styles.docDot} />Ficha técnica o tarjeta ITV</div>
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
              <div className={styles.stepText}><strong>Nosotros lo tramitamos</strong>Nuestro equipo jurídico gestiona la baja ante la DGT.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>4</div>
              <div className={styles.stepText}><strong>Confirmación de baja</strong>Te enviamos el justificante oficial. Dejas de pagar el impuesto de circulación.</div>
            </div>
          </div>
        </div>
      </ServiceLayout>

      <Footer />
    </div>
  );
}
