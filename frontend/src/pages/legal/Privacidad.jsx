import { Link } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import styles from './Privacidad.module.css';

// Migrated from preview-privacidad.html (style lines 7-51, body from line
// 53). <nav>/<footer> replaced with <Header />/<Footer /> (Task 2). Static
// content page, no form/script to reproduce. The breadcrumb "Inicio" link
// and the two in-body links to the Cookies Policy now point at their real
// /cookies route (Task 5), converted from the preview-*.html hrefs they
// were seeded with. The link to the AEPD complaints page (www.aepd.es)
// stays a plain external <a> — it's not part of this app.
export default function Privacidad() {
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}><Link to="/">Inicio</Link> / Política de privacidad</div>
          <h1 className={styles.pageTitle}>Política de Privacidad</h1>
          <p className={styles.pageSubtitle}>Última actualización: junio de 2026</p>
        </div>
      </div>

      <div className={styles.legalBody}>
        <p className={styles.legalIntro}>
          En Gestadia, servicio de tramitación DGT online de <strong>Defensa Legal Consumidores, S.L.</strong>, nos comprometemos a proteger su privacidad y a tratar sus datos personales con total transparencia, de conformidad con el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).<br /><br />
          Esta política aplica exclusivamente a los datos obtenidos a través de <strong>gestadia.com</strong>. Le recomendamos leerla detenidamente antes de facilitar sus datos.
        </p>

        <div className={styles.legalSection}>
          <h2>1. Responsable del tratamiento</h2>
          <table>
            <tbody>
              <tr><th>Denominación social</th><td>Defensa Legal Consumidores, S.L.</td></tr>
              <tr><th>CIF</th><td>B01813336</td></tr>
              <tr><th>Domicilio</th><td>Paseo de la Castellana, 143, 2.ª A, 28046 Madrid (España)</td></tr>
              <tr><th>Teléfono</th><td>910 600 314</td></tr>
              <tr><th>Correo electrónico</th><td>info@gestadia.com</td></tr>
            </tbody>
          </table>
        </div>

        <div className={styles.legalSection}>
          <h2>2. Datos personales tratados y procedencia</h2>
          <p>Los datos que tratamos son los que usted nos facilita voluntariamente a través de los formularios del sitio web, los que se generan durante la prestación del servicio y, en su caso, los que se recaban automáticamente durante la navegación:</p>
          <ul>
            <li><strong>Datos de contacto e identificación:</strong> nombre y apellidos, número de teléfono, dirección de correo electrónico.</li>
            <li><strong>Datos vinculados al trámite:</strong> DNI / NIE, matrícula de vehículo, documentación relativa al expediente DGT cuando sea precisa para la tramitación contratada.</li>
            <li><strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas y duración de la sesión, recabados de forma automática mediante cookies técnicas y analíticas (véase nuestra <Link to="/cookies" style={{ color: 'var(--red)' }}>Política de Cookies</Link>).</li>
          </ul>
          <p>No tratamos categorías especiales de datos (datos de salud, origen étnico, ideología, etc.) ni datos de menores de 14 años.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>3. Finalidades del tratamiento y base jurídica</h2>
          <table>
            <tbody>
              <tr>
                <th style={{ width: '35%' }}>Finalidad</th>
                <th>Base jurídica (art. 6 RGPD)</th>
              </tr>
              <tr>
                <td>Atender las consultas e información solicitadas a través del formulario de contacto o por WhatsApp</td>
                <td>Consentimiento del interesado [art. 6.1.a]</td>
              </tr>
              <tr>
                <td>Gestionar y ejecutar el servicio de tramitación DGT contratado</td>
                <td>Ejecución de un contrato en el que el interesado es parte [art. 6.1.b]</td>
              </tr>
              <tr>
                <td>Envío de comunicaciones comerciales sobre servicios propios, previo consentimiento</td>
                <td>Consentimiento del interesado [art. 6.1.a]</td>
              </tr>
              <tr>
                <td>Cumplimiento de obligaciones contables, fiscales y legales</td>
                <td>Obligación legal [art. 6.1.c]</td>
              </tr>
              <tr>
                <td>Análisis estadístico del tráfico y mejora del servicio web</td>
                <td>Interés legítimo del responsable [art. 6.1.f]</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.legalSection}>
          <h2>4. Plazos de conservación</h2>
          <p>Los datos se conservarán durante el tiempo estrictamente necesario para la finalidad para la que fueron recabados y, en todo caso, durante los plazos legalmente exigibles:</p>
          <ul>
            <li><strong>Consultas y solicitudes de información:</strong> mientras dure la gestión de la consulta y, posteriormente, durante el plazo de prescripción de posibles responsabilidades (máximo 3 años).</li>
            <li><strong>Datos derivados de una relación contractual:</strong> durante la vigencia del contrato y, una vez finalizado, durante un mínimo de 5 años conforme a la legislación mercantil y fiscal.</li>
            <li><strong>Comunicaciones comerciales:</strong> hasta que el interesado revoque su consentimiento.</li>
            <li><strong>Datos de navegación (cookies analíticas):</strong> según lo indicado en nuestra Política de Cookies.</li>
          </ul>
          <p>Transcurrido el plazo correspondiente, los datos serán suprimidos o, en su caso, anonimizados.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>5. Destinatarios de los datos</h2>
          <p>Los datos personales no serán cedidos a terceros, salvo en los siguientes supuestos:</p>
          <ul>
            <li><strong>Administraciones Públicas:</strong> Dirección General de Tráfico (DGT) y demás organismos públicos competentes, cuando sea necesario para la tramitación del expediente contratado.</li>
            <li><strong>Encargados del tratamiento:</strong> proveedores de servicios tecnológicos (alojamiento web, CRM, herramientas de analítica) que tratan los datos por cuenta del responsable y bajo contrato de encargo de tratamiento con garantías equivalentes.</li>
            <li><strong>Obligación legal:</strong> cuando así lo exija una norma legal o resolución judicial o administrativa.</li>
          </ul>
          <p>No realizamos cesiones con fines comerciales a terceros sin el consentimiento expreso del interesado.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>6. Transferencias internacionales de datos</h2>
          <p>Con carácter general, los datos se tratan en servidores ubicados dentro del Espacio Económico Europeo (EEE). En el caso de utilizar herramientas de terceros cuyos servidores estén fuera del EEE (p.ej. servicios de analítica), las transferencias se amparan en las garantías previstas en los artículos 45 y 46 del RGPD (decisiones de adecuación de la Comisión Europea o cláusulas contractuales tipo).</p>
        </div>

        <div className={styles.legalSection}>
          <h2>7. Derechos del interesado</h2>
          <p>Puede ejercer en cualquier momento los siguientes derechos reconocidos por el RGPD y la LOPDGDD:</p>
          <div className={styles.rightsGrid}>
            <div className={styles.rightItem}>
              <strong>Acceso</strong>
              <span>Conocer qué datos personales suyos estamos tratando.</span>
            </div>
            <div className={styles.rightItem}>
              <strong>Rectificación</strong>
              <span>Solicitar la corrección de datos inexactos o incompletos.</span>
            </div>
            <div className={styles.rightItem}>
              <strong>Supresión («derecho al olvido»)</strong>
              <span>Solicitar la eliminación de sus datos cuando ya no sean necesarios.</span>
            </div>
            <div className={styles.rightItem}>
              <strong>Oposición</strong>
              <span>Oponerse al tratamiento de sus datos en determinadas circunstancias.</span>
            </div>
            <div className={styles.rightItem}>
              <strong>Limitación del tratamiento</strong>
              <span>Solicitar la suspensión del tratamiento en los supuestos legalmente previstos.</span>
            </div>
            <div className={styles.rightItem}>
              <strong>Portabilidad</strong>
              <span>Recibir sus datos en formato estructurado y de uso común.</span>
            </div>
          </div>
          <p style={{ marginTop: '16px' }}>Para ejercer cualquiera de estos derechos, envíe un correo a <strong>info@gestadia.com</strong> indicando el derecho que desea ejercer y adjuntando copia de su DNI o documento de identificación equivalente. Responderemos en el plazo de un mes (prorrogable a tres en casos complejos).</p>
          <p>Si considera que el tratamiento no se ajusta a la normativa, tiene derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong> — <a href="https://www.aepd.es" target="_blank" rel="noopener" style={{ color: 'var(--red)' }}>www.aepd.es</a> — C/ Jorge Juan, 6, 28001 Madrid.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>8. Medidas de seguridad</h2>
          <p>Defensa Legal Consumidores, S.L. ha adoptado las medidas técnicas y organizativas necesarias para garantizar la seguridad e integridad de los datos personales y evitar su pérdida, alteración y/o acceso por parte de terceros no autorizados, habida cuenta del estado de la tecnología, la naturaleza de los datos almacenados y los riesgos a que están expuestos, todo ello de conformidad con lo dispuesto en el RGPD.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>9. Cookies</h2>
          <p>El Sitio Web utiliza cookies propias y de terceros con distintas finalidades (técnicas, analíticas, de personalización). Puede obtener información detallada y gestionar sus preferencias en nuestra <Link to="/cookies" style={{ color: 'var(--red)' }}>Política de Cookies</Link>.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>10. Modificaciones de la política de privacidad</h2>
          <p>El Titular se reserva el derecho a modificar la presente Política de Privacidad para adaptarla a novedades legislativas, jurisprudenciales o de práctica empresarial. En tales supuestos, se comunicará el cambio con antelación razonable. La versión vigente será siempre la publicada en esta página, con indicación de la fecha de última actualización.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
