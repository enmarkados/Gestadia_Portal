import { Link } from 'react-router-dom';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';
import styles from './PagosDevoluciones.module.css';

// Migrated from preview-pagos-devoluciones.html (style lines 7-44, body
// from line 46). <nav>/<footer> replaced with <Header />/<Footer /> (Task
// 2). Static content page, no form/script to reproduce. The breadcrumb
// "Inicio" link now points at "/" (Task 5).
export default function PagosDevoluciones() {
  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.breadcrumb}><Link to="/">Inicio</Link> / Pagos y devoluciones</div>
          <h1 className={styles.pageTitle}>Pagos, Cancelaciones y Devoluciones</h1>
        </div>
      </div>

      <div className={styles.legalBody}>
        <p className={styles.legalIntro}>Titular: <strong>Defensa Legal Consumidores S.L.</strong> · NIF: B01813336 · Paseo de la Castellana 143, 2A, 28046 Madrid</p>

        <div className={styles.legalSection}>
          <h2>Formas de pago</h2>
          <p>Ofrecemos las siguientes modalidades de pago para la contratación de nuestros servicios:</p>
          <ul>
            <li><strong>Pago con tarjeta de crédito/débito</strong> — a través de Stripe, plataforma de pago seguro certificada PCI DSS.</li>
            <li><strong>Pago en 3 plazos con Klarna</strong> — disponible a través de Stripe. Divide el importe en 3 cuotas mensuales sin intereses. Sujeto a aprobación por parte de Klarna según criterios de elegibilidad. El cliente deberá aceptar las condiciones de Klarna en el momento del pago.</li>
            <li><strong>Transferencia bancaria</strong> — el cliente realiza la transferencia al número de cuenta indicado y nos envía el justificante.</li>
            <li><strong>Efectivo o tarjeta en oficina</strong> — disponible en nuestras instalaciones en Madrid.</li>
          </ul>
          <p>El cliente recibirá confirmación del pago una vez completada la transacción.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Política de cancelación</h2>
          <p>El cliente puede desistir del servicio antes de que este haya sido prestado. Para solicitar una cancelación, es necesario comunicarlo por escrito a <strong>administracion@gestadia.com</strong>, indicando:</p>
          <ul>
            <li>Nombre completo y DNI/NIE</li>
            <li>Servicio contratado y fecha de contratación</li>
            <li>Datos bancarios para el reembolso (IBAN y titular)</li>
          </ul>
        </div>

        <div className={styles.legalSection}>
          <h2>Derecho de desistimiento</h2>
          <p>De conformidad con el Real Decreto Legislativo 1/2007, el cliente dispone de un plazo de <strong>14 días naturales</strong> desde la contratación para ejercer su derecho de desistimiento, con devolución íntegra del importe abonado, <strong>siempre que el trámite no haya sido iniciado y no se haya realizado la presentación ante la DGT</strong>.</p>
          <p>Una vez iniciada la tramitación o presentada la documentación ante la DGT, el servicio se considera en ejecución y el derecho de desistimiento queda excluido conforme al artículo 103.a) de la citada norma, salvo lo dispuesto en la política de devoluciones.</p>
          <p>Para ejercer el desistimiento, comuníquelo por escrito a <strong>administracion@gestadia.com</strong> antes de que se haya iniciado el trámite. No se atenderán solicitudes de desistimiento o devolución realizadas por cualquier otra vía (teléfono, WhatsApp, presencialmente u otras).</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Política de devoluciones</h2>
          <p>A los efectos de esta política, <strong>se considera que el trámite ha sido formalmente iniciado desde el momento en que se gestione la recogida de la documentación del cliente</strong>, con independencia de que dicha recogida se realice de forma presencial, mediante mensajería o por cualquier otro medio acordado. El intento de recogida por parte del servicio de mensajería tiene la misma consideración que la recogida efectiva: si el mensajero acude al domicilio indicado y no puede entregar o recoger la documentación por ausencia del cliente o cualquier otra causa imputable a este, el trámite se entenderá igualmente iniciado desde ese momento. La tramitación de la recogida de documentación implica el comienzo efectivo del servicio y, por tanto, la imposibilidad de acogerse al derecho de desistimiento previsto en el artículo 103.a) del Real Decreto Legislativo 1/2007.</p>
          <div className={styles.highlightBox}>
            <p><strong>Trámite no iniciado:</strong> devolución íntegra del importe abonado.</p>
          </div>
          <div className={styles.highlightBox}>
            <p><strong>Trámite iniciado parcialmente:</strong> devolución del 50% del importe abonado.</p>
          </div>
          <div className={styles.highlightBox}>
            <p><strong>Trámite completado:</strong> no procede devolución, salvo error imputable a Defensa Legal Consumidores S.L.</p>
          </div>
          <p>Las devoluciones se procesarán en un plazo máximo de 14 días hábiles desde la aceptación de la solicitud, utilizando el mismo método de pago empleado en la contratación.</p>
        </div>

        <div className={styles.legalSection}>
          <h2>Contacto para gestiones de pago</h2>
          <p>Para cualquier consulta relacionada con pagos, cancelaciones o devoluciones, puedes contactarnos en:</p>
          <ul>
            <li>Email: administracion@gestadia.com</li>
            <li>Teléfono: 910 600 314</li>
            <li>WhatsApp: 684 46 26 70</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
}
