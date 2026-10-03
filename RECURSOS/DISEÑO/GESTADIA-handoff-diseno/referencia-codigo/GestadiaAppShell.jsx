import React, { useState } from 'react';
import { Sparkles, MessageSquare, ShoppingBag, ClipboardList, Bell, User, ChevronLeft } from 'lucide-react';
import { GestorContactSheet } from './GestorContactSheet';

/**
 * GestadiaAppShell
 * Shell móvil unificado de Gestadia:
 * - Cabecera fija oscura (#181818) con logotipo oficial "gestadia." blanco y punto rojo.
 * - Acciones de cabecera: Notificaciones (con aviso de requerimiento pendiente) y Mi Cuenta.
 * - Área central desplazable con soporte de safe-area.
 * - Botón inferior: "Hablar con un gestor".
 * - Dock inferior ergonómico de 4 pestañas (LidIA, Mensajes, Servicios, Mis Trámites) con indicador rojo DGT.
 */
export function GestadiaAppShell({
  children,
  activeTab = 'asistente',
  onTabChange,
  onNotificationsClick,
  back = false,
  onBack,
  title,
  subtitle,
  hideFloatingAction = false,
  hasAssignedGestor = true,
  hasNotifications = true,
  onOpenChat
}) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="gestadia-user-shell">
      {/* Cabecera Móvil y Responsive */}
      <header className="gestadia-user-header" role="banner">
        <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {back && (
            <button
              type="button"
              className="gestadia-icon-btn"
              onClick={onBack || (() => window.history.back())}
              aria-label="Volver atrás"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div>
            <div className="gestadia-brand-title">
              {title || (
                <>
                  gestadia<span>.</span>
                </>
              )}
            </div>
            <p className="gestadia-brand-subtitle">
              {subtitle || 'Trámites DGT Online'}
            </p>
          </div>
        </div>

        {/* Acciones de Cabecera (Campana de Notificaciones y Mi Cuenta) */}
        <div className="gestadia-user-header-actions">
          <button
            type="button"
            className="gestadia-icon-btn"
            onClick={onNotificationsClick || (() => alert(hasNotifications ? 'Notificaciones · Tienes 1 requerimiento pendiente sobre tu expediente GST-202607-97389' : 'Notificaciones · Estás al día. Sin notificaciones pendientes.'))}
            aria-label="Notificaciones"
            title="Notificaciones"
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            {hasNotifications && (
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  backgroundColor: '#C0392B',
                  borderRadius: '50%'
                }}
              />
            )}
          </button>
          <button
            type="button"
            className="gestadia-icon-btn"
            aria-label="Perfil y cuenta de usuario"
            title="Mi cuenta"
            onClick={() => alert('Área de cliente · Gonzalo Villanova Alvarez')}
          >
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Contenido Desplazable */}
      <main className="gestadia-user-content" role="main">
        {children}
      </main>

      {/* Botón Flotante / Inferior de Contacto Directo con Gestor */}
      {!hideFloatingAction && (
        <div style={{ maxWidth: 850, margin: '0 auto', width: '100%', padding: '0 16px 10px' }}>
          <button
            type="button"
            className="gestadia-user-primary red-variant"
            style={{ width: '100%' }}
            onClick={() => setIsContactOpen(true)}
          >
            Hablar con un gestor
          </button>
        </div>
      )}

      {/* Dock de Navegación Móvil (4 Pestañas: LidIA, Trámites, Mensajes, Servicios) */}
      <nav className="gestadia-user-nav" aria-label="Navegación principal">
        <button
          type="button"
          className={`nav-item ${activeTab === 'asistente' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('asistente')}
          aria-current={activeTab === 'asistente' ? 'page' : undefined}
        >
          <Sparkles size={20} />
          <span>LidIA</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'tramites' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('tramites')}
          aria-current={activeTab === 'tramites' ? 'page' : undefined}
        >
          <ClipboardList size={20} />
          <span>Trámites</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'mensajes' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('mensajes')}
          aria-current={activeTab === 'mensajes' ? 'page' : undefined}
        >
          <MessageSquare size={20} />
          <span>Mensajes</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'servicios' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('servicios')}
          aria-current={activeTab === 'servicios' ? 'page' : undefined}
        >
          <ShoppingBag size={20} />
          <span>Servicios</span>
        </button>
      </nav>

      {/* Hoja Inferior de Contacto */}
      {isContactOpen && (
        <GestorContactSheet
          hasAssignedGestor={hasAssignedGestor}
          onClose={() => setIsContactOpen(false)}
          onOpenChat={onOpenChat}
        />
      )}
    </div>
  );
}
export default GestadiaAppShell;
