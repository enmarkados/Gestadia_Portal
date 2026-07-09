import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import styles from './Home.module.css';

// Migrated from preview-home.html (body lines 184-425). The <nav>/<footer>
// markup was replaced with <Header />/<Footer /> (Task 2). Internal links
// that now have real routes ("/", "/contacto", "/tramites") were converted
// to <Link>; everything else (in-page anchors, external WhatsApp links, and
// trámite detail pages that don't have a route yet, e.g. canje-carnet)
// stays a plain <a href="preview-*.html">.
//
// The original page has a scroll-reveal IntersectionObserver in its inline
// <script> that toggles a `.visible` class onto `.reveal` elements — without
// it those elements stay permanently at opacity:0 (see Home.module.css'
// `.reveal` rule). That behavior is reproduced below via a ref + effect,
// using a `data-reveal` attribute (rather than matching on the CSS-module
// hashed class name) to find the elements to observe. The original page's
// animated "+1.000 trámites" counter script targeted a `.hero-trust-item`
// element that doesn't actually exist in this page's markup (dead code in
// the source), so it isn't reproduced here.
export default function Home() {
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
    <div ref={rootRef}>
      <Header />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>Trámites DGT Online</div>
          <h1 className={styles.heroTitle}>
            Tus trámites de tráfico,
            <br />
            <em>resueltos hoy.</em>
          </h1>
          <p className={styles.heroSub}>
            Sin desplazamientos, sin colas y sin cita previa en la DGT.
            <br />
            Solicita información y nuestro equipo jurídico se encarga de todo.
          </p>
          <div className={styles.heroActions}>
            <a href="#servicios" className={styles.heroBtn}>Ver trámites disponibles →</a>
            <a href="https://wa.me/34684462670" target="_blank" rel="noopener" className={styles.heroLink}>💬 ¿Dudas? Escríbenos por WhatsApp</a>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className={styles.statsBand}>
        <div className={styles.statsInner}>
          <div className={styles.statItem}>
            <div className={styles.statNum}>+1.000</div>
            <div className={styles.statLbl}>Trámites gestionados</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNum}>4,6<span>★</span></div>
            <div className={styles.statLbl}>Valoración en Google</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNum}>24h</div>
            <div className={styles.statLbl}>Tiempo de respuesta</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNum}>8</div>
            <div className={styles.statLbl}>Trámites disponibles</div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className={styles.services} id="servicios">
        <div className={styles.servicesInner}>
          <div className={styles.sectionEyebrow}>Trámites DGT</div>
          <h2 className={styles.sectionTitle}>Los trámites más solicitados</h2>
          <p className={styles.sectionSub}>Precio fijo, sin sorpresas. Las tasas de la DGT están incluidas.</p>

          <div className={styles.servicesGrid}>
            <div className={`${styles.serviceCard} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.05s' }}>
              <div className={styles.serviceCardCat}>Permiso de conducir</div>
              <div className={styles.serviceCardTitle}>Canje de Carnet Extranjero</div>
              <div className={styles.serviceCardDesc}>Homologa tu permiso extranjero por el carnet español sin moverte de casa.</div>
              <div className={styles.serviceCardFooter}>
                <div className={styles.serviceCardPrice}>210 €</div>
                <a href="preview-canje.html" className={styles.serviceCardBtn}>Solicitar información →</a>
              </div>
            </div>

            <div className={`${styles.serviceCard} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.15s' }}>
              <div className={styles.serviceCardCat}>Vehículo</div>
              <div className={styles.serviceCardTitle}>Transferencia de Vehículo</div>
              <div className={styles.serviceCardDesc}>Cambio de titularidad ante la DGT. Coches y motos, compradores y vendedores particulares.</div>
              <div className={styles.serviceCardFooter}>
                <div className={styles.serviceCardPrice}>190 €</div>
                <a href="#" className={styles.serviceCardBtn}>Solicitar información →</a>
              </div>
            </div>

            <div className={`${styles.serviceCard} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.25s' }}>
              <div className={styles.serviceCardCat}>Permiso de conducir</div>
              <div className={styles.serviceCardTitle}>Duplicado de Carnet de Conducir</div>
              <div className={styles.serviceCardDesc}>Pérdida, robo o deterioro. Tramitamos el duplicado de tu carnet de conducir.</div>
              <div className={styles.serviceCardFooter}>
                <div className={styles.serviceCardPrice}>70 €</div>
                <a href="#" className={styles.serviceCardBtn}>Solicitar información →</a>
              </div>
            </div>
          </div>

          <div className={styles.servicesMore}>
            <Link to="/tramites" className={styles.servicesMoreLink}>Ver todos los trámites disponibles →</Link>
          </div>
        </div>
      </section>

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

      {/* GARANTÍAS */}
      <section className={styles.trust}>
        <div className={styles.trustInner} style={{ marginBottom: 0 }}>
          <div style={{ gridColumn: '1/-1', marginBottom: '32px' }}>
            <div className={styles.sectionEyebrow}>Por qué elegirnos</div>
            <h2 className={styles.sectionTitle}>Tu trámite, en buenas manos</h2>
          </div>
          <div className={`${styles.trustItem} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.0s' }}>
            <div className={styles.trustIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <div>
              <div className={styles.trustTitle}>Sin compromiso</div>
              <div className={styles.trustDesc}>Solicita información sin coste. Solo pagas si decides contratar el servicio.</div>
            </div>
          </div>
          <div className={`${styles.trustItem} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.15s' }}>
            <div className={styles.trustIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div>
              <div className={styles.trustTitle}>Tramitación ágil</div>
              <div className={styles.trustDesc}>Empezamos con tu trámite en menos de 24 horas tras recibir la documentación.</div>
            </div>
          </div>
          <div className={`${styles.trustItem} ${styles.reveal}`} data-reveal style={{ transitionDelay: '.3s' }}>
            <div className={styles.trustIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <div>
              <div className={styles.trustTitle}>Especialista personal</div>
              <div className={styles.trustDesc}>Tendrás un especialista de nuestro equipo jurídico que te informa en cada paso.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className={styles.ctaBand}>
        <div className={styles.ctaBandTitle}>¿Tienes un trámite pendiente?</div>
        <p className={styles.ctaBandSub}>Consúltanos sin compromiso. Nuestro equipo te responde en menos de 24 horas.</p>
        <div className={styles.ctaBandBtns}>
          <Link to="/contacto" className={styles.ctaBandBtn}>Solicitar información →</Link>
          <a href="https://wa.me/34684462670" target="_blank" rel="noopener" className={styles.ctaBandLink}>💬 Escríbenos por WhatsApp</a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
