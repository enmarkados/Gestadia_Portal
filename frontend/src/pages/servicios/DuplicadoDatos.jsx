import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ServiceLayout from '../../components/ServiceLayout.jsx';
import ContratarCard from './ContratarCard.jsx';
import { SERVICIOS } from '@shared/servicios.js';
import styles from './DuplicadoDatos.module.css';

const S = SERVICIOS['duplicado-datos'];

// Migrated from preview-duplicado-datos.html (style lines 7-73, body from
// line 75). See Transferencia.jsx for the full recipe notes shared by all
// 8 trámite pages.
export default function DuplicadoDatos() {
  return (
    <div className={styles.page}>
      <Header />

      <ServiceLayout
        title="Duplicado por Cambio de Datos"
        eyebrow="Permiso de conducir"
        subtitle="¿Has pasado de NIE a DNI, has cambiado de nombre o has modificado el sexo registral? Tu carnet de conducir debe reflejar los datos actuales. Gestionamos la expedición del nuevo documento ante la DGT sin desplazamientos ni cita previa."
        sidebar={
          <ContratarCard
            slug={S.slug}
            servicio="Duplicado por Cambio de Datos"
            precio={`${S.precio} €`}
            includes={S.includes}
          />
        }
      >
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Tiempo estimado</div>
            <div className={styles.infoItemVal}>2 – 4 semanas</div>
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
            <div className={styles.docItem}><div className={styles.docDot} />DNI en vigor (con los datos actualizados)</div>
            <div className={styles.docItem}><div className={styles.docDot} />NIE anterior (si el cambio es de NIE a DNI)</div>
            <div className={styles.docItem}><div className={styles.docDot} />Carnet de conducir actual</div>
            <div className={styles.docItem}><div className={styles.docDot} />Resolución registral de cambio de nombre o sexo (si aplica)</div>
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
              <div className={styles.stepText}><strong>Nosotros lo tramitamos</strong>Nuestro equipo jurídico se encarga de todo ante la DGT.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>4</div>
              <div className={styles.stepText}><strong>Recibes tu carnet actualizado</strong>Con tus datos correctos, enviado a tu domicilio.</div>
            </div>
          </div>
        </div>
      </ServiceLayout>

      <Footer />
    </div>
  );
}
