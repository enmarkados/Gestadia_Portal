import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Tramites from './pages/Tramites.jsx';
import Contacto from './pages/Contacto.jsx';
import Checkout from './pages/Checkout.jsx';
import Gracias from './pages/Gracias.jsx';
import Transferencia from './pages/servicios/Transferencia.jsx';
import CanjeCarnet from './pages/servicios/CanjeCarnet.jsx';
import DuplicadoCarnet from './pages/servicios/DuplicadoCarnet.jsx';
import DuplicadoDatos from './pages/servicios/DuplicadoDatos.jsx';
import DuplicadoCirculacion from './pages/servicios/DuplicadoCirculacion.jsx';
import PermisoInternacional from './pages/servicios/PermisoInternacional.jsx';
import BajaVehiculo from './pages/servicios/BajaVehiculo.jsx';
import CancelacionDominio from './pages/servicios/CancelacionDominio.jsx';
import AvisoLegal from './pages/legal/AvisoLegal.jsx';
import Privacidad from './pages/legal/Privacidad.jsx';
import Cookies from './pages/legal/Cookies.jsx';
import PagosDevoluciones from './pages/legal/PagosDevoluciones.jsx';
import ProteccionDatos from './pages/legal/ProteccionDatos.jsx';

export default function App() {
  return (
    <div data-testid="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tramites" element={<Tramites />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/gracias" element={<Gracias />} />
        <Route path="/tramites/transferencia" element={<Transferencia />} />
        <Route path="/tramites/canje-carnet" element={<CanjeCarnet />} />
        <Route path="/tramites/duplicado-carnet" element={<DuplicadoCarnet />} />
        <Route path="/tramites/duplicado-datos" element={<DuplicadoDatos />} />
        <Route path="/tramites/duplicado-circulacion" element={<DuplicadoCirculacion />} />
        <Route path="/tramites/permiso-internacional" element={<PermisoInternacional />} />
        <Route path="/tramites/baja-vehiculo" element={<BajaVehiculo />} />
        <Route path="/tramites/cancelacion-dominio" element={<CancelacionDominio />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/pagos-devoluciones" element={<PagosDevoluciones />} />
        <Route path="/proteccion-datos" element={<ProteccionDatos />} />
      </Routes>
    </div>
  );
}
