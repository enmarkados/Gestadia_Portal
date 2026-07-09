import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Tramites from './pages/Tramites.jsx';
import Contacto from './pages/Contacto.jsx';

export default function App() {
  return (
    <div data-testid="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tramites" element={<Tramites />} />
        <Route path="/contacto" element={<Contacto />} />
      </Routes>
    </div>
  );
}
