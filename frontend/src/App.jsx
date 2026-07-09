import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';

export default function App() {
  return (
    <div data-testid="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}
