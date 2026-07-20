import { useRef, useState } from 'react';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import ServiceLayout from '../../components/ServiceLayout.jsx';
import ContratarCard from './ContratarCard.jsx';
import { SERVICIOS } from '@shared/servicios.js';
import styles from './CanjeCarnet.module.css';

const S = SERVICIOS['canje-carnet'];

// Migrated from preview-canje.html (style lines 7-137, body from line 139).
// See Transferencia.jsx for the shared recipe notes. This page is the
// longest of the 8 because it embeds an interactive "Verifica tus
// requisitos" eligibility checker inside Step 1 (the original's inline
// <script> — `answers`, `toggleVerif()`, the `.check-opt` click handlers,
// and `verificarElegibilidad()`). That logic is reproduced 1:1 below as
// React state instead of direct DOM manipulation:
//   - `answers` (q1/q3/q4/q5) + `country` + `verifOpen` mirror the
//     original's module-scoped variables and toggle class.
//   - q5 ("¿llevaba más de 6 meses residiendo...?") is only shown when
//     answers[4] === 'no', exactly like the original's
//     `q5.style.display = val === 'no' ? 'block' : 'none'`, and selecting
//     "Sí" for q4 clears any previous q5 answer the same way.
//   - `verificarElegibilidad()` reproduces the same branch order and the
//     same copy for each outcome, including scrolling the sidebar into
//     view on success (`document.querySelector('.page-right')` in the
//     original — done here via a ref on the wrapper around <LeadForm>,
//     since ServiceLayout owns the actual `.page-right` element).
const COUNTRIES = [
  'Alemania', 'Andorra', 'Argentina', 'Austria', 'Bélgica', 'Bolivia', 'Brasil', 'Bulgaria', 'Chile', 'Chipre',
  'Colombia', 'Corea del Sur', 'Costa Rica', 'Croacia', 'Cuba', 'Dinamarca', 'Ecuador', 'El Salvador', 'Eslovaquia', 'Eslovenia',
  'Estonia', 'Filipinas', 'Finlandia', 'Francia', 'Georgia', 'Grecia', 'Guatemala', 'Honduras', 'Hungría', 'Irlanda',
  'Islandia', 'Italia', 'Japón', 'Letonia', 'Líbano', 'Liechtenstein', 'Lituania', 'Luxemburgo', 'Malta', 'Marruecos',
  'México', 'Nicaragua', 'Noruega', 'Países Bajos', 'Panamá', 'Paraguay', 'Perú', 'Polonia', 'Portugal', 'Reino Unido',
  'República Checa', 'República Dominicana', 'Rumanía', 'Suecia', 'Suiza', 'Túnez', 'Turquía', 'Ucrania', 'Uruguay', 'Venezuela',
];

export default function CanjeCarnet() {
  const [verifOpen, setVerifOpen] = useState(false);
  const [answers, setAnswers] = useState({ 1: null, 3: null, 4: null, 5: null });
  const [country, setCountry] = useState('');
  const [result, setResult] = useState(null); // { ok: boolean, message: ReactNode } | null
  const sidebarRef = useRef(null);

  const q5Visible = answers[4] === 'no';

  function selectAnswer(q, val) {
    setAnswers((prev) => {
      const next = { ...prev, [q]: val };
      if (q === 4 && val === 'si') next[5] = null;
      return next;
    });
    setResult(null);
  }

  function verificarElegibilidad() {
    if (!answers[1] || !country || !answers[3] || !answers[4] || (q5Visible && !answers[5])) {
      setResult({ ok: false, message: 'Por favor, responde todas las preguntas.' });
      return;
    }

    if (answers[1] === 'no') {
      setResult({
        ok: false,
        message: (
          <>No podemos tramitar el canje: necesitas residencia legal en España.<br /><br />Consúltanos por <a href="https://wa.me/34684462670">WhatsApp</a>.</>
        ),
      });
    } else if (country === 'no') {
      setResult({
        ok: false,
        message: (
          <>No podemos tramitar el canje: tu país no tiene convenio con España.<br /><br />Consúltanos por <a href="https://wa.me/34684462670">WhatsApp</a>.</>
        ),
      });
    } else if (answers[3] === 'no') {
      setResult({
        ok: false,
        message: (
          <>No podemos tramitar el canje: el permiso debe estar en vigor.<br /><br />Consúltanos por <a href="https://wa.me/34684462670">WhatsApp</a>.</>
        ),
      });
    } else if (answers[4] === 'si' || answers[5] === 'si') {
      setResult({ ok: true, message: '¡Cumples los requisitos! Puedes contratar el trámite abajo.' });
      sidebarRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    } else {
      setResult({
        ok: false,
        message: (
          <>No podemos tramitar el canje: el permiso debe haberse obtenido tras más de 6 meses de residencia en el país emisor.<br /><br />Consúltanos por <a href="https://wa.me/34684462670">WhatsApp</a>.</>
        ),
      });
    }
  }

  function optClass(q, val) {
    if (answers[q] !== val) return styles.checkOpt;
    return `${styles.checkOpt} ${val === 'si' ? styles.selectedSi : styles.selectedNo}`;
  }

  return (
    <div className={styles.page}>
      <Header />

      <ServiceLayout
        title="Canje de Carnet Extranjero"
        eyebrow="Permiso de conducir"
        subtitle="¿Tienes un permiso de conducir extranjero y quieres obtener el carnet español? Gestionamos la homologación ante la DGT sin que tengas que desplazarte. Nos encargamos de toda la documentación y el proceso."
        sidebar={
          <div ref={sidebarRef}>
            <ContratarCard
              slug={S.slug}
              servicio="Canje de Carnet Extranjero"
              precio={`${S.precio} €`}
              includes={S.includes}
            />
          </div>
        }
      >
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <div className={styles.infoItemLabel}>Tiempo estimado</div>
            <div className={styles.infoItemVal}>4 – 8 semanas</div>
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

            <div className={styles.docGroupLabel}>Residencia legal en España</div>
            <div className={styles.docItem}><div className={styles.docDot} />DNI español</div>
            <div className={styles.docItem}><div className={styles.docDot} />Carta blanca</div>
            <div className={styles.docItem}><div className={styles.docDot} />Tarjeta Roja</div>
            <div className={styles.docItem}><div className={styles.docDot} />Tarjeta intracomunitaria</div>
            <div className={styles.docItem}><div className={styles.docDot} />Tarjeta de residencia</div>
            <div className={styles.docItem}><div className={styles.docDot} />Resguardo de concesión aprobado</div>

            <div className={styles.docGroupLabel} style={{ marginTop: '14px' }}>Permiso de conducir</div>
            <div className={styles.docItem}><div className={styles.docDot} />Permiso extranjero original en vigor</div>
            <div className={styles.docItem}><div className={styles.docDot} />Examen psicotécnico (centro autorizado)</div>

            <div className={styles.docsNote} style={{ marginTop: '14px' }}>Tras contratar podrás enviar los documentos por WhatsApp. Si necesitamos documentación original, la recogeremos en tu domicilio a través de nuestro servicio de mensajería sin coste adicional.</div>
          </div>

          <div className={styles.stepsSection}>
            <div className={styles.stepsTitle}>¿Cómo funciona?</div>
            <div className={`${styles.stepRow} ${styles.stepRowFeatured}`}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepText}>
                <strong>Verifica tus requisitos</strong>
                Comprueba si cumples los requisitos para el canje.
                <button
                  type="button"
                  className={`${styles.verifToggle} ${verifOpen ? styles.open : ''}`}
                  onClick={() => setVerifOpen((o) => !o)}
                >
                  <span className={styles.label}>Comprobar requisitos</span> <span className={styles.arrow}>▼</span>
                </button>
                <div className={styles.verifInline} style={{ display: verifOpen ? 'block' : 'none' }}>
                  <div className={styles.checkQ}>
                    <div className={styles.checkQLabel}>¿Tienes residencia legal en España?</div>
                    <div className={styles.checkOptions}>
                      <button type="button" className={optClass(1, 'si')} onClick={() => selectAnswer(1, 'si')}>Sí</button>
                      <button type="button" className={optClass(1, 'no')} onClick={() => selectAnswer(1, 'no')}>No</button>
                    </div>
                  </div>
                  <div className={styles.checkQ}>
                    <div className={styles.checkQLabel}>¿Tu permiso es de alguno de estos países?</div>
                    <select
                      className={styles.formInput}
                      style={{ marginTop: '6px', marginBottom: 0, fontSize: '13px' }}
                      value={country}
                      onChange={(e) => { setCountry(e.target.value); setResult(null); }}
                    >
                      <option value="">— Selecciona tu país —</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value="ok">{c}</option>
                      ))}
                      <option value="no">Mi país no está en la lista</option>
                    </select>
                  </div>
                  <div className={styles.checkQ}>
                    <div className={styles.checkQLabel}>¿Tu permiso de conducir está en vigor?</div>
                    <div className={styles.checkOptions}>
                      <button type="button" className={optClass(3, 'si')} onClick={() => selectAnswer(3, 'si')}>Sí</button>
                      <button type="button" className={optClass(3, 'no')} onClick={() => selectAnswer(3, 'no')}>No / Caducado</button>
                    </div>
                  </div>
                  <div className={styles.checkQ}>
                    <div className={styles.checkQLabel}>¿Obtuvo el permiso de conducir antes de obtener la residencia o nacionalidad española?</div>
                    <div className={styles.checkOptions}>
                      <button type="button" className={optClass(4, 'si')} onClick={() => selectAnswer(4, 'si')}>Sí</button>
                      <button type="button" className={optClass(4, 'no')} onClick={() => selectAnswer(4, 'no')}>No</button>
                    </div>
                  </div>
                  {q5Visible && (
                    <div className={styles.checkQ}>
                      <div className={styles.checkQLabel}>Cuando obtuvo el permiso, ¿llevaba más de 6 meses residiendo en ese país?</div>
                      <div className={styles.checkOptions}>
                        <button type="button" className={optClass(5, 'si')} onClick={() => selectAnswer(5, 'si')}>Sí</button>
                        <button type="button" className={optClass(5, 'no')} onClick={() => selectAnswer(5, 'no')}>No</button>
                      </div>
                    </div>
                  )}
                  {result && (
                    <div style={{ marginBottom: '8px' }}>
                      <div className={result.ok ? styles.checkResultOk : styles.checkResultNo}>{result.message}</div>
                    </div>
                  )}
                  <button type="button" className={styles.verifBtn} onClick={verificarElegibilidad}>Verificar →</button>
                </div>
              </div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepText}><strong>Contrata online</strong>Rellena tus datos y paga de forma segura.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>3</div>
              <div className={styles.stepText}><strong>Envíanos los documentos</strong>Por la web o por WhatsApp.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>4</div>
              <div className={styles.stepText}><strong>Nosotros lo tramitamos</strong>Nuestro equipo jurídico gestiona todo ante la DGT.</div>
            </div>
            <div className={styles.stepRow}>
              <div className={styles.stepNum}>5</div>
              <div className={styles.stepText}><strong>Recibes tu carnet</strong>Te informamos de cada paso.</div>
            </div>
          </div>
        </div>
      </ServiceLayout>

      <Footer />
    </div>
  );
}
