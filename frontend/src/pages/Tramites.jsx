import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import styles from './Tramites.module.css';

// Migrated from preview-tramites.html (body lines 86-283). <nav>/<footer>
// replaced with <Header />/<Footer /> (Task 2). Every catalog item's
// "Solicitar información" link now points at its real /tramites/* route
// (all 8 wired in Task 4) — converted from the plain preview-*.html hrefs
// this catalog was seeded with in Task 3, before those routes existed.
//
// The original page's inline <script> does two things: (1) filter pills
// that show/hide `.catalog-group`s by category via direct DOM manipulation,
// and (2) a scroll-reveal IntersectionObserver for the `.how-step` cards.
// Both are reproduced here — filtering via React state (conditional
// rendering) rather than DOM manipulation, and the reveal effect via a ref +
// effect using a `data-reveal` attribute (avoids depending on the CSS
// module's hashed class name).
const CATALOG = {
  permiso: {
    title: 'Permiso de conducir',
    items: [
      { title: 'Canje de Carnet Extranjero', desc: 'Homologa tu permiso extranjero por el carnet español. Nos encargamos de toda la documentación ante la DGT.', price: '210 €', href: '/tramites/canje-carnet', isRoute: true },
      { title: 'Duplicado de Carnet de Conducir', desc: 'Pérdida, robo o deterioro de tu carnet. Tramitamos el duplicado sin que tengas que ir a tráfico.', price: '70 €', href: '/tramites/duplicado-carnet', isRoute: true },
      { title: 'Duplicado por Cambio de Datos', desc: 'NIE a DNI, cambio de nombre o cambio de sexo. Actualizamos los datos de tu carnet de conducir.', price: '70 €', href: '/tramites/duplicado-datos', isRoute: true },
      { title: 'Permiso Internacional de Conducir', desc: 'Conduce fuera de la UE con total legalidad. Válido en prácticamente todos los países del mundo durante un año.', price: '100 €', href: '/tramites/permiso-internacional', isRoute: true },
    ],
  },
  vehiculo: {
    title: 'Vehículo',
    items: [
      { title: 'Transferencia de Vehículo', desc: 'Cambio de titularidad ante la DGT. Coches y motos, compradores y vendedores particulares.', price: '190 €', href: '/tramites/transferencia', isRoute: true },
      { title: 'Baja de Vehículo', desc: 'Deja de pagar impuestos por un vehículo que ya no usas. Tramitamos la baja definitiva o temporal.', price: '190 €', href: '/tramites/baja-vehiculo', isRoute: true },
      { title: 'Cancelación de Reserva de Dominio', desc: 'Elimina la reserva de dominio de tu vehículo una vez finalizado el préstamo con el banco o financiera.', price: '120 €', href: '/tramites/cancelacion-dominio', isRoute: true },
      { title: 'Duplicado Permiso de Circulación', desc: 'Pérdida o deterioro del permiso de circulación. Autorización provisional inmediata mientras se tramita el definitivo.', price: '70 €', href: '/tramites/duplicado-circulacion', isRoute: true },
    ],
  },
};

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'permiso', label: 'Permiso de conducir' },
  { key: 'vehiculo', label: 'Vehículo' },
];

export default function Tramites() {
  const [activeFilter, setActiveFilter] = useState('all');
  const rootRef = useRef(null);

  useEffect(() => {
    const els = rootRef.current.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}><Link to="/">Inicio</Link> / <span>Trámites DGT</span></div>
          <div className={styles.pageEyebrow}>Trámites DGT</div>
          <h1 className={styles.pageTitle}>Todos nuestros servicios</h1>
          <p className={styles.pageSub}>Precio fijo, sin sorpresas. Las tasas de la DGT están incluidas en todos los trámites.</p>
        </div>
      </div>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`${styles.filterPill} ${activeFilter === f.key ? styles.active : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.catalog}>
        {Object.entries(CATALOG).map(([key, group]) => (
          (activeFilter === 'all' || activeFilter === key) && (
            <div className={styles.catalogGroup} key={key}>
              <div className={styles.catalogGroupTitle}>{group.title}</div>
              <div className={styles.catalogGrid}>
                {group.items.map((item) => (
                  <div className={styles.serviceCard} key={item.title}>
                    <div className={styles.serviceCardTitle}>{item.title}</div>
                    <div className={styles.serviceCardDesc}>{item.desc}</div>
                    <div className={styles.serviceCardFooter}>
                      <div className={styles.serviceCardPrice}>{item.price}</div>
                      {item.isRoute ? (
                        <Link to={item.href} className={styles.serviceCardBtn}>Solicitar información →</Link>
                      ) : (
                        <a href={item.href} className={styles.serviceCardBtn}>Solicitar información →</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* CÓMO FUNCIONA */}
      <section className={styles.how} id="como-funciona">
        <div className={styles.howInner}>
          <div className={styles.sectionEyebrow}>El proceso</div>
          <h2 className={styles.sectionTitle}>Cuatro pasos, sin complicaciones</h2>
          <p className={styles.sectionSub}>Nos encargamos de todo. Tú solo rellenas el formulario y te llamamos.</p>
          <div className={styles.howSteps}>
            <div className={`${styles.howStep} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.0s' }}>
              <div className={styles.howStepNum}>1</div>
              <div className={styles.howStepTitle}>Elige tu trámite</div>
              <div className={styles.howStepDesc}>Selecciona el servicio que necesitas y revisa qué incluye.</div>
            </div>
            <div className={`${styles.howStep} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.12s' }}>
              <div className={styles.howStepNum}>2</div>
              <div className={styles.howStepTitle}>Solicita información</div>
              <div className={styles.howStepDesc}>Formulario rápido. Te contactamos en menos de 24h.</div>
            </div>
            <div className={`${styles.howStep} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.24s' }}>
              <div className={styles.howStepNum}>3</div>
              <div className={styles.howStepTitle}>Envía tus documentos</div>
              <div className={styles.howStepDesc}>Por la web o por WhatsApp. Te decimos exactamente qué necesitamos.</div>
            </div>
            <div className={`${styles.howStep} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.36s' }}>
              <div className={styles.howStepNum}>4</div>
              <div className={styles.howStepTitle}>Recibe el resultado</div>
              <div className={styles.howStepDesc}>Te informamos de cada paso. Nuestro equipo se encarga de todo ante la DGT.</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
