import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ServiceLayout from '../../components/ServiceLayout.jsx';
import ContratarCard from './ContratarCard.jsx';
import { SERVICIOS } from '@shared/servicios.js';
import styles from './DuplicadoCirculacion.module.css';

const S = SERVICIOS['duplicado-circulacion'];

// Migrated from preview-duplicado-circulacion.html (style lines 7-73, body
// from line 75). See Transferencia.jsx for the full recipe notes shared by
// all 8 trámite pages.
export default function DuplicadoCirculacion() {
  return (
    <div className={styles.page}>
      <Header />

      <ServiceLayout
        title="Duplicado Permiso de Circulación"
        eyebrow="Vehículo"
        subtitle="El permiso de circulación acredita que tu vehículo está matriculado en España. Si lo has perdido o ha sido robado o deteriorado, necesitas un duplicado para circular con total legalidad. Gestionamos el nuevo documento ante la DGT con autorización provisional inmediata."
        sidebar={
          <ContratarCard
            slug={S.slug}
            servicio="Duplicado Permiso de Circulación"
            precio={`${S.precio} €`}
            includes={S.includes}
          />
        }
      >
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Tiempo estimado</div>
            <div className={styles.infoItemVal}>3 días hábiles</div>
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
            <div className={styles.docItem}><div className={styles.docDot} />Matrícula o número de bastidor del vehículo</div>
            <div className={styles.docItem}><div className={styles.docDot} />Denuncia por pérdida o robo (si aplica)</div>
            <div className={styles.docItem}><div className={styles.docDot} />Permiso deteriorado (si aplica)</div>
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
              <div className={styles.stepText}><strong>Nosotros lo tramitamos</strong>Nuestro equipo jurídico gestiona el duplicado ante la DGT. Autorización provisional inmediata.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>4</div>
              <div className={styles.stepText}><strong>Recibes el permiso definitivo</strong>Enviado a tu domicilio por correo certificado en 3 días hábiles.</div>
            </div>
          </div>
        </div>
      </ServiceLayout>

      <Footer />
    </div>
  );
}
