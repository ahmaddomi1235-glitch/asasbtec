import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import DiagPage from './components/DiagPage.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { reportClientError, runStartupHealthChecks } from './utils/errorReporting.ts'
import './index.css'

// ── Global error listeners ────────────────────────────────────────────────────
// Registered BEFORE React mounts to catch startup failures before ErrorBoundary.

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

// ── Network failure classifier ────────────────────────────────────────────────
// Listens for resource load failures (script/link/img) and classifies them.

document.addEventListener('error', (event) => {
  const target = event.target as HTMLElement | null;
  if (!target || !('src' in target || 'href' in target)) return;

  const url = ('src' in target ? (target as HTMLScriptElement).src : (target as HTMLLinkElement).href) || 'unknown';
  const tag = target.tagName?.toLowerCase() ?? 'unknown';

  // Classify failure type
  let category = 'resource-load-failure';
  if (url.includes('googleapis.com') || url.includes('gstatic.com')) {
    category = 'google-fonts-blocked';
  } else if (url.includes('vercel.app') || url.includes(window.location.hostname)) {
    category = 'same-origin-asset-failure';
  }

  reportClientError(
    new Error(`Resource failed to load: ${url}`),
    category,
    { tag, url },
  );
}, true /* capture phase — required for resource errors */);

// ── Startup health checks ────────────────────────────────────────────────────

runStartupHealthChecks();

// ── Cancel the HTML-level load-failure timer — JS executed successfully ───────

if (typeof window.__cancelLoadTimer === 'function') {
  window.__cancelLoadTimer();
}

// ── Route detection — render /diag without React Router ──────────────────────
// The SPA rewrite forwards /diag → index.html; we detect it here and render
// DiagPage instead of App. No React Router dependency needed.

const isDiagRoute = window.location.pathname === '/diag' ||
                    window.location.pathname === '/diag/';

// ── Mount React ──────────────────────────────────────────────────────────────

const rootEl = document.getElementById('root');

if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <ErrorBoundary>
        {isDiagRoute ? <DiagPage /> : <App />}
      </ErrorBoundary>
    </React.StrictMode>,
  );
} else {
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
