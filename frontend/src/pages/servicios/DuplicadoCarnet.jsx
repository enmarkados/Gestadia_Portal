import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ServiceLayout from '../../components/ServiceLayout.jsx';
import LeadForm from './LeadForm.jsx';
import styles from './DuplicadoCarnet.module.css';

// Migrated from preview-duplicado-carnet.html (style lines 7-75, body from
// line 77). See Transferencia.jsx for the full recipe notes shared by all
// 8 trámite pages.
export default function DuplicadoCarnet() {
  return (
    <div className={styles.page}>
      <Header />

      <ServiceLayout
        title="Duplicado de Carnet de Conducir"
        eyebrow="Permiso de conducir"
        subtitle="¿Has perdido el carnet, te lo han robado o está deteriorado? Gestionamos el duplicado ante la DGT sin que tengas que desplazarte ni pedir cita previa. En menos de 24 horas obtienes un permiso provisional válido mientras tramitamos el definitivo."
        sidebar={
          <LeadForm
            servicio="Duplicado de Carnet"
            precio="70 €"
            includes={['Tasas DGT incluidas', 'Permiso provisional en 24 h', 'Gestión completa', 'Especialista personal asignado']}
            tramite="Duplicado de Carnet de Conducir"
          />
        }
      >
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Tiempo estimado</div>
            <div className={styles.infoItemVal}>Provisional en 24 h</div>
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
            <div className={styles.docItem}><div className={styles.docDot} />DNI en vigor</div>
            <div className={styles.docItem}><div className={styles.docDot} />Motivo del duplicado (pérdida, robo o deterioro)</div>
            <div className={styles.docItem}><div className={styles.docDot} />Dirección de envío del nuevo carnet</div>
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
              <div className={styles.stepText}><strong>Nosotros lo tramitamos</strong>Nuestro equipo jurídico se encarga de todo ante la DGT. Permiso provisional en menos de 24 horas.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>4</div>
              <div className={styles.stepText}><strong>Recibes tu carnet</strong>El definitivo se envía por correo a tu domicilio. Te informamos de cada paso.</div>
            </div>
          </div>
        </div>
      </ServiceLayout>

      <Footer />
    </div>
  );
}
