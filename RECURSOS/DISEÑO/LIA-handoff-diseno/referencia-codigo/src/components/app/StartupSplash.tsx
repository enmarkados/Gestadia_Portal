import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../AuthContext';
import { createStartupReadiness, shouldShowStartupSplash } from '../../services/startupReadiness';
import logo from '../../assets/brand/dlc-logo-inverted.png';
import loader from '../../assets/brand/startup-loader.gif';
import loaderStill from '../../assets/brand/startup-loader.png';

const StartupContext = createContext<ReturnType<typeof createStartupReadiness> | null>(null);
const STARTUP_MESSAGES = [
  'Estamos preparando tu espacio legal…',
  'Cuéntale a LIA lo que te preocupa.',
  'Tus consultas y herramientas, en un solo lugar.',
  'Si lo necesitas, solicita contacto con un abogado.',
];
export function useStartupTask(loading: boolean) {
  const startup = useContext(StartupContext);
  useLayoutEffect(() => {
    if (startup && loading) return startup.begin();
  }, [startup, loading]);
}
export function StartupSplash({ children }: { children: ReactNode }) {
  const { loading } = useAuth();
  const [startup] = useState(() => createStartupReadiness());
  const [visible, setVisible] = useState(() => shouldShowStartupSplash(window.location.pathname, Capacitor.isNativePlatform()));
  const [fontsReady, setFontsReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  useEffect(() => {
    if (!visible || slow) return;
    const timer = window.setInterval(() => setMessageIndex(index => (index + 1) % STARTUP_MESSAGES.length), 3000);
    return () => window.clearInterval(timer);
  }, [visible, slow]);
  useEffect(() => {
    if (!visible) return;
    const timeout = window.setTimeout(() => setSlow(true), 30_000);
    return () => window.clearTimeout(timeout);
  }, [visible]);
  useEffect(() => {
    let active = true;
    const done = () => { if (active) setFontsReady(true); };
    const timeout = window.setTimeout(done, 8000);
    document.fonts.load('400 16px Figtree').then(() => document.fonts.ready).then(done, done);
    return () => { active = false; window.clearTimeout(timeout); };
  }, []);
  useEffect(() => {
    if (!visible || loading || !fontsReady) return;
    const timer = window.setInterval(() => { if (startup.isReady()) setVisible(false); }, 100);
    return () => window.clearInterval(timer);
  }, [visible, loading, fontsReady, startup]);
  return <StartupContext.Provider value={startup}>
    <div style={{ height: '100%' }} inert={visible} aria-hidden={visible || undefined}>{children}</div>
    {visible && <div className="lia-startup-splash" role="status" aria-label="Cargando LIA">
      <img className="lia-startup-logo" src={logo} alt="Defensa Legal Consumidores" />
      {slow ? <div className="max-w-xs space-y-4 text-center" role="alert"><p>La carga está tardando más de lo esperado. Comprueba tu conexión y vuelve a intentarlo.</p><button className="rounded-xl border border-white/60 px-5 py-3" onClick={() => window.location.reload()}>Reintentar carga</button></div>
        : <><picture aria-hidden="true"><source media="(prefers-reduced-motion: reduce)" srcSet={loaderStill} /><img className="lia-startup-loader" src={loader} alt="" /></picture><span className="lia-startup-label mx-6 min-h-12 max-w-xs text-center" aria-hidden="true">{STARTUP_MESSAGES[messageIndex]}</span></>}
    </div>}
  </StartupContext.Provider>;
}
