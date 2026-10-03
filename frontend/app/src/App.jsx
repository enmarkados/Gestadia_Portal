import React, { useState, useLayoutEffect } from "react";
import {
  NavLink,
  Routes,
  Route,
  Link,
  useLocation,
  useMatch,
} from "react-router-dom";
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
  const [assistantReset, setAssistantReset] = useState(0);
  useLayoutEffect(() => {
    const main = document.getElementById("main");
    if (main) main.scrollTop = 0;
  }, [location.pathname]);
  const onContact = () => setSheet("contact");
  const hasNotifications = app.data.notifications.some((item) => !item.leida);
  const managerChat = location.pathname === "/mensajes/gestor";
  const assistantChat =
    location.pathname === "/" &&
    app.mode === "demo" &&
    !!app.data.assistantState?.messages?.length;
  function returnToLidIA() {
    app.setData((old) => ({
      ...old,
      assistantState: { topic: null, answers: {}, messages: [] },
    }));
    setAssistantReset((old) => old + 1);
  }
  const validationRoute = useMatch("/tramites/:id");
  const validationExpediente = app.data.expedientes.find(
    (item) => item.id === validationRoute?.params.id,
  );
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
      {validationRoute ? (
        <header className="validation-header">
          <Link
            className="icon-btn"
            to="/mensajes/gestor"
            aria-label="Volver al chat del gestor"
          >
            <Icon name="back" size={22} />
          </Link>
          <div>
            {validationExpediente && (
              <span>{validationExpediente.nPedido}</span>
            )}
            <h1>Verificación de Datos y Carnet</h1>
          </div>
        </header>
      ) : assistantChat ? (
        <header className="manager-chat-header">
          <button
            className="icon-btn"
            aria-label="Volver a LidIA"
            onClick={returnToLidIA}
          >
            <Icon name="back" size={20} />
          </button>
          <h1>Habla con LidIA</h1>
          <button
            className="icon-btn"
            aria-label="Solicitar llamada"
            onClick={onContact}
          >
            <Icon name="phone" size={18} />
          </button>
        </header>
      ) : managerChat ? (
        <header className="manager-chat-header">
          <Link
            className="icon-btn"
            to="/mensajes"
            aria-label="Volver a mensajes"
          >
            <Icon name="back" size={20} />
          </Link>
          <h1>Habla con tu gestor</h1>
          <button
            className="icon-btn"
            aria-label="Solicitar llamada"
            onClick={onContact}
          >
            <Icon name="phone" size={18} />
          </button>
        </header>
      ) : (
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
                hasNotifications
                  ? "Notificaciones pendientes"
                  : "Notificaciones"
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
      )}
      {app.mode === "visitante" && demoEnabled() && !demoOnly() ? (
        <div className="mode-bar">
          <span>Descubre Gestadia</span>
          <button onClick={() => app.startDemo()}>Probar demo</button>
        </div>
      ) : null}
      <main
        id="main"
        tabIndex="-1"
        className={`app-main ${validationRoute ? "validation-main" : ""}`}
      >
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
                  <Assistant key={assistantReset} onContact={onContact} />
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
          {location.pathname !== "/servicios" && !validationRoute && (
            <div className="footer-actions">
              {!managerChat && !assistantChat && (
                <button className="contact-cta" onClick={onContact}>
                  <span>Hablar con un gestor</span>
                </button>
              )}
              {location.pathname === "/" && app.mode === "demo" && (
                <div id="lidia-composer" className="footer-lidia-composer" />
              )}
              {managerChat && app.mode === "demo" && app.isClient && (
                <div id="manager-composer" className="footer-lidia-composer" />
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
                  onClick={
                    to === "/" && assistantChat ? returnToLidIA : undefined
                  }
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
