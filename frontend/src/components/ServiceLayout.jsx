import { Link } from 'react-router-dom';
import styles from './ServiceLayout.module.css';

// Shared two-column trámite-page shell, extracted from preview-transferencia.html's
// `.page-body` structure (breadcrumb + `.page-left` title/description/checklist +
// `.page-right` price/lead-form sidebar).
//
// This component only owns the breadcrumb + the two-column grid + the title/subtitle
// heading. It does NOT render <Header /> / <Footer /> — each trámite page (Task 4)
// composes those itself, the same way the recipe in the migration plan separates
// "swap <nav>/<footer> for <Header />/<Footer />" from "wrap the shared two-column
// structure in <ServiceLayout>" as two distinct steps.
//
// `children` is the left-column content (info grid, documents checklist, steps —
// this varies per trámite and each page will define its own CSS module for it,
// per the Task 4 recipe of extracting each preview-*.html's <style> block verbatim).
// `sidebar` is optional and renders in the right column (the price/lead-form panel);
// it's omitted if not passed so ServiceLayout works even before that content exists.
//
// The "Inicio" breadcrumb link uses the real "/" route (wired in Task 1).
// The "Trámites DGT" breadcrumb link now uses the real "/tramites" route
// (wired in Task 3) — converted from the plain <a href="preview-tramites.html">
// left here by Task 2, since that route now exists (Task 4).
export default function ServiceLayout({ title, subtitle, eyebrow, children, sidebar }) {
  return (
    <>
      <div className={styles.breadcrumb}>
        <Link to="/">Inicio</Link> / <Link to="/tramites">Trámites DGT</Link> / <span>{title}</span>
      </div>
      <div className={styles.pageBody}>
        <div className={styles.pageLeft}>
          {eyebrow && <div className={styles.serviceEyebrow}>{eyebrow}</div>}
          <h1 className={styles.serviceTitle}>{title}</h1>
          {subtitle && <div className={styles.serviceDesc}>{subtitle}</div>}
          {children}
        </div>
        {sidebar && <div className={styles.pageRight}>{sidebar}</div>}
      </div>
    </>
  );
}
