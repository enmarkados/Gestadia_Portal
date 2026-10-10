import React from 'react';
import { afterEach, test, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from './AppContext.jsx';
import LegalPage from './LegalPage.jsx';
afterEach(()=>{cleanup();localStorage.clear();delete window.GESTADIA_APP_CONFIG;});
function show(kind,demoOnly=false) {
  window.GESTADIA_APP_CONFIG={demoOnly,demoEnabled:demoOnly};
  return render(<MemoryRouter><AppProvider><LegalPage kind={kind}/></AppProvider></MemoryRouter>);
}
test('privacidad conectada pública describe cuenta social, push y conservación sin afirmaciones de demo',()=>{
  show('privacy');
  expect(screen.getByRole('heading',{name:'Política de privacidad'})).toBeInTheDocument();
  expect(screen.getByText(/Apple puede proporcionar una dirección de correo privada/)).toBeInTheDocument();
  expect(screen.getByText(/no incluimos DNI/i)).toBeInTheDocument();
  expect(screen.getByText(/no conservaremos una cuenta operativa/i)).toBeInTheDocument();
  expect(document.body).not.toHaveTextContent('VERSIÓN DE DEMOSTRACIÓN');
  expect(document.body).not.toHaveTextContent('sólo se guarda el nombre del archivo');
});
test('la eliminación externa es accesible sin login ni reinstalar la APP y no afirma haber eliminado datos',()=>{
  show('delete-account');
  expect(screen.getByRole('link',{name:/solicitar eliminación por correo/i})).toHaveAttribute('href','mailto:info@gestadia.com?subject=Eliminar%20mi%20cuenta%20Gestadia');
  expect(screen.getByText(/no exige instalar de nuevo Gestadia/i)).toBeInTheDocument();
  expect(screen.queryByText('Cuenta eliminada')).not.toBeInTheDocument();
});
test('una configuración antigua no sustituye la privacidad real',()=>{
  show('privacy',true);
  expect(screen.getByText('GESTADIA')).toBeInTheDocument();
  expect(screen.getByText(/Apple puede proporcionar una dirección de correo privada/)).toBeInTheDocument();
});
