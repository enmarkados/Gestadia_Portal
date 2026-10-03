import React, { useState, useLayoutEffect } from "react";
import { NavLink, Routes, Route, Link, useLocation } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { demoEnabled, demoOnly } from "./api.js";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import DemoCheckout from "./DemoCheckout.jsx";
import DemoInfo from "./DemoInfo.jsx";
import Icon from "./Icon.jsx";
import Assistant from "./Assistant.jsx";
import PlatformChat from "./PlatformChat.jsx";
import Services from "./Services.jsx";
import Account from "./Account.jsx";
import Expedientes, { ExpedienteDetalle } from "./Expedientes.jsx";
import Messages, { ManagerChat } from "./Messages.jsx";
import Contact from "./Contact.jsx";
import Notifications from "./Notifications.jsx";
const TABS = [
  ["/", "LidIA", "spark"],
  ["/tramites", "Trámites", "clipboard"],
  ["/mensajes", "Mensajes", "message"],
  ["/servicios", "Servicios", "bag"],
];
export default function App() {
  const app = useApp();
  const location = useLocation();
  const [sheet, setSheet] = useState(null);
  useLayoutEffect(() => {
    const main = document.getElementById("main");
    if (main) main.scrollTop = 0;
  }, [location.pathname]);
  const onContact = () => setSheet("contact");
  const hasNotifications = app.data.notifications.some((item) => !item.leida);
  return (
    <div className="app-shell">
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main").focus();
        }}
      >
        Ir al contenido
      </a>
      <header className="app-header">
        <Link to="/" className="brand" aria-label="Gestadia, inicio">
          <span>
            gestadia<b>.</b>
          </span>
          <small>Trámites DGT Online</small>
        </Link>
        <div className="header-actions">
          <button
            className="icon-btn"
            onClick={() => setSheet("notifications")}
            aria-label={
              hasNotifications ? "Notificaciones pendientes" : "Notificaciones"
            }
          >
            <Icon name="bell" />
            {hasNotifications && <span className="notification-dot" />}
          </button>
          <Link to="/cuenta" className="icon-btn" aria-label="Mi cuenta">
            <Icon name="user" />
          </Link>
        </div>
      </header>
      {app.mode === "visitante" && demoEnabled() && !demoOnly() ? (
        <div className="mode-bar">
          <span>Descubre Gestadia</span>
          <button onClick={() => app.startDemo()}>Probar demo</button>
        </div>
      ) : null}
      <main id="main" tabIndex="-1" className="app-main">
        {app.error && (
          <div className="error" role="alert">
            <p>{app.error}</p>
            {app.mode === "real" ? (
              <button className="text-btn" onClick={app.refresh}>
                Reintentar
              </button>
            ) : (
              <Link to="/cuenta">Entrar al portal</Link>
            )}
          </div>
        )}
        {app.loading ? (
          <div className="empty" role="status">
            Cargando tu portal…
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                app.mode === "demo" ? (
                  <Assistant onContact={onContact} />
                ) : demoOnly() ? (
                  <Login />
                ) : (
                  <PlatformChat onContact={onContact} />
                )
              }
            />
            <Route
              path="/servicios"
              element={<Services key={location.key} />}
            />
            <Route path="/acceso" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route path="/checkout-demo" element={<DemoCheckout />} />
            <Route path="/informacion" element={<DemoInfo />} />
            <Route
              path="/cuenta"
              element={
                <Account key={`${app.mode}-${app.data.profile?.id || ""}`} />
              }
            />
            <Route
              path="/tramites"
              element={<Expedientes onContact={onContact} />}
            />
            <Route path="/tramites/:id" element={<ExpedienteDetalle />} />
            <Route
              path="/mensajes"
              element={<Messages onContact={onContact} />}
            />
            <Route
              path="/mensajes/gestor"
              element={
                app.mode === "demo" ? (
                  <ManagerChat onContact={onContact} />
                ) : (
                  <PlatformChat onContact={onContact} manager />
                )
              }
            />
            <Route
              path="*"
              element={
                <section>
                  <h1>Esta pantalla no está disponible</h1>
                  <Link className="btn primary" to="/">
                    Volver al inicio
                  </Link>
                </section>
              }
            />
          </Routes>
        )}
      </main>
      {!["/acceso", "/registro"].includes(location.pathname) && (
        <footer className="app-footer">
          {location.pathname !== "/servicios" && (
            <div className="footer-actions">
              <button className="contact-cta" onClick={onContact}>
                <span>Hablar con un gestor</span>
              </button>
              {location.pathname === "/" && app.mode === "demo" && (
                <div id="lidia-composer" className="footer-lidia-composer" />
              )}
            </div>
          )}
          <div className="dock-zone">
            <nav className="dock" aria-label="Navegación principal">
              {TABS.map(([to, label, icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <Icon name={icon} size={21} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </footer>
      )}
      {sheet === "contact" && <Contact onClose={() => setSheet(null)} />}
      {sheet === "notifications" && (
        <Notifications onClose={() => setSheet(null)} />
      )}
    </div>
  );
}
