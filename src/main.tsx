import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { reportClientError, runStartupHealthChecks } from './utils/errorReporting.ts'
import './index.css'

// ── Global error listeners ────────────────────────────────────────────────────
// These must be registered BEFORE React mounts so we catch any startup failures
// that occur before the ErrorBoundary is active.

window.addEventListener('error', (event: ErrorEvent) => {
  reportClientError(event.error ?? event.message, 'window.onerror', {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  reportClientError(event.reason, 'unhandledrejection');
});

// ── Startup health checks ────────────────────────────────────────────────────

runStartupHealthChecks();

// ── Cancel the HTML-level load-failure timer — JS has executed successfully ──

if (typeof window.__cancelLoadTimer === 'function') {
  window.__cancelLoadTimer();
}

// ── Mount React ──────────────────────────────────────────────────────────────

const rootEl = document.getElementById('root');

if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
} else {
  // Root element missing — report and show a visible error instead of blank page
  reportClientError(new Error('#root element not found'), 'mount');
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
                background:#EEF3F7;font-family:Arial,sans-serif;direction:rtl;text-align:center;padding:24px;">
      <div style="background:#fff;border-radius:16px;padding:32px 24px;max-width:360px;
                  box-shadow:0 4px 24px rgba(0,0,0,0.1);">
        <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
        <h2 style="font-size:18px;color:#1A2D3E;margin:0 0 12px;">تعذّر تحميل التطبيق</h2>
        <p style="font-size:13px;color:#4A6170;margin:0 0 20px;">
          حدث خطأ غير متوقع. جرّب تحديث الصفحة أو فتحها في نافذة خاصة.
        </p>
        <button onclick="window.location.reload()"
          style="background:#2F5673;color:#fff;border:none;border-radius:999px;
                 padding:12px 28px;font-size:14px;font-weight:700;cursor:pointer;">
          إعادة المحاولة
        </button>
      </div>
    </div>`;
}
