/**
 * errorReporting.ts
 *
 * Centralized client-side error reporting utility.
 *
 * Current behaviour: structured console.error output with full diagnostic
 * context (userAgent, URL, timestamp, error details).
 *
 * TO CONNECT A REAL BACKEND:
 *   Replace the `_sendToBackend` stub below with a real fetch call, e.g.:
 *
 *     fetch('/api/client-error', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(payload),
 *       keepalive: true,   // ensures the request completes even if page unloads
 *     }).catch(() => { /* swallow network errors *\/ });
 *
 *   Or use navigator.sendBeacon for fire-and-forget:
 *     navigator.sendBeacon('/api/client-error', JSON.stringify(payload));
 *
 *   Or forward to a service like Sentry / LogRocket / Datadog.
 */

export interface ErrorPayload {
  timestamp: string;
  url: string;
  userAgent: string;
  message: string;
  stack?: string;
  context?: string;
  extra?: Record<string, unknown>;
}

function buildPayload(
  error: unknown,
  context?: string,
  extra?: Record<string, unknown>,
): ErrorPayload {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
      ? error
      : JSON.stringify(error);

  const stack = error instanceof Error ? error.stack : undefined;

  return {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    message,
    stack,
    context,
    extra,
  };
}

// ── Internal send stub (replace with real backend call) ────────────────────

function _sendToBackend(_payload: ErrorPayload): void {
  // TODO: replace with fetch('/api/client-error', { method: 'POST', body: JSON.stringify(_payload), keepalive: true })
  // or navigator.sendBeacon('/api/client-error', JSON.stringify(_payload))
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Report any caught error with optional context label and extra metadata.
 * Always safe to call — never throws.
 */
export function reportClientError(
  error: unknown,
  context?: string,
  extra?: Record<string, unknown>,
): void {
  try {
    const payload = buildPayload(error, context, extra);

    // Structured console output for devtools / Vercel runtime logs
    console.error(
      '[ClientError]',
      context ?? 'uncaught',
      '|',
      payload.message,
      '\n  URL:', payload.url,
      '\n  UA:', payload.userAgent,
      '\n  Time:', payload.timestamp,
      payload.stack ? '\n  Stack: ' + payload.stack : '',
    );

    _sendToBackend(payload);
  } catch {
    // If the reporter itself throws, swallow silently to avoid infinite loops
  }
}

/**
 * Log a diagnostic info message (not an error, but useful for tracing startup).
 * Only logs in development or when VITE_DEBUG_LOGGING is set.
 */
export function reportDiagnostic(label: string, data?: Record<string, unknown>): void {
  try {
    if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_LOGGING) {
      console.info('[Diagnostic]', label, data ?? '');
    }
  } catch {
    // swallow
  }
}

// ── Startup health checks ───────────────────────────────────────────────────

export interface HealthCheckResult {
  ok: boolean;
  issues: string[];
}

/**
 * Run lightweight startup checks and report any anomalies.
 * Call once near the top of main.tsx before ReactDOM.createRoot.
 */
export function runStartupHealthChecks(): HealthCheckResult {
  const issues: string[] = [];

  // 1. Verify root element exists
  if (!document.getElementById('root')) {
    issues.push('Root element #root not found in DOM');
  }

  // 2. Check localStorage availability
  try {
    const testKey = '__asas_ls_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
  } catch {
    issues.push('localStorage is unavailable (private browsing or quota exceeded)');
  }

  // 3. Detect very old Safari versions that lack crucial APIs
  const ua = navigator.userAgent;
  const safariVersionMatch = ua.match(/Version\/(\d+).*Safari/);
  if (safariVersionMatch) {
    const safariMajor = parseInt(safariVersionMatch[1], 10);
    if (safariMajor < 14) {
      issues.push(`Outdated Safari detected (Version/${safariMajor}). Some features may not work.`);
    }
  }

  // 4. Check for module script support (belt-and-suspenders: if nomodule shim
  //    somehow ran on a modern browser, imports might be broken)
  if (typeof Promise === 'undefined') {
    issues.push('Promise is not defined — JavaScript environment too old');
  }

  const result: HealthCheckResult = { ok: issues.length === 0, issues };

  if (!result.ok) {
    reportClientError(
      new Error('Startup health check failed: ' + issues.join('; ')),
      'startup-health-check',
      { issues },
    );
  } else {
    reportDiagnostic('Startup health checks passed', {
      ua: navigator.userAgent.slice(0, 120),
      url: window.location.href,
    });
  }

  return result;
}
