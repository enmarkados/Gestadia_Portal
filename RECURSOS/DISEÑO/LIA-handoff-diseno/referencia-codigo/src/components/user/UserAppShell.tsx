import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, ChevronLeft, MessagesSquare, Sparkles, SquarePen } from 'lucide-react';
import { useAuth } from '../AuthContext';
import UserMenu from '../UserMenu';
import { useNotifications } from '../app/useNotifications';
import { LawyerContactForm } from './LawyerContactForm';
import { createKeyboardViewport } from '../../services/userKeyboardViewport';
import { NativePushNotificationBell } from '../app/NativePushNotificationBell';

export function useUserKeyboard() {
  const [keyboard, setKeyboard] = useState(false);
  const [height, setHeight] = useState<number | undefined>();
  const [top, setTop] = useState(0);
  useEffect(() => {
    const viewport = window.visualViewport;
    const model = createKeyboardViewport();
    const update = () => {
      const h = viewport?.height ?? window.innerHeight;
      const result = model.measure({ height: h, layoutHeight: window.innerHeight, offsetTop: viewport?.offsetTop, editableFocused: document.activeElement?.matches('textarea, input') ?? false, orientation: String(window.screen.orientation?.angle ?? 0) });
      setKeyboard(result.open); setHeight(result.height); setTop(result.top);
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update); window.addEventListener('orientationchange', update);
    window.addEventListener('focusin', update); window.addEventListener('focusout', update);
    return () => { viewport?.removeEventListener('resize', update); viewport?.removeEventListener('scroll', update); window.removeEventListener('resize', update); window.removeEventListener('orientationchange', update); window.removeEventListener('focusin', update); window.removeEventListener('focusout', update); };
  }, []);
  return { hideFooter: keyboard, height, top };
}

export function UserAppShell({ children, footer, hideFooter = false, viewportHeight, viewportTop = 0, onNewChat, back, backTo }: {
  children: ReactNode; footer?: ReactNode; hideFooter?: boolean; viewportHeight?: number; viewportTop?: number; onNewChat?: () => void; back?: boolean; backTo?: string;
}) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const notices = useNotifications(Boolean(profile));
  const [contactOpen, setContactOpen] = useState(false);
  const account = useRef<HTMLDivElement>(null);
  return <div className="lia-user-shell" style={viewportHeight ? { height: viewportHeight, top: viewportTop } : undefined}>
    <header className="lia-user-header" data-tour-target="app-header">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">{back && <button aria-label="Volver" onClick={() => backTo ? navigate(backTo) : navigate(-1)}><ChevronLeft size={22} /></button>}<span className="text-[20px] font-bold leading-6">LIA</span></div>
        <p className="mt-0.5 text-[12px] leading-[15px] text-[#5b6b82]">La IA de Defensa Legal Consumidores</p>
      </div>
      <div className="lia-user-header-actions">
        <button aria-label="Nueva consulta" onClick={onNewChat ?? (() => navigate('/client', { state: { newChat: Date.now() } }))}><SquarePen size={21} className="mx-auto" /></button>
        <NativePushNotificationBell items={notices.items} isLoading={notices.isLoading} error={notices.error} onMarkRead={notices.markRead} onMarkAllRead={notices.markAllRead} />
        <div ref={account}><UserMenu isCollapsed /></div>
      </div>
    </header>
    <main className="lia-user-content">{children}</main>
    {footer && <div className="shrink-0">{footer}</div>}
    {!hideFooter && <>
      <div className="mx-auto w-full max-w-[850px] px-4 pb-3"><button className="lia-user-primary w-full" onClick={() => setContactOpen(true)}>Hablar con un abogado</button></div>
      <nav className="lia-user-nav" aria-label="Navegación principal">
        <NavLink to="/client" end><Sparkles size={22} />LIA</NavLink>
        <NavLink to="/client/consultas"><MessagesSquare size={22} />Mis consultas</NavLink>
        <NavLink to="/client/utilities"><BriefcaseBusiness size={22} />Utilidades</NavLink>
      </nav>
    </>}
    {contactOpen && <LawyerContactForm onClose={() => setContactOpen(false)} />}
  </div>;
}
