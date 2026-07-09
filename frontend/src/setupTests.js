import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement IntersectionObserver (used by the scroll-reveal
// effect in Home.jsx/Tramites.jsx). Stub it so components that call it in a
// useEffect don't crash under test; the reveal behavior itself isn't
// exercised by these tests.
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
