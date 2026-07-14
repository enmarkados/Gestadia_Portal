import { Link } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import styles from './AvisoLegal.module.css';

// Migrated from preview-aviso-legal.html (style lines 7-47, body from line
// 49). <nav>/<footer> replaced with <Header />/<Footer /> (Task 2). Static
// content page, no form/script to reproduce. The breadcrumb "Inicio" link
// and the in-body link to the Privacy Policy now point at their real
// /privacidad route (Task 5), converted from the preview-*.html hrefs they
// were seeded with.
export default function AvisoLegal() {
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}><Link to="/">Inicio</Link> / Aviso legal</div>
          <h1 className={styles.pageTitle}>Aviso Legal</h1>
          <p className={styles.pageSubtitle}>Última actualización: junio de 2026</p>
        </div>
      </div>

      <div className={styles.legalBody}>
        <p className={styles.legalIntro}>
          En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del titular de este sitio web.<br /><br />
          <strong>Titular:</strong> Defensa Legal Consumidores, S.L. &nbsp;·&nbsp; <strong>CIF:</strong> B01813336 &nbsp;·&nbsp;
          <strong>Domicilio:</strong> Paseo de la Castellana, 143, 2.ª A, 28046 Madrid &nbsp;·&nbsp;
          <strong>Teléfono:</strong> 910 600 314 &nbsp;·&nbsp; <strong>Email:</strong> info@gestadia.com
        </p>

        <div className={styles.legalSection}>
          <h2>1. Datos identificativos del titular</h2>
          <table>
            <tbody>
              <tr><th>Denominación social</th><td>Defensa Legal Consumidores, S.L.</td></tr>
              <tr><th>CIF</th><td>B01813336</td></tr>
              <tr><th>Domicilio social</th><td>Paseo de la Castellana, 143, 2.ª A, 28046 Madrid (España)</td></tr>
              <tr><th>Teléfono de contacto</th><td>910 600 314</td></tr>
              <tr><th>WhatsApp</th><td>684 46 26 70</td></tr>
              <tr><th>Correo electrónico</th><td>info@gestadia.com</td></tr>
              <tr><th>Sitio web</th><td>gestadia.com</td></tr>
              <tr><th>Actividad</th><td>Gestión y tramitación de expedientes DGT online</td></tr>
            </tbody>
          </table>
        </div>

        <div className={styles.legalSection}>
          <h2>2. Objeto y condiciones de uso</h2>
          <p>El presente Aviso Legal regula el acceso y la utilización del sitio web <strong>gestadia.com</strong> (en adelante, el «Sitio Web»), del que es titular Defensa Legal Consumidores, S.L. (en adelante, el «Titular»).</p>
          <p>El acceso al Sitio Web es libre y gratuito. El acceso y la navegación por este sitio web implica la aceptación expresa y plena de todas las presentes condiciones de uso. El Titular se reserva el derecho a modificar, en cualquier momento y sin previo aviso, la presentación y configuración del Sitio Web, así como las presentes condiciones.</p>
          <p>El usuario se compromete a hacer un uso adecuado de los contenidos y servicios que el Titular ofrece y, con carácter enunciativo pero no limitativo, a no emplearlos para:</p>
          <ul>
            <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
            <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico o que atente contra los derechos fundamentales reconocidos en la Constitución Española.</li>
            <li>Introducir o difundir en la red virus informáticos o cualquier otro sistema físico o lógico que sea susceptible de provocar daños en los sistemas informáticos del Titular, de sus proveedores o de terceros.</li>
            <li>Intentar acceder, utilizar y/o manipular los datos del Titular, terceros proveedores y otros usuarios.</li>
          </ul>
          <p>Se permite la visualización, impresión y descarga parcial del contenido del Sitio Web únicamente si concurren las siguientes condiciones: que sea compatible con los fines del Sitio Web, que se haga con el exclusivo ánimo de obtener la información contenida para uso personal y privado, que no se utilice con fines comerciales directos o indirectos, y que no se modifiquen los materiales obtenidos.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>3. Propiedad intelectual e industrial</h2>
          <p>Todos los contenidos del Sitio Web (a título enunciativo: textos, fotografías, gráficos, imágenes, tecnología, software, enlaces, contenidos audiovisuales, diseño gráfico, código fuente y demás elementos) son propiedad del Titular o de terceros que han autorizado su uso, quedando protegidos por la legislación de propiedad intelectual e industrial española e internacional.</p>
          <p>El Titular prohíbe expresamente la reproducción total o parcial, distribución, comunicación pública o transformación de los contenidos del Sitio Web sin la autorización previa y por escrito del Titular. Asimismo, quedan reservados todos los derechos de propiedad industrial sobre las marcas, nombres comerciales, logotipos y demás signos distintivos.</p>
          <p>El incumplimiento de lo dispuesto conllevará el ejercicio de las acciones legales que correspondan.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>4. Exclusión de garantías y responsabilidad</h2>
          <p>El Titular no garantiza la continuidad, disponibilidad y utilidad del Sitio Web ni de los contenidos o servicios en él ofrecidos. El Titular hará todo lo posible por el buen funcionamiento del Sitio Web, sin embargo, no se responsabiliza ni garantiza que el acceso a este sitio web no vaya a ser ininterrumpido o que esté libre de error.</p>
          <p>Tampoco se responsabiliza ni garantiza que el contenido o software al que pueda accederse a través de este sitio web esté libre de error o cause un daño al sistema informático del usuario (hardware y software). En ningún caso el Titular será responsable por las pérdidas, daños o perjuicios de cualquier tipo que surjan por el acceso o el uso del Sitio Web.</p>
          <p>El Titular no asume responsabilidad alguna derivada de la existencia de virus o cualquier otro software dañino que pueda causar daños en los sistemas informáticos, documentos electrónicos o ficheros del usuario del Sitio Web.</p>
          <p>El Titular se reserva el derecho de interrumpir el acceso al Sitio Web en cualquier momento y sin previo aviso, ya sea por motivos técnicos, de seguridad, de control, de mantenimiento, por fallos de suministro eléctrico o por cualquier otra causa.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>5. Política de enlaces (links)</h2>
          <p>El Sitio Web puede contener enlaces a páginas de terceros. El Titular no controla ni es responsable del contenido de dichos sitios externos, ni avala o asume responsabilidad por los productos, servicios o información ofrecidos en ellos. El usuario accede a los sitios enlazados bajo su exclusiva responsabilidad.</p>
          <p>Cualquier persona que desee establecer un enlace desde su propio sitio web hacia el Sitio Web deberá obtener la autorización previa y por escrito del Titular. En todo caso, el enlace solo podrá dirigirse a la página principal del Sitio Web, no pudiendo reproducir ninguno de sus contenidos ni crear marcos (<em>frames</em>) sobre las páginas del Sitio Web.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>6. Protección de datos de carácter personal</h2>
          <p>El Titular, en su condición de responsable del tratamiento, informa al usuario de que los datos de carácter personal que facilite a través del Sitio Web serán tratados de conformidad con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD) y con la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD).</p>
          <p>Para más información sobre el tratamiento de sus datos personales, puede consultar la <Link to="/privacidad" style={{ color: 'var(--red)' }}>Política de Privacidad</Link> del Sitio Web.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>7. Legislación aplicable y jurisdicción</h2>
          <p>Las presentes condiciones se rigen e interpretan de conformidad con la legislación española. Para la resolución de cualquier controversia que pudiera derivarse del acceso o uso del Sitio Web, el usuario y el Titular acuerdan someterse a la jurisdicción de los Juzgados y Tribunales de la ciudad de Madrid, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
