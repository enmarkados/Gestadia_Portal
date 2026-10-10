import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, BrowserRouter } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext.jsx";
import { PluginWebProvider } from "./PluginWebContext.jsx";
import App from "./App.jsx";
import {
  isNative,
  loadNativeConfig,
  setupNativeNavigation,
  setupNativeKeyboard,
  finishSplash,
} from "./native.js";
import { conversationsEnabled } from "./conversationApi.js";
import { setupSocialReturn } from "./social-auth.js";
import { initializeNativeSession } from "./sessionStorage.js";
import "./app.css";
class ErrorBoundary extends React.Component {
  state = {
    failed: false,
  };
  static getDerivedStateFromError() {
    return {
      failed: true,
    };
  }
  render() {
    return this.state.failed ? (
      <main className="empty">
        <h1>No se pudo abrir esta pantalla</h1>
        <p>Recarga la app para volver a intentarlo.</p>
        <button
          className="btn primary"
          onClick={() => window.location.reload()}
        >
          Recargar
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function ConnectedApp() {
  const { mode, data } = useApp();
  React.useEffect(() => {
    finishSplash().catch(() => {});
  }, []);
  return (
    <PluginWebProvider
      key={`${mode}:${data.profile?.id || "visitor"}`}
      identity={`${mode}:${data.profile?.id || "visitor"}`}
      enabled={
        !conversationsEnabled() &&
        (mode === "visitante" || (mode === "real" && Boolean(data.profile?.id)))
      }
    >
      <App />
    </PluginWebProvider>
  );
}
await loadNativeConfig();
await initializeNativeSession();
await setupNativeKeyboard();
setupNativeNavigation();
await setupSocialReturn();
const GestadiaRouter = isNative() ? HashRouter : BrowserRouter;
createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <GestadiaRouter>
      <AppProvider>
        <ConnectedApp />
      </AppProvider>
    </GestadiaRouter>
  </ErrorBoundary>,
);
