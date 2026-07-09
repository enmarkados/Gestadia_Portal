import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import styles from './Gracias.module.css';

// New page (Task 7) — mirrors unir/public/gracias.html's copy/structure
// (a sibling repo, read-only reference): a centered confirmation card
// with the order number and a link to create a password in the client
// portal. The original links to `/portal.html`; here it links to
// `/portal/login` (Task 8 wires that route — intentionally left as a
// forward reference per the task brief, since it's the very next task in
// this page group).
export default function Gracias() {
  const [searchParams] = useSearchParams();
  const pedido = searchParams.get('pedido') || '';

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.body}>
        <div className={styles.card}>
          <span className={styles.badge}>Pago recibido</span>
          <h1 className={styles.title}>¡Gracias! Tu trámite ya está en marcha</h1>
          {pedido && <p className={styles.pedido}>Pedido <span>{pedido}</span></p>}
          <p className={styles.text}>
            Te hemos enviado un email para <strong>crear tu contraseña</strong> y acceder a tu área de cliente,
            donde podrás subir la documentación y seguir el estado de tu expediente.
          </p>
          <Link to="/portal/login" className={styles.btn}>Ir a mi área de cliente</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
