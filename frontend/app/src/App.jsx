import React, { useState, useLayoutEffect } from "react";
import {
  NavLink,
  Routes,
  Route,
  Link,
  useLocation,
  useMatch,
  useNavigate,
} from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import { demoEnabled, demoOnly } from "./api.js";
import AppConversation from "./AppConversation.jsx";
import ConnectedMessages, { ConversationHome } from "./ConnectedMessages.jsx";
import { conversationsEnabled } from "./conversationApi.js";
import Login from "./Login.jsx";
import { backNavigation, accessState, navigationState } from "./navigation.js";
import Register from "./Register.jsx";
import DemoCheckout from "./DemoCheckout.jsx";
import DemoInfo from "./DemoInfo.jsx";
import Icon from "./Icon.jsx";
import Assistant from "./Assistant.jsx";
import PlatformChat from "./PlatformChat.jsx";
import Services from "./Services.jsx";
import Account from "./Account.jsx";
import AccountMenu from "./AccountMenu.jsx";
import LegalPage from "./LegalPage.jsx";
import { legalDocuments } from "./legalContent.js";
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
  const navigate = useNavigate();
  const connected = conversationsEnabled();
  const [sheet, setSheet] = useState(null);
  const [assistantReset, setAssistantReset] = useState(0);
  useLayoutEffect(() => {
    const main = document.getElementById("main");
    if (main) main.scrollTop = 0;
  }, [location.pathname]);
  const onContact = () => setSheet("contact");
  const hasNotifications = app.data.notifications.some((item) => !item.leida);
  const managerChat = location.pathname === "/mensajes/gestor";
  const authScreen =
    ["/acceso", "/registro"].includes(location.pathname) ||
    (app.mode === "visitante" &&
      (location.pathname === "/cuenta" ||
        (location.pathname === "/" && demoOnly()) ||
        (connected && location.pathname === "/mensajes")));
  const legalKind = location.pathname.startsWith("/legal/")
    ? location.pathname.slice(7)
    : null;
  const legalDocument = legalDocuments[legalKind];
  const back = backNavigation(
    location,
    legalDocument
      ? "/acceso"
      : location.pathname.startsWith("/tramites/")
        ? "/tramites"
        : managerChat
          ? "/mensajes"
          : location.pathname === "/checkout-demo"
            ? "/servicios"
            : "/",
  );
  const secondaryScreen = ![
    "/",
    "/tramites",
    "/mensajes",
    "/servicios",
  ].includes(location.pathname);
  const contextualBack = (
    <Link
      className="icon-btn"
      data-app-back
      to={back.to}
      state={back.state}
      replace
      aria-label={back.label}
    >
      <Icon name="back" size={22} />
    </Link>
  );
  const assistantChat =
    (connected && location.pathname === "/lidia/conversacion") ||
    (location.pathname === "/" &&
      app.mode === "demo" &&
      !!app.data.assistantState?.messages?.length);
  function returnToLidIA() {
    if (connected && app.mode !== "demo") {
      navigate("/");
      return;
    }
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
      {legalDocument ? (
        <header className="legal-header">
          <Link
            className="icon-btn"
            data-app-back
            to={back.to}
            state={back.state}
            replace
            aria-label="Volver"
          >
            <Icon name="back" />
          </Link>
          <div>
            <span>
              gestadia<b>.</b>
            </span>
            <p>{legalDocument.title}</p>
          </div>
        </header>
      ) : validationRoute ? (
        <header className="validation-header">
          {contextualBack}
          <div>
            {validationExpediente && (
              <span>{validationExpediente.nPedido}</span>
            )}
            <h1>Verificación de Datos y Carnet</h1>
          </div>
        </header>
      ) : assistantChat ? (
        <header className="manager-chat-header">
          {app.mode === "demo" && location.pathname === "/" ? (
            <button
              className="icon-btn"
              data-app-back
              aria-label={back.label}
              onClick={() => {
                returnToLidIA();
                if (back.to !== "/")
                  navigate(back.to, { state: back.state, replace: true });
              }}
            >
              <Icon name="back" size={20} />
            </button>
          ) : (
            contextualBack
          )}
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
          {contextualBack}
          <h1>
            {connected && app.mode !== "demo" && !app.isClient
              ? "Habla con Gestadia"
              : "Habla con tu gestor"}
          </h1>
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
          {(secondaryScreen || (authScreen && location.pathname !== "/")) &&
            contextualBack}
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
            <button
              className="icon-btn"
              aria-label="Mi cuenta"
              aria-haspopup="dialog"
              aria-expanded={sheet === "account"}
              onClick={() => setSheet("account")}
            >
              <Icon name="user" />
            </button>
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
              <Link to="/acceso" state={accessState(location)}>
                Entrar al portal
              </Link>
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
                ) : connected ? (
                  <ConversationHome />
                ) : (
                  <PlatformChat onContact={onContact} />
                )
              }
            />
            <Route
              path="/lidia/conversacion"
              element={
                connected ? (
                  <AppConversation purpose="sondeo" />
                ) : (
                  <Link to="/">Volver a LidIA</Link>
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
            {Object.keys(legalDocuments).map((kind) => (
              <Route
                key={kind}
                path={`/legal/${kind}`}
                element={<LegalPage key={kind} kind={kind} />}
              />
            ))}
            <Route
              path="/cuenta"
              element={
                <Account key={`${app.mode}-${app.data.profile?.id || ""}`} />
              }
            />
            <Route path="/tramites" element={<Expedientes />} />
            <Route path="/tramites/:id" element={<ExpedienteDetalle />} />
            <Route
              path="/mensajes"
              element={
                connected && app.mode !== "demo" ? (
                  app.mode === "real" ? (
                    <ConnectedMessages key={app.data.profile?.id} />
                  ) : (
                    <Login />
                  )
                ) : (
                  <Messages onContact={onContact} />
                )
              }
            />
            <Route
              path="/mensajes/gestor"
              element={
                app.mode === "demo" ? (
                  <ManagerChat onContact={onContact} />
                ) : connected ? (
                  <AppConversation purpose="atencion" />
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
      {!legalDocument && !authScreen && (
        <footer className="app-footer">
          {!["/servicios", "/cuenta"].includes(location.pathname) &&
            !(
              location.pathname === "/mensajes" &&
              connected &&
              app.mode === "real"
            ) &&
            !validationRoute && (
              <div className="footer-actions">
                {!managerChat && !assistantChat && (
                  <button className="contact-cta" onClick={onContact}>
                    <span>Hablar con un gestor</span>
                  </button>
                )}
                {((location.pathname === "/" && app.mode === "demo") ||
                  (connected && assistantChat)) && (
                  <div id="lidia-composer" className="footer-lidia-composer" />
                )}
                {managerChat &&
                  ((app.mode === "demo" && app.isClient) ||
                    (connected && app.mode === "real")) && (
                    <div
                      id="manager-composer"
                      className="footer-lidia-composer"
                    />
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
                  state={
                    to === "/mensajes" && connected && app.mode === "visitante"
                      ? navigationState(location)
                      : null
                  }
                  onClick={
                    to === "/" && assistantChat ? returnToLidIA : undefined
                  }
                  className={({ isActive }) =>
                    isActive || (to === "/" && assistantChat) ? "active" : ""
                  }
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
      {sheet === "account" && <AccountMenu onClose={() => setSheet(null)} />}
      {sheet === "notifications" && (
        <Notifications onClose={() => setSheet(null)} />
      )}
    </div>
  );
}
